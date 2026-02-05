using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.SignalR;
using Microsoft.EntityFrameworkCore;
using SupportHub.Api.Data;
using SupportHub.Api.Dtos;
using SupportHub.Api.Hubs;
using SupportHub.Api.Models;
using SupportHub.Api.Services;

namespace SupportHub.Api.Controllers;

[ApiController]
[Route("inbound")]
public class InboundController : ControllerBase
{
    private readonly AppDbContext _db;
    private readonly RoutingEngine _router;
    private readonly IHubContext<SupportHubHub> _hub;

    public InboundController(AppDbContext db, RoutingEngine router, IHubContext<SupportHubHub> hub)
    {
        _db = db;
        _router = router;
        _hub = hub;
    }

    [HttpPost("chat")]
    public Task<IActionResult> Chat([FromBody] InboundMessageRequest req) => HandleInbound(Channel.Chat, req);

    [HttpPost("email")]
    public Task<IActionResult> Email([FromBody] InboundMessageRequest req) => HandleInbound(Channel.Email, req);

    [HttpPost("sms")]
    public Task<IActionResult> Sms([FromBody] InboundMessageRequest req) => HandleInbound(Channel.SMS, req);

    private async Task<IActionResult> HandleInbound(Channel channel, InboundMessageRequest req)
    {
        var now = req.Timestamp?.ToUniversalTime() ?? DateTime.UtcNow;

        // Upsert customer (simple: by email if present else phone)
        Customer? customer = null;
        if (!string.IsNullOrWhiteSpace(req.Customer.Email))
            customer = await _db.Customers.FirstOrDefaultAsync(c => c.Email == req.Customer.Email);
        if (customer == null && !string.IsNullOrWhiteSpace(req.Customer.Phone))
            customer = await _db.Customers.FirstOrDefaultAsync(c => c.Phone == req.Customer.Phone);

        if (customer == null)
        {
            customer = new Customer
            {
                Name = req.Customer.Name ?? "Unknown",
                Email = req.Customer.Email ?? "",
                Phone = req.Customer.Phone ?? "",
                IsVip = req.Customer.IsVip
            };
            _db.Customers.Add(customer);
            await _db.SaveChangesAsync();
        }
        else
        {
            customer.Name = req.Customer.Name ?? customer.Name;
            customer.IsVip = req.Customer.IsVip;
            await _db.SaveChangesAsync();
        }

        // Find existing open conversation for this customer+channel (simple)
        var convo = await _db.Conversations
            .Include(c => c.Messages)
            .Include(c => c.Ticket)
            .ThenInclude(t => t!.Customer)
            .FirstOrDefaultAsync(c =>
                c.CustomerId == customer.Id &&
                c.Channel == channel &&
                c.Ticket != null &&
                c.Ticket.Status != TicketStatus.Closed &&
                c.Ticket.Status != TicketStatus.Resolved);

        if (convo == null)
        {
            convo = new Conversation
            {
                CustomerId = customer.Id,
                Channel = channel,
                Subject = req.Subject,
                CreatedAt = now,
                LastMessageAt = now
            };
            _db.Conversations.Add(convo);
            await _db.SaveChangesAsync();

            var ticket = new Ticket
            {
                ConversationId = convo.Id,
                CustomerId = customer.Id,
                Status = TicketStatus.New,
                Priority = TicketPriority.Normal,
                Category = "General",
                CreatedAt = now,
                UpdatedAt = now
            };
            _db.Tickets.Add(ticket);
            await _db.SaveChangesAsync();
        }

        // Add message
        var msg = new Message
        {
            ConversationId = convo.Id,
            Direction = Direction.Inbound,
            From = req.From,
            Body = req.Body,
            SentAt = now
        };
        _db.Messages.Add(msg);

        convo.LastMessageAt = now;
        await _db.SaveChangesAsync();

        // Load ticket with navigation for routing
        var ticketFull = await _db.Tickets
            .Include(t => t.Customer)
            .Include(t => t.Conversation)
            .FirstAsync(t => t.ConversationId == convo.Id);

        await _router.ApplyRoutingAsync(ticketFull, ticketFull.Conversation!, msg);
        await _db.SaveChangesAsync();

        // Compute simple queue position for live chat (same queue, open tickets)
        var queuePosition = 0;
        if (ticketFull.QueueId.HasValue)
        {
            queuePosition = await _db.Tickets.CountAsync(t =>
                t.QueueId == ticketFull.QueueId &&
                t.Status != TicketStatus.Closed &&
                t.Status != TicketStatus.Resolved &&
                t.CreatedAt <= ticketFull.CreatedAt);
        }

        await _hub.Clients.Groups("Supervisor").SendAsync("TicketCreatedOrUpdated", new
        {
            ticketId = ticketFull.Id
        });

        if (ticketFull.AssignedAgentUserId != null)
        {
            await _hub.Clients.Groups("Agent").SendAsync("TicketAssigned", new
            {
                ticketId = ticketFull.Id,
                agentUserId = ticketFull.AssignedAgentUserId
            });
        }

        return Ok(new { conversationId = convo.Id, ticketId = ticketFull.Id, queuePosition });
    }
}

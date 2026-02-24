using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.SignalR;
using SupportHub.Api.Data;
using SupportHub.Api.Dtos;
using SupportHub.Api.Hubs;
using SupportHub.Api.Models;

namespace SupportHub.Api.Controllers;

[ApiController]
[Route("conversations")]
[Authorize]
public class ConversationsController : ControllerBase
{
    private readonly AppDbContext _db;
    private readonly IHubContext<SupportHubHub> _hub;
    private readonly IHubContext<GuestHub> _guestHub;

    public ConversationsController(AppDbContext db, IHubContext<SupportHubHub> hub, IHubContext<GuestHub> guestHub)
    {
        _db = db;
        _hub = hub;
        _guestHub = guestHub;
    }

    [HttpPost("{conversationId:int}/messages")]
    public async Task<IActionResult> Send(int conversationId, [FromBody] SendAgentMessageRequest req)
    {
        if (string.IsNullOrWhiteSpace(req.Body))
            return BadRequest(new { message = "Body required" });

        var convo = await _db.Conversations.FirstOrDefaultAsync(c => c.Id == conversationId);
        if (convo == null) return NotFound();

        var meName = User.FindFirstValue(ClaimTypes.Name) ?? "Agent";
        var msg = new Message
        {
            ConversationId = conversationId,
            Direction = Direction.Outbound,
            From = $"agent:{meName}",
            Body = req.Body,
            SentAt = DateTime.UtcNow
        };
        _db.Messages.Add(msg);

        convo.LastMessageAt = DateTime.UtcNow;

        // bump ticket updated
        var t = await _db.Tickets.FirstOrDefaultAsync(x => x.ConversationId == conversationId);
        if (t != null)
        {
            t.UpdatedAt = DateTime.UtcNow;
            if (t.Status == TicketStatus.New) t.Status = TicketStatus.Open;
        }

        await _db.SaveChangesAsync();

        await _hub.Clients.Groups("Supervisor").SendAsync("TicketCreatedOrUpdated", new { ticketId = t?.Id });
        await _hub.Clients.Groups("Agent").SendAsync("TicketCreatedOrUpdated", new { ticketId = t?.Id });
        await _hub.Clients.Groups("Supervisor").SendAsync("ConversationMessage", new
        {
            conversationId = convo.Id,
            ticketId = t?.Id,
            body = msg.Body,
            from = msg.From,
            direction = msg.Direction.ToString(),
            sentAt = msg.SentAt
        });
        await _hub.Clients.Groups("Agent").SendAsync("ConversationMessage", new
        {
            conversationId = convo.Id,
            ticketId = t?.Id,
            body = msg.Body,
            from = msg.From,
            direction = msg.Direction.ToString(),
            sentAt = msg.SentAt
        });
        await _guestHub.Clients.Groups($"convo:{convo.Id}").SendAsync("ConversationMessage", new
        {
            conversationId = convo.Id,
            ticketId = t?.Id,
            body = msg.Body,
            from = msg.From,
            direction = msg.Direction.ToString(),
            sentAt = msg.SentAt
        });

        return Ok(new { messageId = msg.Id });
    }
}

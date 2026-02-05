using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.SignalR;
using Microsoft.EntityFrameworkCore;
using SupportHub.Api.Data;
using SupportHub.Api.Hubs;
using SupportHub.Api.Models;

namespace SupportHub.Api.Controllers;

[ApiController]
[Route("guest/conversations")]
public class GuestMessagesController : ControllerBase
{
    private readonly AppDbContext _db;
    private readonly IHubContext<SupportHubHub> _hub;
    private readonly IHubContext<GuestHub> _guestHub;

    public GuestMessagesController(AppDbContext db, IHubContext<SupportHubHub> hub, IHubContext<GuestHub> guestHub)
    {
        _db = db;
        _hub = hub;
        _guestHub = guestHub;
    }

    [HttpPost("{conversationId:int}/messages")]
    public async Task<IActionResult> Send(int conversationId, [FromBody] GuestMessageRequest req)
    {
        if (string.IsNullOrWhiteSpace(req.Body))
            return BadRequest(new { message = "Body required" });

        var convo = await _db.Conversations.FirstOrDefaultAsync(c => c.Id == conversationId);
        if (convo == null) return NotFound();

        var msg = new Message
        {
            ConversationId = conversationId,
            Direction = Direction.Inbound,
            From = "guest",
            Body = req.Body,
            SentAt = DateTime.UtcNow
        };
        _db.Messages.Add(msg);

        convo.LastMessageAt = DateTime.UtcNow;

        var t = await _db.Tickets.FirstOrDefaultAsync(x => x.ConversationId == conversationId);
        if (t != null)
        {
            t.UpdatedAt = DateTime.UtcNow;
            if (t.Status == TicketStatus.New) t.Status = TicketStatus.Open;
        }

        await _db.SaveChangesAsync();

        var payload = new
        {
            conversationId = convo.Id,
            ticketId = t?.Id,
            body = msg.Body,
            from = msg.From,
            direction = msg.Direction.ToString(),
            sentAt = msg.SentAt
        };

        await _hub.Clients.Groups("Supervisor").SendAsync("ConversationMessage", payload);
        await _hub.Clients.Groups("Agent").SendAsync("ConversationMessage", payload);
        await _guestHub.Clients.Groups($"convo:{convo.Id}").SendAsync("ConversationMessage", payload);

        return Ok(new { messageId = msg.Id });
    }
}

public record GuestMessageRequest(string Body);

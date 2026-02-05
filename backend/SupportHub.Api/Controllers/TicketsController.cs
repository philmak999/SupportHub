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
[Route("tickets")]
[Authorize]
public class TicketsController : ControllerBase
{
    private readonly AppDbContext _db;
    private readonly IHubContext<SupportHubHub> _hub;

    public TicketsController(AppDbContext db, IHubContext<SupportHubHub> hub)
    {
        _db = db;
        _hub = hub;
    }

    [HttpGet]
    public async Task<ActionResult<List<TicketListItem>>> List([FromQuery] string? assignedTo, [FromQuery] int? queueId, [FromQuery] TicketStatus? status)
    {
        var q = _db.Tickets
            .Include(t => t.Customer)
            .Include(t => t.Conversation)
            .Include(t => t.Queue)
            .Include(t => t.AssignedAgentUser)
            .AsQueryable();

        if (assignedTo == "me")
        {
            var me = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (Guid.TryParse(me, out var meId))
                q = q.Where(t => t.AssignedAgentUserId == meId);
        }

        if (queueId.HasValue) q = q.Where(t => t.QueueId == queueId.Value);
        if (status.HasValue) q = q.Where(t => t.Status == status.Value);

        var items = await q
            .OrderByDescending(t => t.UpdatedAt)
            .Take(200)
            .Select(t => new TicketListItem(
                t.Id,
                t.Customer!.Name,
                t.Conversation!.Channel.ToString(),
                t.Queue != null ? t.Queue.Name : "(unrouted)",
                t.Status.ToString(),
                t.Priority.ToString(),
                t.Category,
                t.AssignedAgentUser != null ? t.AssignedAgentUser.Name : null,
                t.CreatedAt,
                t.UpdatedAt
            ))
            .ToListAsync();

        return Ok(items);
    }

    [HttpPatch("{id:int}")]
    public async Task<IActionResult> Update(int id, [FromBody] TicketUpdateRequest req)
    {
        var t = await _db.Tickets.FirstOrDefaultAsync(x => x.Id == id);
        if (t == null) return NotFound();

        if (req.Status.HasValue) t.Status = req.Status.Value;
        if (req.Priority.HasValue) t.Priority = req.Priority.Value;
        if (req.Category != null) t.Category = req.Category;

        t.UpdatedAt = DateTime.UtcNow;
        await _db.SaveChangesAsync();

        await _hub.Clients.Groups("Supervisor").SendAsync("TicketCreatedOrUpdated", new { ticketId = t.Id });
        await _hub.Clients.Groups("Agent").SendAsync("TicketCreatedOrUpdated", new { ticketId = t.Id });
        return NoContent();
    }

    [HttpPost("{id:int}/assign")]
    [Authorize(Roles = "Supervisor,Admin")]
    public async Task<IActionResult> Assign(int id, [FromBody] AssignTicketRequest req)
    {
        var t = await _db.Tickets.Include(x => x.AssignedAgentUser).FirstOrDefaultAsync(x => x.Id == id);
        if (t == null) return NotFound();

        if (req.QueueId.HasValue) t.QueueId = req.QueueId.Value;
        if (req.AgentUserId.HasValue) t.AssignedAgentUserId = req.AgentUserId.Value;

        t.UpdatedAt = DateTime.UtcNow;
        await _db.SaveChangesAsync();

        await _hub.Clients.Groups("Supervisor").SendAsync("TicketCreatedOrUpdated", new { ticketId = t.Id });
        await _hub.Clients.Groups("Agent").SendAsync("TicketAssigned", new { ticketId = t.Id, agentUserId = t.AssignedAgentUserId });
        return NoContent();
    }

    [HttpGet("{id:int}/conversation")]
    public async Task<IActionResult> GetConversation(int id)
    {
        var t = await _db.Tickets
            .Include(x => x.Conversation)
            .ThenInclude(c => c!.Messages)
            .Include(x => x.Customer)
            .FirstOrDefaultAsync(x => x.Id == id);

        if (t == null || t.Conversation == null) return NotFound();

        return Ok(new
        {
            ticketId = t.Id,
            customer = new { t.Customer!.Name, t.Customer.Email, t.Customer.Phone, t.Customer.IsVip },
            conversationId = t.Conversation.Id,
            channel = t.Conversation.Channel.ToString(),
            subject = t.Conversation.Subject,
            messages = t.Conversation.Messages
                .OrderBy(m => m.SentAt)
                .Select(m => new { m.Id, direction = m.Direction.ToString(), m.From, m.Body, m.SentAt })
        });
    }
}

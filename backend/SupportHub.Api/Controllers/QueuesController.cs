using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SupportHub.Api.Data;

namespace SupportHub.Api.Controllers;

[ApiController]
[Route("queues")]
[Authorize]
public class QueuesController : ControllerBase
{
    private readonly AppDbContext _db;
    public QueuesController(AppDbContext db) => _db = db;

    [HttpGet]
    public async Task<IActionResult> List()
    {
        var queues = await _db.Queues
            .OrderBy(q => q.Id)
            .Select(q => new { q.Id, q.Name, q.Description })
            .ToListAsync();

        return Ok(queues);
    }

    [HttpGet("{id:int}/stats")]
    [Authorize(Roles = "Supervisor,Admin")]
    public async Task<IActionResult> Stats(int id)
    {
        var openCount = await _db.Tickets.CountAsync(t => t.QueueId == id && t.Status != Models.TicketStatus.Closed);
        var oldest = await _db.Tickets
            .Where(t => t.QueueId == id && t.Status != Models.TicketStatus.Closed)
            .OrderBy(t => t.CreatedAt)
            .Select(t => (DateTime?)t.CreatedAt)
            .FirstOrDefaultAsync();

        return Ok(new
        {
            queueId = id,
            openCount,
            oldestCreatedAt = oldest
        });
    }
}

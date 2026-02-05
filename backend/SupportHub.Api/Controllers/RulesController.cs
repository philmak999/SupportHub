using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SupportHub.Api.Data;
using SupportHub.Api.Dtos;
using SupportHub.Api.Models;

namespace SupportHub.Api.Controllers;

[ApiController]
[Route("routing-rules")]
[Authorize(Roles = "Supervisor,Admin")]
public class RulesController : ControllerBase
{
    private readonly AppDbContext _db;
    public RulesController(AppDbContext db) => _db = db;

    [HttpGet]
    public async Task<ActionResult<List<RuleDto>>> List()
    {
        var rules = await _db.RoutingRules
            .OrderBy(r => r.PriorityOrder)
            .Select(r => new RuleDto(r.Id, r.Name, r.IsEnabled, r.PriorityOrder, r.ConditionJson, r.ActionJson))
            .ToListAsync();
        return Ok(rules);
    }

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreateRuleRequest req)
    {
        var r = new RoutingRule
        {
            Name = req.Name,
            PriorityOrder = req.PriorityOrder,
            ConditionJson = req.ConditionJson,
            ActionJson = req.ActionJson,
            IsEnabled = req.IsEnabled
        };
        _db.RoutingRules.Add(r);
        await _db.SaveChangesAsync();
        return Ok(new { id = r.Id });
    }

    [HttpPatch("{id:int}")]
    public async Task<IActionResult> Update(int id, [FromBody] UpdateRuleRequest req)
    {
        var r = await _db.RoutingRules.FirstOrDefaultAsync(x => x.Id == id);
        if (r == null) return NotFound();

        if (req.Name != null) r.Name = req.Name;
        if (req.PriorityOrder.HasValue) r.PriorityOrder = req.PriorityOrder.Value;
        if (req.ConditionJson != null) r.ConditionJson = req.ConditionJson;
        if (req.ActionJson != null) r.ActionJson = req.ActionJson;
        if (req.IsEnabled.HasValue) r.IsEnabled = req.IsEnabled.Value;

        await _db.SaveChangesAsync();
        return NoContent();
    }
}

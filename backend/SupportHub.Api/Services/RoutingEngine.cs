using System.Text.Json;
using Microsoft.EntityFrameworkCore;
using SupportHub.Api.Data;
using SupportHub.Api.Models;

namespace SupportHub.Api.Services;

public record RuleCondition(List<string>? Keywords, bool? IsVip, string? Channel);
public record RuleAction(string? QueueName, string? Priority, string? Category, bool? AutoAssignAgent);

public class RoutingEngine
{
    private readonly AppDbContext _db;

    public RoutingEngine(AppDbContext db) => _db = db;

    public async Task ApplyRoutingAsync(Ticket ticket, Conversation convo, Message latestMessage)
    {
        var rules = await _db.RoutingRules
            .Where(r => r.IsEnabled)
            .OrderBy(r => r.PriorityOrder)
            .ToListAsync();

        foreach (var rule in rules)
        {
            var cond = ParseCondition(rule.ConditionJson);
            if (!Matches(cond, convo, ticket, latestMessage)) continue;

            var action = ParseAction(rule.ActionJson);
            await ApplyActionAsync(action, ticket);
            return;
        }
    }

    private static RuleCondition ParseCondition(string json)
    {
        if (string.IsNullOrWhiteSpace(json)) return new RuleCondition(null, null, null);
        using var doc = JsonDocument.Parse(json);
        var root = doc.RootElement;

        List<string>? keywords = null;
        if (root.TryGetProperty("keywords", out var kw) && kw.ValueKind == JsonValueKind.Array)
            keywords = kw.EnumerateArray().Select(x => x.GetString() ?? "").Where(s => s.Length > 0).ToList();

        bool? isVip = null;
        if (root.TryGetProperty("isVip", out var vip) && vip.ValueKind is JsonValueKind.True or JsonValueKind.False)
            isVip = vip.GetBoolean();

        string? channel = null;
        if (root.TryGetProperty("channel", out var ch) && ch.ValueKind == JsonValueKind.String)
            channel = ch.GetString();

        return new RuleCondition(keywords, isVip, channel);
    }

    private static RuleAction ParseAction(string json)
    {
        if (string.IsNullOrWhiteSpace(json)) return new RuleAction(null, null, null, null);
        using var doc = JsonDocument.Parse(json);
        var root = doc.RootElement;

        string? queueName = root.TryGetProperty("queueName", out var q) && q.ValueKind == JsonValueKind.String ? q.GetString() : null;
        string? priority = root.TryGetProperty("priority", out var p) && p.ValueKind == JsonValueKind.String ? p.GetString() : null;
        string? category = root.TryGetProperty("category", out var c) && c.ValueKind == JsonValueKind.String ? c.GetString() : null;

        bool? autoAssign = null;
        if (root.TryGetProperty("autoAssignAgent", out var a) && a.ValueKind is JsonValueKind.True or JsonValueKind.False)
            autoAssign = a.GetBoolean();

        return new RuleAction(queueName, priority, category, autoAssign);
    }

    private static bool Matches(RuleCondition cond, Conversation convo, Ticket ticket, Message latest)
    {
        // channel
        if (!string.IsNullOrWhiteSpace(cond.Channel))
        {
            if (!Enum.TryParse<Channel>(cond.Channel, ignoreCase: true, out var ch)) return false;
            if (convo.Channel != ch) return false;
        }

        // VIP
        if (cond.IsVip.HasValue)
        {
            var isVip = ticket.Customer?.IsVip ?? false;
            if (isVip != cond.IsVip.Value) return false;
        }

        // keywords
        if (cond.Keywords is { Count: > 0 })
        {
            var hay = $"{convo.Subject ?? ""}\n{latest.Body}".ToLowerInvariant();
            var any = cond.Keywords.Any(k => hay.Contains(k.ToLowerInvariant()));
            if (!any) return false;
        }

        return true; // empty condition matches all (fallback)
    }

    private async Task ApplyActionAsync(RuleAction action, Ticket ticket)
    {
        if (!string.IsNullOrWhiteSpace(action.QueueName))
        {
            var queue = await _db.Queues.FirstOrDefaultAsync(q => q.Name == action.QueueName);
            if (queue != null) ticket.QueueId = queue.Id;
        }

        if (!string.IsNullOrWhiteSpace(action.Priority) &&
            Enum.TryParse<TicketPriority>(action.Priority, true, out var pr))
            ticket.Priority = pr;

        if (!string.IsNullOrWhiteSpace(action.Category))
            ticket.Category = action.Category;

        ticket.Status = ticket.Status == TicketStatus.New ? TicketStatus.Open : ticket.Status;
        ticket.UpdatedAt = DateTime.UtcNow;

        if (action.AutoAssignAgent == true && ticket.QueueId.HasValue)
            await TryAutoAssignAgent(ticket, ticket.QueueId.Value);
    }

    private async Task TryAutoAssignAgent(Ticket ticket, int queueId)
    {
        if (ticket.AssignedAgentUserId != null) return;

        // candidates: agents mapped to queue, lowest workload, with fallbacks if none are available
        var baseQuery = _db.Agents
            .Include(a => a.User)
            .Include(a => a.AgentQueues)
            .Where(a => a.AgentQueues.Any(aq => aq.QueueId == queueId));

        var candidates = await baseQuery
            .Where(a => a.Presence == Presence.Available && a.ActiveTicketCount < a.MaxActiveTickets)
            .OrderBy(a => a.ActiveTicketCount)
            .ThenBy(a => a.User!.Name)
            .ToListAsync();

        if (candidates.Count == 0)
        {
            candidates = await baseQuery
                .Where(a => a.ActiveTicketCount < a.MaxActiveTickets)
                .OrderBy(a => a.ActiveTicketCount)
                .ThenBy(a => a.User!.Name)
                .ToListAsync();
        }

        if (candidates.Count == 0)
        {
            candidates = await baseQuery
                .OrderBy(a => a.ActiveTicketCount)
                .ThenBy(a => a.User!.Name)
                .ToListAsync();
        }

        var chosen = candidates.FirstOrDefault();
        if (chosen == null) return;

        ticket.AssignedAgentUserId = chosen.UserId;
        chosen.ActiveTicketCount += 1;
    }
}

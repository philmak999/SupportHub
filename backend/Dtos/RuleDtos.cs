namespace SupportHub.Api.Dtos;

public record RuleDto(int Id, string Name, bool IsEnabled, int PriorityOrder, string ConditionJson, string ActionJson);
public record CreateRuleRequest(string Name, int PriorityOrder, string ConditionJson, string ActionJson, bool IsEnabled);
public record UpdateRuleRequest(string? Name, int? PriorityOrder, string? ConditionJson, string? ActionJson, bool? IsEnabled);

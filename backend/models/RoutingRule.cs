using System.ComponentModel.DataAnnotations;

namespace SupportHub.Api.Models;

public class RoutingRule
{
    [Key] public int Id { get; set; }
    [Required] public string Name { get; set; } = "";
    public bool IsEnabled { get; set; } = true;
    public int PriorityOrder { get; set; } = 0;

    // JSON strings for configurable rules
    public string ConditionJson { get; set; } = "{}";
    public string ActionJson { get; set; } = "{}";
}

using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace SupportHub.Api.Models;

public class Agent
{
    [Key, ForeignKey(nameof(User))]
    public Guid UserId { get; set; }

    public Presence Presence { get; set; } = Presence.Available;
    public int MaxActiveTickets { get; set; } = 5;
    public int ActiveTicketCount { get; set; } = 0;

    // For simplicity: comma-separated skills
    public string SkillsCsv { get; set; } = "";

    public User? User { get; set; }
    public ICollection<AgentQueue> AgentQueues { get; set; } = new List<AgentQueue>();
}

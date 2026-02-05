using System.ComponentModel.DataAnnotations;

namespace SupportHub.Api.Models;

public class Queue
{
    [Key] public int Id { get; set; }
    [Required] public string Name { get; set; } = "";
    public string Description { get; set; } = "";

    public ICollection<AgentQueue> AgentQueues { get; set; } = new List<AgentQueue>();
    public ICollection<Ticket> Tickets { get; set; } = new List<Ticket>();
}

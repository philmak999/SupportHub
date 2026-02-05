using System.ComponentModel.DataAnnotations;

namespace SupportHub.Api.Models;

public class Ticket
{
    [Key] public int Id { get; set; }

    public int ConversationId { get; set; }
    public Conversation? Conversation { get; set; }

    public int CustomerId { get; set; }
    public Customer? Customer { get; set; }

    public int? QueueId { get; set; }
    public Queue? Queue { get; set; }

    public Guid? AssignedAgentUserId { get; set; }
    public User? AssignedAgentUser { get; set; }

    public TicketStatus Status { get; set; } = TicketStatus.New;
    public TicketPriority Priority { get; set; } = TicketPriority.Normal;

    public string Category { get; set; } = "General";

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
}

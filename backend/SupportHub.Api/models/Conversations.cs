using System.ComponentModel.DataAnnotations;

namespace SupportHub.Api.Models;

public class Conversation
{
    [Key] public int Id { get; set; }

    public int CustomerId { get; set; }
    public Customer? Customer { get; set; }

    public Channel Channel { get; set; }
    public string? Subject { get; set; }

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime LastMessageAt { get; set; } = DateTime.UtcNow;

    public ICollection<Message> Messages { get; set; } = new List<Message>();
    public Ticket? Ticket { get; set; }
}

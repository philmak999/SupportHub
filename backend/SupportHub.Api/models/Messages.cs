using System.ComponentModel.DataAnnotations;

namespace SupportHub.Api.Models;

public class Message
{
    [Key] public int Id { get; set; }

    public int ConversationId { get; set; }
    public Conversation? Conversation { get; set; }

    public Direction Direction { get; set; }
    public string From { get; set; } = "";
    public string Body { get; set; } = "";
    public DateTime SentAt { get; set; } = DateTime.UtcNow;
}

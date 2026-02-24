namespace SupportHub.Api.Models;

public class AgentQueue
{
    public Guid AgentUserId { get; set; }
    public int QueueId { get; set; }

    public Agent? Agent { get; set; }
    public Queue? Queue { get; set; }
}

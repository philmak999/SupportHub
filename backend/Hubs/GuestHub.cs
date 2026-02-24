using Microsoft.AspNetCore.SignalR;

namespace SupportHub.Api.Hubs;

public class GuestHub : Hub
{
    public Task JoinConversation(int conversationId)
    {
        return Groups.AddToGroupAsync(Context.ConnectionId, $"convo:{conversationId}");
    }
}

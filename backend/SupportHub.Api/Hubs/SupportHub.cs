using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.SignalR;

namespace SupportHub.Api.Hubs;

[Authorize]
public class SupportHubHub : Hub
{
    public async Task JoinRoleRoom(string role)
    {
        // clients can join "Agent" or "Supervisor" rooms for targeted events
        await Groups.AddToGroupAsync(Context.ConnectionId, role);
    }
}

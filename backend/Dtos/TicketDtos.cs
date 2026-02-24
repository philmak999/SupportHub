using SupportHub.Api.Models;

namespace SupportHub.Api.Dtos;

public record TicketListItem(
    int Id,
    string CustomerName,
    string Channel,
    string Queue,
    string Status,
    string Priority,
    string Category,
    string? AssignedAgent,
    DateTime CreatedAt,
    DateTime UpdatedAt
);

public record TicketUpdateRequest(
    TicketStatus? Status,
    TicketPriority? Priority,
    string? Category
);

public record AssignTicketRequest(Guid? AgentUserId, int? QueueId);

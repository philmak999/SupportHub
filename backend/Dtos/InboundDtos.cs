namespace SupportHub.Api.Dtos;

public record InboundCustomer(string Name, string? Email, string? Phone, bool IsVip);
public record InboundMessageRequest(
    string From,
    InboundCustomer Customer,
    string? Subject,
    string Body,
    DateTime? Timestamp
);

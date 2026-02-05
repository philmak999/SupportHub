namespace SupportHub.Api.Dtos;

public record LoginRequest(string Email, string Password);
public record LoginResponse(string Token, string Role, string Name);

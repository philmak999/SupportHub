using System.ComponentModel.DataAnnotations;

namespace SupportHub.Api.Models;

public class User
{
    [Key] public Guid Id { get; set; } = Guid.NewGuid();

    [Required] public string Name { get; set; } = "";
    [Required] public string Email { get; set; } = "";
    [Required] public string PasswordHash { get; set; } = ""; 
    public UserRole Role { get; set; } = UserRole.Agent;
    public bool IsActive { get; set; } = true;

    public Agent? Agent { get; set; }
}
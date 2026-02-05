using System.ComponentModel.DataAnnotations;

namespace SupportHub.Api.Models;

public class Customer
{
    [Key] public int Id { get; set; }

    public string Name { get; set; } = "";
    public string Email { get; set; } = "";
    public string Phone { get; set; } = "";
    public bool IsVip { get; set; } = false;
}

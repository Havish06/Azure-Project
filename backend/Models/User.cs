using System.ComponentModel.DataAnnotations;

namespace ConstructionAssetManagement.Models;

public enum UserRole
{
    Administrator,
    SiteEngineer
}

public class User
{
    [Key]
    public int UserId { get; set; }

    [Required, MaxLength(150)]
    public string Name { get; set; } = string.Empty;

    [Required, MaxLength(200)]
    public string Email { get; set; } = string.Empty;

    // Object ID from Microsoft Entra ID (populated on first login via SSO)
    [MaxLength(200)]
    public string? EntraObjectId { get; set; }

    public UserRole Role { get; set; } = UserRole.SiteEngineer;

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}

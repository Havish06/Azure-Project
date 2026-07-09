using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace ConstructionAssetManagement.Models;

public enum AssetStatus
{
    Available,
    InUse,
    UnderMaintenance,
    Retired
}

public class Asset
{
    [Key]
    public int AssetId { get; set; }

    [Required, MaxLength(200)]
    public string Name { get; set; } = string.Empty;

    [Required, MaxLength(100)]
    public string Category { get; set; } = string.Empty;

    public DateTime PurchaseDate { get; set; }

    [Required, MaxLength(150)]
    public string Site { get; set; } = string.Empty;

    [MaxLength(150)]
    public string? AssignedEngineer { get; set; }

    public AssetStatus Status { get; set; } = AssetStatus.Available;

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

    // Navigation properties
    public ICollection<Maintenance> MaintenanceRecords { get; set; } = new List<Maintenance>();
    public ICollection<Document> Documents { get; set; } = new List<Document>();

    [NotMapped]
    public DateTime? NextServiceDate =>
        MaintenanceRecords.OrderByDescending(m => m.NextService).FirstOrDefault()?.NextService;
}

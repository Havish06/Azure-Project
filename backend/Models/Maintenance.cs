using System.ComponentModel.DataAnnotations;

namespace ConstructionAssetManagement.Models;

public enum MaintenanceStatus
{
    Scheduled,
    Completed,
    Overdue
}

public class Maintenance
{
    [Key]
    public int MaintenanceId { get; set; }

    [Required]
    public int AssetId { get; set; }
    public Asset? Asset { get; set; }

    public DateTime LastService { get; set; }
    public DateTime NextService { get; set; }

    [MaxLength(1000)]
    public string? Notes { get; set; }

    public MaintenanceStatus Status { get; set; } = MaintenanceStatus.Scheduled;

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}

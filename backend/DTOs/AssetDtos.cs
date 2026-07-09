using ConstructionAssetManagement.Models;

namespace ConstructionAssetManagement.DTOs;

public class AssetCreateDto
{
    public string Name { get; set; } = string.Empty;
    public string Category { get; set; } = string.Empty;
    public DateTime PurchaseDate { get; set; }
    public string Site { get; set; } = string.Empty;
    public string? AssignedEngineer { get; set; }
    public AssetStatus Status { get; set; } = AssetStatus.Available;
}

public class AssetUpdateDto : AssetCreateDto
{
}

public class AssetResponseDto
{
    public int AssetId { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Category { get; set; } = string.Empty;
    public DateTime PurchaseDate { get; set; }
    public string Site { get; set; } = string.Empty;
    public string? AssignedEngineer { get; set; }
    public string Status { get; set; } = string.Empty;
    public DateTime? NextServiceDate { get; set; }

    public static AssetResponseDto FromEntity(Asset a) => new()
    {
        AssetId = a.AssetId,
        Name = a.Name,
        Category = a.Category,
        PurchaseDate = a.PurchaseDate,
        Site = a.Site,
        AssignedEngineer = a.AssignedEngineer,
        Status = a.Status.ToString(),
        NextServiceDate = a.NextServiceDate
    };
}

public class DashboardSummaryDto
{
    public int TotalAssets { get; set; }
    public int AvailableAssets { get; set; }
    public int UnderMaintenance { get; set; }
    public int ActiveSites { get; set; }
    public List<AssetResponseDto> RecentAssets { get; set; } = new();
}

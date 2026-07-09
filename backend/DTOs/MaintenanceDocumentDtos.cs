using ConstructionAssetManagement.Models;

namespace ConstructionAssetManagement.DTOs;

public class MaintenanceCreateDto
{
    public int AssetId { get; set; }
    public DateTime LastService { get; set; }
    public DateTime NextService { get; set; }
    public string? Notes { get; set; }
    public MaintenanceStatus Status { get; set; } = MaintenanceStatus.Scheduled;
}

public class MaintenanceUpdateDto
{
    public DateTime LastService { get; set; }
    public DateTime NextService { get; set; }
    public string? Notes { get; set; }
    public MaintenanceStatus Status { get; set; }
}

public class MaintenanceResponseDto
{
    public int MaintenanceId { get; set; }
    public int AssetId { get; set; }
    public string AssetName { get; set; } = string.Empty;
    public DateTime LastService { get; set; }
    public DateTime NextService { get; set; }
    public string? Notes { get; set; }
    public string Status { get; set; } = string.Empty;

    public static MaintenanceResponseDto FromEntity(Maintenance m) => new()
    {
        MaintenanceId = m.MaintenanceId,
        AssetId = m.AssetId,
        AssetName = m.Asset?.Name ?? string.Empty,
        LastService = m.LastService,
        NextService = m.NextService,
        Notes = m.Notes,
        Status = m.Status.ToString()
    };
}

public class DocumentResponseDto
{
    public int DocumentId { get; set; }
    public int AssetId { get; set; }
    public string FileName { get; set; } = string.Empty;
    public string BlobUrl { get; set; } = string.Empty;
    public string DocumentType { get; set; } = string.Empty;
    public DateTime UploadDate { get; set; }

    public static DocumentResponseDto FromEntity(Document d) => new()
    {
        DocumentId = d.DocumentId,
        AssetId = d.AssetId,
        FileName = d.FileName,
        BlobUrl = d.BlobUrl,
        DocumentType = d.DocumentType.ToString(),
        UploadDate = d.UploadDate
    };
}

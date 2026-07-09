using System.ComponentModel.DataAnnotations;

namespace ConstructionAssetManagement.Models;

public enum DocumentType
{
    Manual,
    Image,
    Warranty
}

public class Document
{
    [Key]
    public int DocumentId { get; set; }

    [Required]
    public int AssetId { get; set; }
    public Asset? Asset { get; set; }

    [Required, MaxLength(300)]
    public string FileName { get; set; } = string.Empty;

    [Required, MaxLength(1000)]
    public string BlobUrl { get; set; } = string.Empty;

    [MaxLength(100)]
    public string ContentType { get; set; } = "application/octet-stream";

    public DocumentType DocumentType { get; set; } = DocumentType.Manual;

    public DateTime UploadDate { get; set; } = DateTime.UtcNow;
}

using ConstructionAssetManagement.Data;
using ConstructionAssetManagement.DTOs;
using ConstructionAssetManagement.Models;
using ConstructionAssetManagement.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace ConstructionAssetManagement.Controllers;

[ApiController]
[Route("api/documents")]
[Authorize]
public class DocumentsController : ControllerBase
{
    private readonly AppDbContext _db;
    private readonly IBlobStorageService _blobStorage;

    private static readonly string[] AllowedExtensions =
        { ".pdf", ".doc", ".docx", ".png", ".jpg", ".jpeg", ".gif", ".xlsx", ".txt" };
    private const long MaxFileSizeBytes = 25 * 1024 * 1024; // 25 MB

    public DocumentsController(AppDbContext db, IBlobStorageService blobStorage)
    {
        _db = db;
        _blobStorage = blobStorage;
    }

    // GET /api/documents?assetId=
    [HttpGet]
    public async Task<ActionResult<IEnumerable<DocumentResponseDto>>> GetAll([FromQuery] int? assetId)
    {
        var query = _db.Documents.AsQueryable();
        if (assetId.HasValue) query = query.Where(d => d.AssetId == assetId.Value);

        var docs = await query.OrderByDescending(d => d.UploadDate).ToListAsync();
        return Ok(docs.Select(DocumentResponseDto.FromEntity));
    }

    // POST /api/documents/upload  (multipart/form-data: file, assetId, documentType)
    [HttpPost("upload")]
    [RequestSizeLimit(MaxFileSizeBytes)]
    public async Task<ActionResult<DocumentResponseDto>> Upload(
        [FromForm] IFormFile file,
        [FromForm] int assetId,
        [FromForm] DocumentType documentType = DocumentType.Manual)
    {
        if (file == null || file.Length == 0)
            return BadRequest(new { error = "No file uploaded." });

        var extension = Path.GetExtension(file.FileName).ToLowerInvariant();
        if (!AllowedExtensions.Contains(extension))
            return BadRequest(new { error = $"File type {extension} not allowed." });

        var assetExists = await _db.Assets.AnyAsync(a => a.AssetId == assetId);
        if (!assetExists) return BadRequest(new { error = "Asset does not exist." });

        await using var stream = file.OpenReadStream();
        var blobUrl = await _blobStorage.UploadFileAsync(stream, file.FileName, file.ContentType);

        var document = new Document
        {
            AssetId = assetId,
            FileName = file.FileName,
            BlobUrl = blobUrl,
            ContentType = file.ContentType,
            DocumentType = documentType,
            UploadDate = DateTime.UtcNow
        };

        _db.Documents.Add(document);
        await _db.SaveChangesAsync();

        return CreatedAtAction(nameof(GetAll), new { assetId }, DocumentResponseDto.FromEntity(document));
    }

    // GET /api/documents/{id}  -> returns a short-lived signed download URL
    [HttpGet("{id:int}")]
    public async Task<IActionResult> Download(int id)
    {
        var doc = await _db.Documents.FindAsync(id);
        if (doc == null) return NotFound(new { error = "Document not found." });

        var downloadUrl = await _blobStorage.GetDownloadUrlAsync(doc.BlobUrl);
        return Ok(new { fileName = doc.FileName, downloadUrl });
    }

    // DELETE /api/documents/{id}  (Administrator only)
    [HttpDelete("{id:int}")]
    [Authorize]
    public async Task<IActionResult> Delete(int id)
    {
        var doc = await _db.Documents.FindAsync(id);
        if (doc == null) return NotFound(new { error = "Document not found." });

        await _blobStorage.DeleteFileAsync(doc.BlobUrl);
        _db.Documents.Remove(doc);
        await _db.SaveChangesAsync();

        return NoContent();
    }
}

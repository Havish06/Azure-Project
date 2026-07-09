using ConstructionAssetManagement.Data;
using ConstructionAssetManagement.DTOs;
using ConstructionAssetManagement.Models;
using ConstructionAssetManagement.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace ConstructionAssetManagement.Controllers;

[ApiController]
[Route("api/assets")]
[Authorize]
public class AssetsController : ControllerBase
{
    private readonly AppDbContext _db;

    public AssetsController(AppDbContext db)
    {
        _db = db;
    }

    // GET /api/assets?name=&category=&site=&status=
    [HttpGet]
    public async Task<ActionResult<IEnumerable<AssetResponseDto>>> GetAll(
        [FromQuery] string? name,
        [FromQuery] string? category,
        [FromQuery] string? site,
        [FromQuery] string? status)
    {
        var query = _db.Assets.Include(a => a.MaintenanceRecords).AsQueryable();

        if (!string.IsNullOrWhiteSpace(name))
            query = query.Where(a => a.Name.Contains(name));

        if (!string.IsNullOrWhiteSpace(category))
            query = query.Where(a => a.Category.Contains(category));

        if (!string.IsNullOrWhiteSpace(site))
            query = query.Where(a => a.Site.Contains(site));

        if (!string.IsNullOrWhiteSpace(status) && Enum.TryParse<AssetStatus>(status, true, out var parsedStatus))
            query = query.Where(a => a.Status == parsedStatus);

        var assets = await query.OrderByDescending(a => a.CreatedAt).ToListAsync();
        return Ok(assets.Select(AssetResponseDto.FromEntity));
    }

    // GET /api/assets/{id}
    [HttpGet("{id:int}")]
    public async Task<ActionResult<object>> GetById(int id)
    {
        var asset = await _db.Assets
            .Include(a => a.MaintenanceRecords)
            .Include(a => a.Documents)
            .FirstOrDefaultAsync(a => a.AssetId == id);

        if (asset == null) return NotFound(new { error = "Asset not found." });

        return Ok(new
        {
            Asset = AssetResponseDto.FromEntity(asset),
            MaintenanceHistory = asset.MaintenanceRecords
                .OrderByDescending(m => m.NextService)
                .Select(MaintenanceResponseDto.FromEntity),
            Documents = asset.Documents.Select(DocumentResponseDto.FromEntity)
        });
    }

    // POST /api/assets  (Administrator only)
    [HttpPost]
    [Authorize(Policy = "AdministratorOnly")]
    public async Task<ActionResult<AssetResponseDto>> Create([FromBody] AssetCreateDto dto)
    {
        if (!ModelState.IsValid) return BadRequest(ModelState);

        var asset = new Asset
        {
            Name = dto.Name,
            Category = dto.Category,
            PurchaseDate = dto.PurchaseDate,
            Site = dto.Site,
            AssignedEngineer = dto.AssignedEngineer,
            Status = dto.Status,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        _db.Assets.Add(asset);
        await _db.SaveChangesAsync();

        return CreatedAtAction(nameof(GetById), new { id = asset.AssetId }, AssetResponseDto.FromEntity(asset));
    }

    // PUT /api/assets/{id}  (Administrator only)
    [HttpPut("{id:int}")]
    [Authorize(Policy = "AdministratorOnly")]
    public async Task<ActionResult<AssetResponseDto>> Update(int id, [FromBody] AssetUpdateDto dto)
    {
        var asset = await _db.Assets.FindAsync(id);
        if (asset == null) return NotFound(new { error = "Asset not found." });

        asset.Name = dto.Name;
        asset.Category = dto.Category;
        asset.PurchaseDate = dto.PurchaseDate;
        asset.Site = dto.Site;
        asset.AssignedEngineer = dto.AssignedEngineer;
        asset.Status = dto.Status;
        asset.UpdatedAt = DateTime.UtcNow;

        await _db.SaveChangesAsync();
        return Ok(AssetResponseDto.FromEntity(asset));
    }

    // PATCH /api/assets/{id}/status  (Site Engineer can update status)
    [HttpPatch("{id:int}/status")]
    public async Task<ActionResult<AssetResponseDto>> UpdateStatus(int id, [FromBody] StatusUpdateDto dto)
    {
        var asset = await _db.Assets.FindAsync(id);
        if (asset == null) return NotFound(new { error = "Asset not found." });

        asset.Status = dto.Status;
        asset.UpdatedAt = DateTime.UtcNow;
        await _db.SaveChangesAsync();

        return Ok(AssetResponseDto.FromEntity(asset));
    }

    // DELETE /api/assets/{id}  (Administrator only)
    [HttpDelete("{id:int}")]
    [Authorize(Policy = "AdministratorOnly")]
    public async Task<IActionResult> Delete(int id)
    {
        var asset = await _db.Assets
            .Include(a => a.Documents)
            .FirstOrDefaultAsync(a => a.AssetId == id);
        if (asset == null) return NotFound(new { error = "Asset not found." });

        // Clean up associated blobs from Azure Storage before removing the asset
        var blobService = HttpContext.RequestServices.GetRequiredService<IBlobStorageService>();
        foreach (var doc in asset.Documents)
        {
            await blobService.DeleteFileAsync(doc.BlobUrl);
        }

        _db.Assets.Remove(asset);
        await _db.SaveChangesAsync();
        return NoContent();
    }

    // GET /api/assets/dashboard-summary
    [HttpGet("dashboard-summary")]
    public async Task<ActionResult<DashboardSummaryDto>> DashboardSummary()
    {
        var assets = await _db.Assets.Include(a => a.MaintenanceRecords).ToListAsync();

        var summary = new DashboardSummaryDto
        {
            TotalAssets = assets.Count,
            AvailableAssets = assets.Count(a => a.Status == AssetStatus.Available),
            UnderMaintenance = assets.Count(a => a.Status == AssetStatus.UnderMaintenance),
            ActiveSites = assets.Select(a => a.Site).Distinct().Count(),
            RecentAssets = assets
                .OrderByDescending(a => a.CreatedAt)
                .Take(5)
                .Select(AssetResponseDto.FromEntity)
                .ToList()
        };

        return Ok(summary);
    }
}

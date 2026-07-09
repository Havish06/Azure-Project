using ConstructionAssetManagement.Data;
using ConstructionAssetManagement.DTOs;
using ConstructionAssetManagement.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace ConstructionAssetManagement.Controllers;

[ApiController]
[Route("api/maintenance")]
[Authorize]
public class MaintenanceController : ControllerBase
{
    private readonly AppDbContext _db;

    public MaintenanceController(AppDbContext db)
    {
        _db = db;
    }

    // GET /api/maintenance
    [HttpGet]
    public async Task<ActionResult<IEnumerable<MaintenanceResponseDto>>> GetAll([FromQuery] int? assetId)
    {
        var query = _db.MaintenanceRecords.Include(m => m.Asset).AsQueryable();

        if (assetId.HasValue)
            query = query.Where(m => m.AssetId == assetId.Value);

        var records = await query.OrderBy(m => m.NextService).ToListAsync();
        return Ok(records.Select(MaintenanceResponseDto.FromEntity));
    }

    // GET /api/maintenance/{id}
    [HttpGet("{id:int}")]
    public async Task<ActionResult<MaintenanceResponseDto>> GetById(int id)
    {
        var record = await _db.MaintenanceRecords.Include(m => m.Asset)
            .FirstOrDefaultAsync(m => m.MaintenanceId == id);

        if (record == null) return NotFound(new { error = "Maintenance record not found." });
        return Ok(MaintenanceResponseDto.FromEntity(record));
    }

    // POST /api/maintenance  (Administrator only)
    [HttpPost]
    [Authorize(Policy = "AdministratorOnly")]
    public async Task<ActionResult<MaintenanceResponseDto>> Create([FromBody] MaintenanceCreateDto dto)
    {
        var assetExists = await _db.Assets.AnyAsync(a => a.AssetId == dto.AssetId);
        if (!assetExists) return BadRequest(new { error = "Asset does not exist." });

        var record = new Maintenance
        {
            AssetId = dto.AssetId,
            LastService = dto.LastService,
            NextService = dto.NextService,
            Notes = dto.Notes,
            Status = dto.Status,
            CreatedAt = DateTime.UtcNow
        };

        _db.MaintenanceRecords.Add(record);

        // Reflect the maintenance state on the asset itself
        var asset = await _db.Assets.FindAsync(dto.AssetId);
        if (asset != null && dto.Status == MaintenanceStatus.Scheduled && dto.NextService <= DateTime.UtcNow)
        {
            asset.Status = AssetStatus.UnderMaintenance;
        }

        await _db.SaveChangesAsync();

        await _db.Entry(record).Reference(m => m.Asset).LoadAsync();
        return CreatedAtAction(nameof(GetById), new { id = record.MaintenanceId }, MaintenanceResponseDto.FromEntity(record));
    }

    // PUT /api/maintenance/{id}  (Administrator only)
    [HttpPut("{id:int}")]
    [Authorize(Policy = "AdministratorOnly")]
    public async Task<ActionResult<MaintenanceResponseDto>> Update(int id, [FromBody] MaintenanceUpdateDto dto)
    {
        var record = await _db.MaintenanceRecords.Include(m => m.Asset)
            .FirstOrDefaultAsync(m => m.MaintenanceId == id);

        if (record == null) return NotFound(new { error = "Maintenance record not found." });

        record.LastService = dto.LastService;
        record.NextService = dto.NextService;
        record.Notes = dto.Notes;
        record.Status = dto.Status;

        // Keep asset status in sync
        if (record.Asset != null)
        {
            record.Asset.Status = dto.Status switch
            {
                MaintenanceStatus.Completed => AssetStatus.Available,
                MaintenanceStatus.Overdue or MaintenanceStatus.Scheduled when dto.NextService <= DateTime.UtcNow
                    => AssetStatus.UnderMaintenance,
                _ => record.Asset.Status
            };
            record.Asset.UpdatedAt = DateTime.UtcNow;
        }

        await _db.SaveChangesAsync();
        return Ok(MaintenanceResponseDto.FromEntity(record));
    }

    // DELETE /api/maintenance/{id}  (Administrator only)
    [HttpDelete("{id:int}")]
    [Authorize(Policy = "AdministratorOnly")]
    public async Task<IActionResult> Delete(int id)
    {
        var record = await _db.MaintenanceRecords.FindAsync(id);
        if (record == null) return NotFound(new { error = "Maintenance record not found." });

        _db.MaintenanceRecords.Remove(record);
        await _db.SaveChangesAsync();
        return NoContent();
    }
}

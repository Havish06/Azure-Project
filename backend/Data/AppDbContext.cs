using ConstructionAssetManagement.Models;
using Microsoft.EntityFrameworkCore;

namespace ConstructionAssetManagement.Data;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

    public DbSet<User> Users => Set<User>();
    public DbSet<Asset> Assets => Set<Asset>();
    public DbSet<Maintenance> MaintenanceRecords => Set<Maintenance>();
    public DbSet<Document> Documents => Set<Document>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        modelBuilder.Entity<User>()
            .HasIndex(u => u.Email)
            .IsUnique();

        modelBuilder.Entity<Asset>()
            .Property(a => a.Status)
            .HasConversion<string>();

        modelBuilder.Entity<Maintenance>()
            .Property(m => m.Status)
            .HasConversion<string>();

        modelBuilder.Entity<Document>()
            .Property(d => d.DocumentType)
            .HasConversion<string>();

        modelBuilder.Entity<User>()
            .Property(u => u.Role)
            .HasConversion<string>();

        modelBuilder.Entity<Maintenance>()
            .HasOne(m => m.Asset)
            .WithMany(a => a.MaintenanceRecords)
            .HasForeignKey(m => m.AssetId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<Document>()
            .HasOne(d => d.Asset)
            .WithMany(a => a.Documents)
            .HasForeignKey(d => d.AssetId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}

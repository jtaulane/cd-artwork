using CDDisplay.Server.Models;
using Microsoft.EntityFrameworkCore;

namespace CDDisplay.Server.Data
{
    public class AlbumDbContext : DbContext
    {
        public AlbumDbContext(DbContextOptions<AlbumDbContext> options) : base(options)
        {
        }

        public DbSet<Album> Albums => Set<Album>();
        public DbSet<Track> Tracks => Set<Track>();
        public DbSet<CurrentDisplay> CurrentDisplay => Set<CurrentDisplay>();

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            // Configure CurrentDisplay to have only one record
            modelBuilder.Entity<CurrentDisplay>()
                .HasKey(cd => cd.Id);

            // Seed initial CurrentDisplay record
            modelBuilder.Entity<CurrentDisplay>().HasData(
                new CurrentDisplay { Id = 1, CurrentAlbumId = null, LastUpdated = DateTime.UtcNow }
            );

            // Configure Album
            modelBuilder.Entity<Album>()
                .HasKey(a => a.Id);

            modelBuilder.Entity<Album>()
                .HasIndex(a => a.DiscNumber)
                .IsUnique();

            // Configure Track
            modelBuilder.Entity<Track>()
                .HasKey(t => t.Id);

            modelBuilder.Entity<Track>()
                .HasOne(t => t.Album)
                .WithMany(a => a.Tracks)
                .HasForeignKey(t => t.AlbumId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<Track>()
                .HasIndex(t => new { t.AlbumId, t.TrackNumber })
                .IsUnique();
        }
    }
}

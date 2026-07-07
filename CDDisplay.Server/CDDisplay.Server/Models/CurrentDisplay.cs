namespace CDDisplay.Server.Models
{
    public class CurrentDisplay
    {
        public int Id { get; set; } = 1; // Always use Id 1, single record

        public int? CurrentAlbumId { get; set; }

        public DateTime LastUpdated { get; set; } = DateTime.UtcNow;
    }
}

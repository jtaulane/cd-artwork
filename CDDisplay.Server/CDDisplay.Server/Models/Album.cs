namespace CDDisplay.Server.Models
{
    public class Album
    {
        public int Id { get; set; }

        public int DiscNumber { get; set; }

        public string? AlbumTitle { get; set; }

        public string? Artist { get; set; }

        public int ReleaseYear { get; set; }

        public string? Genre { get; set; }

        public string? ImagePath { get; set; }

        public DateTime CreatedDate { get; set; } = DateTime.UtcNow;

        public DateTime UpdatedDate { get; set; } = DateTime.UtcNow;
    }
}

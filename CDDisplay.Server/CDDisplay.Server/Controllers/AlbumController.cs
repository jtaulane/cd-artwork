using CDDisplay.Server.Data;
using CDDisplay.Server.Models;
using CDDisplay.Server.Hubs;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.SignalR;

namespace CDDisplay.Server.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AlbumController : ControllerBase
    {
        private readonly AlbumDbContext _context;
        private readonly IHubContext<DisplayHub> _hubContext;
        private readonly IWebHostEnvironment _env;

        public AlbumController(AlbumDbContext context, IHubContext<DisplayHub> hubContext, IWebHostEnvironment env)
        {
            _context = context;
            _hubContext = hubContext;
            _env = env;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<Album>>> GetAlbums()
        {
            var albums = await _context.Albums.OrderBy(a => a.DiscNumber).ToListAsync();
            return Ok(albums);
        }

        [HttpGet("{id:int}")]
        public async Task<ActionResult<Album>> GetAlbum(int id)
        {
            var album = await _context.Albums.FirstOrDefaultAsync(a => a.Id == id);

            if (album is null)
            {
                return NotFound();
            }

            return Ok(album);
        }

        [HttpPost]
        public async Task<ActionResult<Album>> CreateAlbum([FromForm] Album album, IFormFile? imageFile)
        {
            try
            {
                // Handle image upload if provided
                if (imageFile != null)
                {
                    var fileName = await SaveImageFile(imageFile);
                    album.ImagePath = $"/images/albums/{fileName}";
                }

                _context.Albums.Add(album);
                await _context.SaveChangesAsync();

                return CreatedAtAction(nameof(GetAlbum), new { id = album.Id }, album);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpPut("{id:int}")]
        public async Task<IActionResult> UpdateAlbum(int id, [FromForm] Album album, IFormFile? imageFile)
        {
            var existingAlbum = await _context.Albums.FindAsync(id);
            if (existingAlbum == null)
            {
                return NotFound();
            }

            try
            {
                // Handle image upload if provided
                if (imageFile != null)
                {
                    // Delete old image if it exists
                    if (!string.IsNullOrEmpty(existingAlbum.ImagePath))
                    {
                        DeleteImageFile(existingAlbum.ImagePath);
                    }

                    var fileName = await SaveImageFile(imageFile);
                    existingAlbum.ImagePath = $"/images/albums/{fileName}";
                }

                existingAlbum.AlbumTitle = album.AlbumTitle;
                existingAlbum.Artist = album.Artist;
                existingAlbum.ReleaseYear = album.ReleaseYear;
                existingAlbum.Genre = album.Genre;
                existingAlbum.DiscNumber = album.DiscNumber;
                existingAlbum.UpdatedDate = DateTime.UtcNow;

                await _context.SaveChangesAsync();
                return NoContent();
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpDelete("{id:int}")]
        public async Task<IActionResult> DeleteAlbum(int id)
        {
            var album = await _context.Albums.FindAsync(id);
            if (album == null)
            {
                return NotFound();
            }

            try
            {
                // Delete image file if it exists
                if (!string.IsNullOrEmpty(album.ImagePath))
                {
                    DeleteImageFile(album.ImagePath);
                }

                _context.Albums.Remove(album);
                await _context.SaveChangesAsync();

                return NoContent();
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpGet("current")]
        public async Task<ActionResult<Album>> GetCurrentAlbum()
        {
            var currentDisplay = await _context.CurrentDisplay.FirstOrDefaultAsync();
            if (currentDisplay?.CurrentAlbumId == null)
            {
                return NotFound();
            }

            var album = await _context.Albums.FirstOrDefaultAsync(a => a.Id == currentDisplay.CurrentAlbumId);
            return album == null ? NotFound() : Ok(album);
        }

        [HttpPost("current/{albumId:int}")]
        public async Task<ActionResult> SetCurrentAlbum(int albumId)
        {
            var album = await _context.Albums.FirstOrDefaultAsync(a => a.Id == albumId);
            if (album == null)
            {
                return NotFound("Album not found");
            }

            var currentDisplay = await _context.CurrentDisplay.FirstOrDefaultAsync();
            if (currentDisplay == null)
            {
                currentDisplay = new CurrentDisplay { Id = 1, CurrentAlbumId = albumId };
                _context.CurrentDisplay.Add(currentDisplay);
            }
            else
            {
                currentDisplay.CurrentAlbumId = albumId;
                currentDisplay.LastUpdated = DateTime.UtcNow;
            }

            await _context.SaveChangesAsync();

            // Notify all clients via SignalR
            await _hubContext.Clients.All.SendAsync("AlbumChanged", albumId, album);

            return Ok(album);
        }

        private async Task<string> SaveImageFile(IFormFile imageFile)
        {
            var imagesDirectory = Path.Combine(_env.WebRootPath, "images", "albums");

            if (!Directory.Exists(imagesDirectory))
            {
                Directory.CreateDirectory(imagesDirectory);
            }

            var fileName = $"{Guid.NewGuid()}_{Path.GetFileName(imageFile.FileName)}";
            var filePath = Path.Combine(imagesDirectory, fileName);

            using (var stream = new FileStream(filePath, FileMode.Create))
            {
                await imageFile.CopyToAsync(stream);
            }

            return fileName;
        }

        private void DeleteImageFile(string imagePath)
        {
            try
            {
                var filePath = Path.Combine("wwwroot", imagePath.TrimStart('/'));
                if (System.IO.File.Exists(filePath))
                {
                    System.IO.File.Delete(filePath);
                }
            }
            catch
            {
                // Log error but don't fail the operation
            }
        }
    }
}


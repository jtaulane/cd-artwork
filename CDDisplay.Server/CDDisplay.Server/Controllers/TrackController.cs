using CDDisplay.Server.Data;
using CDDisplay.Server.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace CDDisplay.Server.Controllers
{
    [ApiController]
    [Route("api/album/{albumId:int}/tracks")]
    public class TrackController : ControllerBase
    {
        private readonly AlbumDbContext _context;

        public TrackController(AlbumDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<Track>>> GetAlbumTracks(int albumId)
        {
            var album = await _context.Albums.FindAsync(albumId);
            if (album == null)
            {
                return NotFound("Album not found");
            }

            var tracks = await _context.Tracks
                .Where(t => t.AlbumId == albumId)
                .OrderBy(t => t.TrackNumber)
                .ToListAsync();

            return Ok(tracks);
        }

        [HttpPost]
        public async Task<ActionResult<Track>> CreateTrack(int albumId, [FromBody] Track track)
        {
            var album = await _context.Albums.FindAsync(albumId);
            if (album == null)
            {
                return NotFound("Album not found");
            }

            try
            {
                track.AlbumId = albumId;
                _context.Tracks.Add(track);
                await _context.SaveChangesAsync();

                return CreatedAtAction(nameof(GetAlbumTracks), new { albumId }, track);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpPut("{trackId:int}")]
        public async Task<IActionResult> UpdateTrack(int albumId, int trackId, [FromBody] Track track)
        {
            var existingTrack = await _context.Tracks
                .FirstOrDefaultAsync(t => t.Id == trackId && t.AlbumId == albumId);

            if (existingTrack == null)
            {
                return NotFound("Track not found");
            }

            try
            {
                existingTrack.TrackTitle = track.TrackTitle;
                existingTrack.TrackNumber = track.TrackNumber;
                existingTrack.DurationSeconds = track.DurationSeconds;

                await _context.SaveChangesAsync();
                return NoContent();
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpDelete("{trackId:int}")]
        public async Task<IActionResult> DeleteTrack(int albumId, int trackId)
        {
            var track = await _context.Tracks
                .FirstOrDefaultAsync(t => t.Id == trackId && t.AlbumId == albumId);

            if (track == null)
            {
                return NotFound("Track not found");
            }

            try
            {
                _context.Tracks.Remove(track);
                await _context.SaveChangesAsync();
                return NoContent();
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }
    }
}

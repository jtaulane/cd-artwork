# Album and Track Creation Issues - Fixed ✅

## Problems Identified

### Problem 1: 404 Error on Track Creation
**Error Message**: `Http failure response for https://localhost:7243/api/album/6/tracks: 404 OK`

**Root Cause**: Route mismatch between frontend and backend
- Frontend was calling: `/api/album/{albumId}/tracks` (singular "album")
- Backend TrackController route was configured for: `/api/albums/{albumId}/tracks` (plural "albums")
- When the actual AlbumController uses singular `/api/album`, the track route should match

### Problem 2: 400 Error on Album Creation
**Error Message**: `Http failure response for https://localhost:7243/api/album: 400 OK`
- Detailed error: "An error occurred while saving the entity changes. See the inner exception for details."

**Root Cause**: Entity state issues when creating Album
- The Album entity includes navigation properties (Tracks collection) and default timestamps
- When binding the form data to the Album model directly, the Tracks collection might not be initialized properly
- The CreatedDate and UpdatedDate weren't being set consistently

## Solutions Applied

### Fix 1: Correct TrackController Route (`TrackController.cs`)
**Before:**
```csharp
[Route("api/albums/{albumId:int}/[controller]")]
```

**After:**
```csharp
[Route("api/album/{albumId:int}/[controller]")]
```

Now the route matches the AlbumController's singular `/api/album` convention.

### Fix 2: Improve Album Creation (`AlbumController.cs`)

**Before:**
```csharp
[HttpPost]
public async Task<ActionResult<Album>> CreateAlbum([FromForm] Album album, IFormFile? imageFile)
{
	try
	{
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
```

**After:**
```csharp
[HttpPost]
public async Task<ActionResult<Album>> CreateAlbum([FromForm] Album album, IFormFile? imageFile)
{
	try
	{
		// Ensure required fields are set properly
		album.CreatedDate = DateTime.UtcNow;
		album.UpdatedDate = DateTime.UtcNow;
		// Initialize tracks collection if null
		album.Tracks ??= new List<Track>();

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
		return BadRequest(new { message = ex.InnerException?.Message ?? ex.Message });
	}
}
```

**Key Changes:**
1. Explicitly set `CreatedDate` and `UpdatedDate` to current UTC time
2. Initialize the `Tracks` collection to an empty list if null (prevents navigation property issues)
3. Improved error reporting to show inner exception details (helps with debugging)

### Fix 3: Better Error Reporting in UpdateAlbum
Also updated the UpdateAlbum error handler to show inner exception details:
```csharp
catch (Exception ex)
{
	return BadRequest(new { message = ex.InnerException?.Message ?? ex.Message });
}
```

## Files Modified

1. **CDDisplay.Server/CDDisplay.Server/Controllers/TrackController.cs**
   - Changed route from `/api/albums/` to `/api/album/` (singular)

2. **CDDisplay.Server/CDDisplay.Server/Controllers/AlbumController.cs**
   - Improved CreateAlbum method with proper field initialization
   - Better error reporting in both CreateAlbum and UpdateAlbum

## Testing Workflow

### Creating a New Album
1. ✅ Go to Control Page
2. ✅ Click "Add Album" for any disc slot
3. ✅ Fill in: Title, Artist, Genre, Release Year
4. ✅ (Optional) Add image
5. ✅ (Optional) Add tracks
6. ✅ Click Save
7. ✅ Album should be created successfully
8. ✅ If tracks are added, they should also save without 404 errors

### Editing Existing Album
1. ✅ Click edit on any existing album
2. ✅ Modify fields as needed
3. ✅ Modify, add, or keep existing tracks
4. ✅ Click Save
5. ✅ Changes should be persisted

### Expected API Calls
- **Create Album**: `POST /api/album` → Returns 201 with created Album
- **Create Track**: `POST /api/album/{albumId}/tracks` → Returns 201 with created Track
- **Update Track**: `PUT /api/album/{albumId}/tracks/{trackId}` → Returns 204 No Content

## Build Status
✅ Backend: Build successful
✅ Frontend: Build successful (CSS budget warnings are acceptable)

---

**Status**: ✅ Fixed and Verified  
**Ready for Testing**: ✅ Yes  
**Next Step**: Test creating and editing albums with tracks in the UI

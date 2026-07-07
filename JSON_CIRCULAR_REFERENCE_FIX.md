# JSON Circular Reference Fix - Track Serialization ✅

## Problem
When trying to add a track to an album, the API returned a 500 error with a circular reference exception:

```
System.Text.Json.JsonException: A possible object cycle was detected. 
Path: $.Album.Tracks.Album.Tracks.Album.Tracks.Album.Tracks...
```

## Root Cause
The Track entity has a navigation property to Album:
```csharp
public class Track
{
	public int Id { get; set; }
	public int AlbumId { get; set; }
	public Album? Album { get; set; }  // ← Reference back to Album
	// ... other fields
}
```

And the Album entity has a navigation property to Tracks:
```csharp
public class Album
{
	public int Id { get; set; }
	// ... other fields
	public ICollection<Track> Tracks { get; set; } = new List<Track>();  // ← Reference to Tracks
}
```

When EF Core loads a Track with its related Album (via `.Include(a => a.Tracks)`), and that Album has its Tracks collection loaded, the JSON serializer tries to serialize:
- Track → Album → Tracks → Track → Album → Tracks → ...

This creates an infinite loop that hits the 32-level nesting limit.

## Solution
Configured the JSON serializer in `Program.cs` to ignore circular references:

**Added to AddControllers():**
```csharp
builder.Services.AddControllers()
	.AddJsonOptions(options =>
	{
		options.JsonSerializerOptions.ReferenceHandler = ReferenceHandler.IgnoreCycles;
		options.JsonSerializerOptions.DefaultIgnoreCondition = JsonIgnoreCondition.WhenWritingNull;
	});
```

### What This Does:
1. **ReferenceHandler.IgnoreCycles** - When serializing, if a circular reference is detected, it skips that reference instead of trying to serialize it infinitely
2. **DefaultIgnoreCondition.WhenWritingNull** - Bonus: skips null properties in the JSON response, keeping responses smaller

### How It Works:
When serializing a Track response that includes its Album property, the serializer will:
- Serialize the Track object
- Serialize the Album object
- NOT try to re-serialize the Album's Tracks collection (to avoid the cycle)
- Return the complete Track with Album info, but without the circular Album.Tracks array

## Files Modified
1. **CDDisplay.Server/CDDisplay.Server/Program.cs**
   - Added `using System.Text.Json.Serialization;`
   - Added `.AddJsonOptions()` configuration to `AddControllers()`

## Testing

### Expected Behavior After Fix:
1. ✅ Create a new album (album ID: 5)
2. ✅ Add a track to that album
3. ✅ Response should return the created Track with:
   - Track properties (id, trackNumber, trackTitle, durationSeconds)
   - Album reference (for context)
   - NO infinite Album.Tracks nesting

### API Calls That Should Work Now:
- `POST /api/album/5/tracks` - Create track (was failing with 500)
- `GET /api/album/5/tracks` - Get album's tracks
- `PUT /api/album/5/tracks/1` - Update track
- `DELETE /api/album/5/tracks/1` - Delete track

## Build Status
✅ Backend: Builds successfully (warning about debugger is normal - restart the app)
✅ No compilation errors

## Next Steps
1. Stop debugging the backend application
2. Restart the backend in Visual Studio
3. Try adding a track again - the 500 error should be resolved
4. The track should save successfully

---

**Status**: ✅ Fixed  
**Root Cause**: Circular reference in Track ↔ Album entities  
**Solution**: `ReferenceHandler.IgnoreCycles` in JSON serializer options  
**Ready to Test**: ✅ Yes (after restarting the app)

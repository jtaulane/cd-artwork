# Image Display Troubleshooting & Fix

## What Was Wrong
The backend was using **relative paths** to save images, which caused issues depending on the working directory of the application. Even though static files were enabled, the images weren't being found at the expected paths.

## What Was Fixed

### 1. **Absolute Path Resolution**
- Now using `IWebHostEnvironment.WebRootPath` to get the absolute path to `wwwroot`
- Images are saved to: `{AbsolutePath}/wwwroot/images/albums/`
- Works consistently regardless of where the app is launched from

### 2. **Code Changes**

**AlbumController.cs:**
```csharp
// OLD - Relative path (unreliable)
private const string ImagesDirectory = "wwwroot/images/albums";

// NEW - Absolute path (reliable)
private readonly IWebHostEnvironment _env;

public AlbumController(..., IWebHostEnvironment env)
{
	_env = env;
}

private async Task<string> SaveImageFile(IFormFile imageFile)
{
	var imagesDirectory = Path.Combine(_env.WebRootPath, "images", "albums");
	// ... rest of method
}
```

## How Images Flow Now

1. **User uploads image** via album editor modal
2. **Backend receives file** in `CreateAlbum` or `UpdateAlbum` endpoint
3. **`SaveImageFile` method:**
   - Gets absolute `wwwroot` path from `IWebHostEnvironment`
   - Creates `wwwroot/images/albums/` directory if needed
   - Saves file as: `{guid}_{original_filename}`
   - Returns filename
4. **Database stores:** `/images/albums/{guid}_{filename}`
5. **Frontend receives** album data with `imagePath`
6. **Static middleware** serves the file from `wwwroot` directory
7. **Image displays** in the album card

## Directory Structure

```
CDDisplay.Server/
├── wwwroot/
│   ├── .gitkeep (ensures git tracks this folder)
│   └── images/
│       └── albums/
│           ├── 470ac4f8-1084-4af5-9f60-b96a3bf21eab_images.jpg
│           ├── d1d30763-6420-41b7-8f1f-674f0aebc013_dar.jpg
│           └── (more image files...)
├── Controllers/
│   └── AlbumController.cs
├── Program.cs (has app.UseStaticFiles())
└── ...
```

## Testing the Fix

### Option 1: Clean Restart
1. **Close the application** completely
2. **Rebuild solution** (Ctrl+Shift+B in Visual Studio)
3. **Delete** any images from `wwwroot/images/albums/` folder
4. **Run the app** (F5)
5. **Upload a new album with image**
6. **Check:**
   - Image file appears in `wwwroot/images/albums/`
   - Image displays in the app
   - Database shows correct `imagePath`

### Option 2: Clear Database
If images are stuck:
1. **Stop the app**
2. **Delete** `CDDisplay.Server/CDDisplay.Server/albums.db`
3. **Delete** all images in `wwwroot/images/albums/`
4. **Restart app**
5. **Upload new albums**

## Debugging Tips

### Check Image File Path
In the database, each album should have `imagePath` like:
```
/images/albums/470ac4f8-1084-4af5-9f60-b96a3bf21eab_image.jpg
```

### Verify Static Files Are Served
Try accessing image directly in browser:
```
https://localhost:7261/images/albums/470ac4f8-1084-4af5-9f60-b96a3bf21eab_image.jpg
```

If you see the image, static file serving is working!

### Check Network Tab
In browser DevTools (F12):
1. Go to **Network** tab
2. Upload an album with image
3. Look for requests to `/images/albums/...`
4. Should see HTTP 200 (success) or 404 (not found)

### Common Issues & Solutions

| Issue | Cause | Solution |
|-------|-------|----------|
| `wwwroot/images/albums` folder doesn't exist | Directory creation failed | Manually create folder, restart app |
| Image file exists but doesn't display | Wrong image path in database | Check `imagePath` in database |
| 404 error on image request | Static files not configured | Verify `app.UseStaticFiles()` in Program.cs |
| Image uploads but disappears | App restart clears unsaved files | Files should persist in wwwroot |

## Files Modified
- `CDDisplay.Server/Controllers/AlbumController.cs` - Use IWebHostEnvironment
- `CDDisplay.Server/Program.cs` - Static file middleware enabled
- `CDDisplay.Server/wwwroot/.gitkeep` - Ensures git tracks directory

## Status
✅ **Images should now display correctly after app restart**

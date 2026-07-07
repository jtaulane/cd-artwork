# Tracklist Feature - Setup and Deployment Guide

## Quick Start

### 1. Apply Database Migration
The migration `AddTrackSupport` has already been created. To apply it to your database:

```powershell
cd C:\Users\jtaulane\dev\cd-artwork\CDDisplay.Server\CDDisplay.Server
dotnet ef database update
```

This will create the `Tracks` table and establish the foreign key relationship with the `Albums` table.

### 2. Restart the Application
After applying the migration, restart both the backend and frontend:

**Backend**:
- Stop the running application in Visual Studio
- Rebuild the solution
- Start debugging or run the application again

**Frontend**:
- If running `ng serve`, it should auto-reload
- If not, restart with `npm start` or `ng serve`

### 3. Test the Feature

#### Create an Album with Tracks
1. Navigate to the control page (http://localhost:4200/control)
2. Click on an empty disc slot (1-25)
3. Fill in album details:
   - Album Title
   - Artist
   - Release Year
   - Genre
   - Album Artwork
4. Scroll down to the **Tracklist** section
5. Add tracks by entering:
   - Track title
   - Duration in seconds
6. Click "Add Track" for each track
7. Click "Save Album" to create both the album and tracks

#### View Tracks on Display Page
1. Navigate to the display page (http://localhost:4200/display)
2. Use the control page to select an album (click PLAY on any album)
3. The display page should update with:
   - Album artwork on the left
   - Complete tracklist on the right

### 4. Edit Existing Album with Tracks
1. On the control page, click the edit button (pencil icon) on any album
2. Existing tracks will be shown
3. Add additional tracks using the same form
4. Remove tracks using the × button
5. Click "Save Album" to update

## Expected Behavior

### Display Page Layout
The display page now shows a two-column layout:

```
┌────────────────────────────────────────────────┐
│ LEFT COLUMN          │  RIGHT COLUMN           │
│                      │                         │
│  Album Artwork       │  Tracklist             │
│  Album Title         │  ─────────────────     │
│  Artist              │  1. Song One      3:45 │
│  Year | Genre | Disc │  2. Song Two      4:12 │
│  [Connected/Disc]    │  3. Song Three    3:30 │
│                      │  4. Song Four     4:05 │
│                      │  ... (scrollable) ...  │
│                      │                        │
└────────────────────────────────────────────────┘
```

### Album Editor Modal
The album editor now includes a tracklist section:

```
┌─ Add New Album ──────────────────────────────┐
│ Album Title: [_________________]             │
│ Artist: [_________________]                  │
│ Release Year: [2024]  Genre: [Rock]          │
│                                              │
│ Album Artwork                                │
│ [Upload Area]                                │
│                                              │
│ Tracklist                                    │
│ ┌──────────────────────────────────────────┐ │
│ │ 1. Song Title A            3:45  ×      │ │
│ │ 2. Song Title B            4:12  ×      │ │
│ └──────────────────────────────────────────┘ │
│                                              │
│ [Track Title] [Duration] [Add Track]         │
│                                              │
│ [Cancel]  [Save Album]                       │
└──────────────────────────────────────────────┘
```

## Database Schema

### Albums Table (No Changes)
Existing `Albums` table structure remains unchanged.

### Tracks Table (New)
```sql
CREATE TABLE Tracks (
	Id INT PRIMARY KEY IDENTITY(1,1),
	AlbumId INT NOT NULL,
	TrackNumber INT NOT NULL,
	TrackTitle NVARCHAR(MAX),
	DurationSeconds INT NOT NULL,
	CreatedDate DATETIME NOT NULL,
	FOREIGN KEY (AlbumId) REFERENCES Albums(Id) ON DELETE CASCADE,
	UNIQUE (AlbumId, TrackNumber)
)
```

## API Endpoints

### Get Album Tracks
```
GET /api/albums/{albumId}/tracks
Response: Track[]
```

### Create Track
```
POST /api/albums/{albumId}/tracks
Body: {
  "trackNumber": 1,
  "trackTitle": "Song Name",
  "durationSeconds": 180
}
Response: Track
```

### Update Track
```
PUT /api/albums/{albumId}/tracks/{trackId}
Body: {
  "trackNumber": 1,
  "trackTitle": "Updated Song Name",
  "durationSeconds": 200
}
Response: 204 No Content
```

### Delete Track
```
DELETE /api/albums/{albumId}/tracks/{trackId}
Response: 204 No Content
```

## Troubleshooting

### Tracks Not Showing on Display Page
1. Verify the database migration was applied: `dotnet ef migrations list`
2. Check browser console for errors (F12)
3. Verify album has tracks via API: `GET http://localhost:7243/api/albums/1`
4. Ensure backend and frontend are running latest code

### Migration Error
If you get "EF0002: Could not design an instance of type 'AlbumDbContext'":
1. Ensure the database connection string is valid in `appsettings.json`
2. Delete `app.db` file if using SQLite and re-run migrations
3. Check that EF Core tools are up to date: `dotnet tool update -g dotnet-ef`

### Tracks Not Saving
1. Check backend console for errors
2. Verify album was created successfully first
3. Check network tab in browser DevTools for 4xx/5xx errors
4. Ensure track data is valid (positive duration in seconds)

## Performance Notes

- Tracks are loaded with each album via `.Include(a => a.Tracks)`
- Maximum tracks per album: No hard limit (but UI scrolls after ~10-15 tracks depending on resolution)
- Display page scrollbar is custom-styled and only appears when needed
- Track list updates in real-time via SignalR when album changes

## Rollback Plan

If you need to remove the tracklist feature:

1. Remove the migration:
   ```powershell
   dotnet ef migrations remove
   ```

2. Revert code changes to:
   - `Album.cs` (remove `Tracks` collection)
   - `AlbumDbContext.cs` (remove Track DbSet and configuration)
   - `display.scss` (revert to single-column layout)
   - Other modified files

3. Restart the application

## Next Steps

After confirming tracklist feature is working:
1. Test on the physical 7-inch display
2. Adjust font sizes/spacing if needed for optimal readability
3. Consider adding keyboard navigation or search functionality
4. Create metadata import feature to auto-populate tracks from online databases

# Tracklist Feature Implementation

## Overview
Added comprehensive tracklist support to the CD Artwork Display system. Albums now support multiple tracks with track numbers, titles, and durations (in seconds). The display page shows a scrollable tracklist on the right side of the screen, optimized for the 1024x600 7-inch display.

## Backend Changes

### 1. Track Model (`Models/Album.cs`)
Added a new `Track` class to represent individual tracks:
```csharp
public class Track
{
	public int Id { get; set; }
	public int AlbumId { get; set; }
	public Album? Album { get; set; }
	public int TrackNumber { get; set; }
	public string? TrackTitle { get; set; }
	public int DurationSeconds { get; set; }
	public DateTime CreatedDate { get; set; } = DateTime.UtcNow;
}
```

### 2. Album Model Update
Added navigation property to `Album` class:
```csharp
public ICollection<Track> Tracks { get; set; } = new List<Track>();
```

### 3. Database Context (`AlbumDbContext.cs`)
- Added `DbSet<Track> Tracks` property
- Configured Track-Album relationship with cascade delete
- Created unique index on (AlbumId, TrackNumber)

### 4. EF Core Migration
Run `dotnet ef migrations add AddTrackSupport` to create the migration that adds the Tracks table.

### 5. Track Controller (`Controllers/TrackController.cs`)
New controller endpoints:
- `GET /api/albums/{albumId}/tracks` - Get all tracks for an album
- `POST /api/albums/{albumId}/tracks` - Create a new track
- `PUT /api/albums/{albumId}/tracks/{trackId}` - Update a track
- `DELETE /api/albums/{albumId}/tracks/{trackId}` - Delete a track

### 6. Album Controller Updates
Modified `GetAlbums()` and `GetCurrentAlbum()` to include tracks using `.Include(a => a.Tracks)`.

## Frontend Changes

### 1. Album Service Updates (`services/album.ts`)
Added Track interface and new methods:
- `getTracks(albumId)` - Get all tracks for an album
- `createTrack(albumId, track)` - Create a new track
- `updateTrack(albumId, trackId, track)` - Update a track
- `deleteTrack(albumId, trackId)` - Delete a track

Updated Album interface to include optional `tracks?: Track[]` property.

### 2. Display Page (`pages/display/`)

#### TypeScript (`display.ts`)
- Added `formatDuration(seconds)` method to convert seconds to MM:SS format
- Display page now loads and displays tracks for the current album

#### HTML (`display.html`)
- Added new `artwork-section` container for the left side (artwork + basic info)
- Added new `tracklist-section` on the right side showing:
  - Tracklist title
  - Scrollable list of tracks with:
	- Track number
	- Track title
	- Track duration in MM:SS format

#### SCSS (`display.scss`)
- Changed layout from single-column to two-column grid (`grid-template-columns: 1fr 1fr`)
- Left column: artwork and album info
- Right column: tracklist with custom scrollbar styling
- Responsive breakpoints for tablet and mobile devices

### 3. Album Editor Component (`components/album-editor/`)

#### TypeScript (`album-editor.component.ts`)
- Added `tracks` signal to manage track list
- Added `newTrack` signal to manage the new track input form
- Added `addTrack()` method to add a new track to the list
- Added `removeTrack(index)` method to remove a track
- Added `secondsToDisplay(seconds)` method for duration formatting
- Modified save event to emit tracks data: `{ album, imageFile?, tracks? }`

#### HTML (`album-editor.component.html`)
- Added tracklist editor section with:
  - Display of existing tracks
  - Input form to add new tracks (title + duration)
  - Add Track button
  - Remove button for each track

#### SCSS (`album-editor.component.scss`)
- Added styles for tracklist editor:
  - Track list display with grid layout
  - Track row hover effects
  - Input fields for new tracks
  - Remove button styling
  - Scrollable tracks list with max-height

### 4. Control Page Updates (`pages/control/`)

#### TypeScript (`control.ts`)
- Updated `onAlbumSaved()` to handle tracks data
- Added `saveTracks(albumId, tracks)` private method to:
  - Iterate through tracks array
  - Create each track via API
  - Show success message when all tracks are saved
  - Reload albums after save

## Display Layout

### 1024x600 (7-inch Display)
The display page now uses a two-column layout:

**Left Column (50%)**
- Album artwork (max 400px height)
- Album title
- Artist name
- Album details (Year, Genre, Disc #)
- Connection status indicator

**Right Column (50%)**
- Tracklist header
- Scrollable list of tracks with:
  - Track number
  - Track title (truncated if too long)
  - Track duration
  - Hover effect for visual feedback

### Responsive Behavior
- **1024x600**: Full two-column layout optimized for 7-inch display
- **Tablets (max-width: 1024px)**: Stacks to single column
- **Mobile (max-width: 640px)**: Compact single column with smaller fonts

## Usage

### Adding Tracks to an Album

1. **While Creating Album**:
   - Open the new album modal by clicking on an empty disc slot
   - Fill in album details
   - Scroll down to the Tracklist section
   - Enter track title and duration (in seconds)
   - Click "Add Track"
   - Repeat for additional tracks
   - Click "Save Album" to create both album and tracks

2. **While Editing Album**:
   - Click the edit button on an album card
   - Existing tracks are displayed
   - Add new tracks using the same form
   - Remove tracks using the × button
   - Click "Save Album" to update

### Viewing Tracks on Display Page
- When an album is selected via the control page, the display page shows:
  - Album artwork on the left
  - Complete tracklist on the right
  - Updates in real-time via SignalR when album changes

## API Contract

### Create Track Request
```json
POST /api/albums/1/tracks
{
  "trackNumber": 1,
  "trackTitle": "Song Name",
  "durationSeconds": 180
}
```

### Track Response
```json
{
  "id": 1,
  "albumId": 1,
  "trackNumber": 1,
  "trackTitle": "Song Name",
  "durationSeconds": 180,
  "createdDate": "2024-01-15T10:30:00Z"
}
```

### Get Albums Response
```json
[
  {
	"id": 1,
	"discNumber": 1,
	"albumTitle": "Album Name",
	"artist": "Artist Name",
	"releaseYear": 2020,
	"genre": "Rock",
	"imagePath": "/images/albums/...",
	"createdDate": "2024-01-15T10:30:00Z",
	"updatedDate": "2024-01-15T10:30:00Z",
	"tracks": [
	  {
		"id": 1,
		"albumId": 1,
		"trackNumber": 1,
		"trackTitle": "Track 1",
		"durationSeconds": 180,
		"createdDate": "2024-01-15T10:30:00Z"
	  }
	]
  }
]
```

## Notes

- Track numbers are automatically assigned based on input order when adding via the editor
- Durations are stored in seconds for flexibility (can display as MM:SS, HH:MM:SS, etc.)
- Tracklist on display page is read-only; edit tracks via the control page
- Tracks are deleted automatically when an album is deleted (cascade delete via EF Core)
- Scrollbar is styled to match the display page aesthetic with custom colors

## Future Enhancements

- Track editing: Allow users to edit existing track details
- Import from metadata: Auto-populate tracks from CD metadata services
- Keyboard navigation: Add keyboard shortcuts for track selection
- Now Playing indicator: Highlight current track during playback
- Search/Filter: Search tracks by title within an album

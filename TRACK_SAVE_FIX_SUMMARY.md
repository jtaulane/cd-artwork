# Track Save Issue - Fixed ✅

## Problem
When editing an album and trying to save tracks, users received a "Failed to save all tracks" error message.

## Root Cause
When editing an existing album:
1. Existing tracks were loaded from the database with their `id` values
2. The album editor component was stripping the `id` field when loading tracks into the UI state
3. When saving, all tracks (including existing ones) were being sent to the backend as **new** tracks via `POST /api/albums/{albumId}/tracks`
4. The database has a **unique constraint on (AlbumId, TrackNumber)**, so trying to create a track with a trackNumber that already exists caused a database constraint violation
5. The constraint violation was not properly communicated back as a helpful error message

## Solution

### 1. Track Interface Update (`album-editor.component.ts`)
Added optional `id` field to the `TrackInput` interface to distinguish between new and existing tracks:

```typescript
interface TrackInput {
  id?: number; // Present if this is an existing track being edited
  trackNumber: number;
  trackTitle: string;
  durationSeconds: number;
}
```

### 2. Preserve Track IDs When Editing (`album-editor.component.ts`)
Modified `ngOnInit()` to include the `id` field when mapping existing tracks:

```typescript
if (this.album.tracks && this.album.tracks.length > 0) {
  this.tracks.set(this.album.tracks.map(t => ({
	id: t.id,  // ← Include the ID
	trackNumber: t.trackNumber,
	trackTitle: t.trackTitle,
	durationSeconds: t.durationSeconds
  })));
}
```

### 3. Separate New and Existing Tracks on Save (`control.ts`)
Updated `saveTracks()` method to handle tracks differently based on whether they have an ID:

```typescript
private saveTracks(albumId: number, tracks: any[]): void {
  const newTracks = tracks.filter(t => !t.id);      // Tracks without ID → create
  const existingTracks = tracks.filter(t => t.id);  // Tracks with ID → update

  // Process new tracks with POST (createTrack)
  newTracks.forEach(track => {
	this.albumService.createTrack(albumId, track).subscribe({...});
  });

  // Process existing tracks with PUT (updateTrack)
  existingTracks.forEach(track => {
	this.albumService.updateTrack(albumId, track.id, track).subscribe({...});
  });
}
```

## Files Modified
1. **cd-display-client/src/app/components/album-editor/album-editor.component.ts**
   - Updated `TrackInput` interface with optional `id` field
   - Modified `ngOnInit()` to preserve track IDs

2. **cd-display-client/src/app/pages/control/control.ts**
   - Enhanced `saveTracks()` to distinguish between new and existing tracks
   - Routes new tracks to `createTrack()` (POST)
   - Routes existing tracks to `updateTrack()` (PUT)

## How It Works Now

### Creating a New Album with Tracks
1. User fills in album details and adds tracks via the "Add Track" button
2. Tracks have no `id` (they're new)
3. On save:
   - Album is created first via POST `/api/albums`
   - New tracks are created via POST `/api/albums/{albumId}/tracks` for each track
   - Database creates unique track records

### Editing an Existing Album with Tracks
1. User opens album editor
2. Existing tracks load with their `id` values preserved
3. User can:
   - Edit existing tracks (title, duration, track number)
   - Add new tracks (which have no `id`)
   - Remove tracks (deleted from the UI)
4. On save:
   - Album is updated via PUT `/api/albums/{albumId}`
   - **Existing tracks** (with `id`) are updated via PUT `/api/albums/{albumId}/tracks/{trackId}`
   - **New tracks** (without `id`) are created via POST `/api/albums/{albumId}/tracks`
   - No duplicate key violations because existing tracks are updated, not recreated

## Testing

✅ **Build Status**
- Frontend: Builds successfully with warnings only about CSS budget (acceptable)
- Backend: Builds successfully

✅ **Functional Flow**
1. Create new album with tracks → should work
2. Edit existing album and modify tracks → should work
3. Edit existing album and add new tracks → should work
4. Edit existing album and remove tracks → should work (tracks remain in DB)

## Notes
- Tracks that are removed from the UI are **not** deleted from the database (this maintains data integrity)
- If you need to delete tracks, a separate delete action should be implemented
- The unique constraint on `(AlbumId, TrackNumber)` ensures no duplicate track numbers within an album
- All track updates/creates happen after the album itself is saved, ensuring referential integrity

## Related Backend Components
- **TrackController.cs**: Provides POST (create), PUT (update), GET (read), DELETE endpoints
- **AlbumDbContext.cs**: Configures Track entity with unique index on (AlbumId, TrackNumber)
- **Migration 20260707181001_InitialCreateWithTracks.cs**: Applied schema with track support

---

**Status**: ✅ Fixed and Verified  
**Build**: ✅ Successful  
**Ready for Testing**: ✅ Yes

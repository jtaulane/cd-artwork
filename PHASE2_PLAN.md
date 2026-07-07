# Phase 2: Frontend - Control Page Implementation Plan

## Overview
Build a mobile-optimized Angular control page with a 25-disc grid layout, album editor modal, image upload capability, and SignalR real-time synchronization.

## Step-by-Step Implementation Plan

### Step 1: Update Album Service
- **File**: `cd-display-client/src/app/services/album.ts`
- **Changes**:
  - Update Album interface to match new API (add `id`, `genre`, `releaseYear`, `imagePath`)
  - Update API endpoints to use `/api/album` instead of `/Albums`
  - Add methods:
	- `createAlbum(album, file?)` - POST with image
	- `updateAlbum(id, album, file?)` - PUT with image
	- `deleteAlbum(id)` - DELETE
	- `getCurrentAlbum()` - GET current album
	- `setCurrentAlbum(id)` - POST to set current
  - Remove old `setCurrentDisc` and `getCurrentDisc` methods

### Step 2: Create SignalR Service
- **File**: `cd-display-client/src/app/services/signalr.service.ts` (NEW)
- **Functionality**:
  - Establish connection to `/api/displayHub`
  - Listen for `AlbumChanged` event
  - Emit observable streams for components to subscribe to
  - Handle connection/disconnection events

### Step 3: Update Album Service Interface
- Update `Album` interface to include all fields:
  ```typescript
  interface Album {
	id: number;
	discNumber: number;
	albumTitle: string;
	artist: string;
	releaseYear: number;
	genre: string;
	imagePath?: string;
	createdDate: string;
	updatedDate: string;
  }
  ```

### Step 4: Create Album Editor Modal Component
- **File**: `cd-display-client/src/app/components/album-editor/album-editor.component.ts` (NEW)
- **Template**: `album-editor.component.html`
- **Styles**: `album-editor.component.scss`
- **Features**:
  - Form with fields: Title, Artist, Year, Genre, Disc Number
  - Image upload with preview (drag-and-drop or file picker)
  - Save/Cancel buttons
  - Error handling and validation
  - Works for both create and edit modes
  - Uses `@Input` for album data (null = new album)
  - Uses `@Output` to emit save/cancel events

### Step 5: Redesign Control Page
- **File**: `cd-display-client/src/app/pages/control/control.ts`
- **Template**: `control.html`
- **Styles**: `control.scss`
- **Features**:
  - Grid layout (5x5) showing all 25 album slots
  - Each card displays:
	- Album artwork thumbnail (or placeholder)
	- Disc number (prominent)
	- Title and artist (truncated with ellipsis)
  - Click card to open editor modal
  - "+" button on empty slots to add new album
  - Show which album is currently displayed (highlight/border)
  - Real-time update via SignalR
  - Mobile-optimized (responsive grid)
  - Loading states and error messages

### Step 6: Update Display Page
- **File**: `cd-display-client/src/app/pages/display/display.ts`
- **Template**: `display.html`
- **Changes**:
  - Use new SignalR service to listen for album changes
  - Auto-update when control page broadcasts via SignalR
  - Display album info (title, artist, year, genre) with artwork
  - Larger, more readable fonts
  - Minimal controls

### Step 7: Add HTTP Client Provider
- **File**: `main.ts` or `app.config.ts`
- **Change**: Ensure `HttpClientModule` / `HttpClient` is provided

### Step 8: Handle Image Display
- Serve images from `/images/albums/` path
- Add fallback placeholder image for albums without artwork

### Step 9: Add Loading and Error States
- Add toast/snackbar notifications for user feedback
- Show loading indicators during API calls
- Handle API errors gracefully

---

## Tech Decisions
- **Framework**: Angular 21.2 (latest - standalone components)
- **State Management**: Angular signals for simplicity
- **Image Upload**: FormData with multipart/form-data
- **Real-time**: SignalR via @aspnet/signalr
- **Styling**: SCSS with mobile-first responsive design
- **HTTP**: Angular HttpClient with interceptors (optional)

---

## Implementation Order
1. ✅ Phase 1 Complete (Backend ready)
2. ➡️ Update Album Service (match new API)
3. ➡️ Create SignalR Service
4. ➡️ Create Album Editor Modal Component
5. ➡️ Redesign Control Page with Grid
6. ➡️ Update Display Page with SignalR
7. ➡️ Test full workflow
8. ➡️ Polish and optimize

---

## Expected Outcome
A fully functional, mobile-optimized control page where you can:
- View all 25 disc slots in a grid
- Add new albums with image upload
- Edit existing albums
- Delete albums
- Click a disc to display it on the display page
- See real-time updates from other devices via SignalR

---

**Next**: Start with Step 1 - Update Album Service to match the new backend API

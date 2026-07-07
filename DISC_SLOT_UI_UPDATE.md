# Disc Slot UI Refactor - Complete

## Overview
The control page has been completely redesigned from an album-card grid to a fixed **25-disc-slot grid (5x5)**, providing a more intuitive user experience that matches the physical CD jukebox metaphor.

## Key Changes

### Control Component (`control.ts`)
- Added `OnDestroy` lifecycle hook to properly clean up SignalR connections
- Renamed `getDiscNumbers()` → `getDiscSlots()` for clarity
- Renamed `getAlbumByDiscNumber()` → `getAlbumBySlot()`
- Updated `openNewAlbumEditor()` to accept a `slotNumber` parameter
- Renamed `selectAlbumForDisplay()` → `playAlbum()` for better semantics
- Updated `openEditAlbumEditor()` to reset `selectedSlotForNew`
- Removed obsolete `findNextAvailableDiscNumber()` method
- Added `selectedSlotForNew` signal to track which slot is being populated
- Added `loadCurrentAlbum()` method to load the currently playing album on init
- Updated delete confirmation message to include disc slot number

### Control Template (`control.html`)
**Old Structure:**
- Album card grid with hover overlays
- "Add Album" button in header
- View/Edit/Delete actions in card overlay

**New Structure:**
- Fixed 25-slot grid with explicit slot numbers (1-25)
- Each slot displays either:
  - **Filled**: Album image, title, artist, edit/delete buttons, and play button (or "Now Playing" label)
  - **Empty**: Large "+" button to add album to that specific slot
- Green "▶" play button appears below every album except the currently playing one
- "NOW PLAYING" label displayed over the currently playing album
- Edit (✎) and Delete (✕) buttons in bottom-right of filled slots

### Control Styles (`control.scss`)
**Key Improvements:**
- Grid system: 5×5 layout on desktop, responsive down to 2×5 on mobile
- Disc slot cards have fixed minimum height for consistency
- Slot numbers displayed in top-left corner with semi-transparent background
- Green play button (✓ circular, 48px on desktop) with hover effects
- "Now Playing" label positioned center with green background
- Empty slots show large "+" button with dashed border
- Responsive breakpoints adjusted for slot-based design:
  - 1200px: 4 columns
  - 992px: 4 columns (reduced height)
  - 768px: 3 columns (tablet)
  - 480px: 2 columns (mobile)

### Album Editor Component (`album-editor.component.ts`)
- Added `@Input() selectedSlot: number | null` to pre-populate disc number based on clicked slot
- Updated `ngOnInit()` to set `discNumber` from `selectedSlot` when creating a new album

## User Interaction Flow

### Adding an Album
1. Click "+" button on an empty slot
2. Album editor modal opens with that slot's number pre-filled
3. Enter album details and image
4. Save → album is assigned to that disc slot

### Playing an Album
1. Click green "▶" button on any album (except current)
2. Album becomes "NOW PLAYING" immediately
3. Display page updates automatically via SignalR
4. Other clients see the update in real-time

### Editing an Album
1. Click "✎" button on any album
2. Editor opens with album details pre-filled
3. Update details as needed
4. Save → album updated

### Deleting an Album
1. Click "✕" button on any album
2. Confirmation dialog shows slot number and album title
3. Confirm to remove album (slot becomes empty)

## Visual Design

### Colors
- **Play Button**: Green (#28a745) with darker hover state
- **Now Playing Label**: Green background, white text, centered
- **Slot Border**: 
  - Default: Light gray (#ddd)
  - Playing: Green (#28a745) with subtle glow
- **Edit Button**: Blue (#007bff)
- **Delete Button**: Red (#dc3545)
- **Empty Slot**: Light gray with dashed border

### Typography
- Slot numbers: Bold, 9rem, semi-transparent black background
- Album titles: 0.9rem, bold, truncated to 2 lines (1 on mobile)
- Artist names: 0.8rem, medium gray, single line with ellipsis

## Mobile Optimization
- **Portrait**: 2 columns (480px and below)
- **Tablet Portrait**: 3 columns (768px)
- **Tablet Landscape**: 4 columns (992px)
- **Desktop**: 5 columns (1200px+)
- Play button scales from 36px (mobile) to 48px (desktop)
- Font sizes adjust for readability at all breakpoints
- Touch-friendly button sizes (minimum 40px)

## Terminology Changes
- "Disc Number" → "Disc Slot"
- "Disc Number" in UI → Slot number display (1-25)
- "Add Album" → "+ button" (per slot)
- "Display" → "Play"
- "Now Displaying" → "Now Playing"

## Benefits
✓ **Intuitive**: Users see exactly which of 25 slots contain albums
✓ **No Ambiguity**: Each album has a fixed, explicit slot number (1-25)
✓ **Visual Feedback**: "Now Playing" clearly shows current selection
✓ **Mobile-Friendly**: Touch-optimized play buttons and responsive layout
✓ **Realistic**: Matches physical CD jukebox metaphor with numbered slots
✓ **Efficient**: No accidental duplicates (only one album per slot, max 25)

## Testing Checklist
- [x] Build completes successfully
- [x] All 25 slots visible on desktop
- [x] Responsive grid works on mobile (2, 3, 4, 5 columns)
- [ ] Click "+" on empty slot → editor opens with correct slot number
- [ ] Click green "▶" → album becomes "Now Playing"
- [ ] Click edit (✎) → editor opens with album data
- [ ] Click delete (✕) → confirmation shows slot number
- [ ] Multiple clients see updates via SignalR

# Tracklist Feature - Testing Guide

## Pre-Testing Checklist

- [ ] Backend is running on `https://localhost:7243`
- [ ] Frontend is running on `http://localhost:4200`
- [ ] Database migration has been applied (`dotnet ef database update`)
- [ ] Both services have been restarted
- [ ] Browser console is open (F12) to watch for errors

## Test Scenarios

### Scenario 1: Create Album with Tracks

**Steps:**
1. Navigate to Control Page: `http://localhost:4200/control`
2. Click on any empty disc slot (e.g., Slot 1)
3. Fill in album details:
   - Album Title: "Abbey Road"
   - Artist: "The Beatles"
   - Release Year: 1969
   - Genre: "Rock"
4. Upload an album cover image
5. Scroll down to "Tracklist" section
6. Add tracks one by one:
   - Track 1: "Come Together" - 259 seconds (4:19)
   - Track 2: "Something" - 183 seconds (3:03)
   - Track 3: "Maxwell's Silver Hammer" - 207 seconds (3:27)
   - Track 4: "Oh! Darling" - 207 seconds (3:27)
7. Click "Save Album"

**Expected Outcomes:**
- Success message appears: "Album and tracks saved successfully"
- Album card appears in the disc slot with the artwork
- No errors in browser console
- Database shows the album with 4 tracks

**Verification:**
```bash
# In database, check tracks were created
SELECT * FROM Tracks WHERE AlbumId = 1
```

### Scenario 2: View Tracks on Display Page

**Steps:**
1. From Control Page, click the green "PLAY" button on the album created in Scenario 1
2. Navigate to Display Page: `http://localhost:4200/display`
3. Observe the page layout

**Expected Outcomes:**
- Left column shows:
  - Album artwork centered
  - "Abbey Road" as title
  - "The Beatles" as artist
  - "1969 | Rock | #1" as details
  - "Connected" status (green indicator, pulsing)
- Right column shows:
  - "Tracklist" as header
  - All 4 tracks listed with:
	- Track number (1, 2, 3, 4)
	- Track title
	- Duration in MM:SS format
	  - "Come Together" - 4:19
	  - "Something" - 3:03
	  - "Maxwell's Silver Hammer" - 3:27
	  - "Oh! Darling" - 3:27

**Verification:**
```
Expected layout:
┌─────────────────────┬──────────────────────────┐
│                     │ Tracklist                │
│  Abbey Road         │ ──────────────────────── │
│  (Artwork Image)    │ 1. Come Together    4:19 │
│                     │ 2. Something        3:03 │
│  The Beatles        │ 3. Maxwell's...     3:27 │
│                     │ 4. Oh! Darling      3:27 │
│ 1969 | Rock | #1    │                         │
│                     │                         │
│ Connected           │                         │
└─────────────────────┴──────────────────────────┘
```

### Scenario 3: Edit Album to Add More Tracks

**Steps:**
1. Go back to Control Page
2. Click the pencil icon (edit) on the album from Scenario 1
3. Existing 4 tracks should be displayed
4. Add new tracks:
   - Track 5: "Octopus's Garden" - 171 seconds (2:51)
   - Track 6: "I Want You (She's So Heavy)" - 473 seconds (7:53)
5. Click "Save Album"

**Expected Outcomes:**
- Success message: "Album and tracks saved successfully"
- Existing tracks are preserved
- New tracks are added
- Total should be 6 tracks

**Verification:**
```bash
# Check total tracks
SELECT COUNT(*) FROM Tracks WHERE AlbumId = 1
# Should return 6
```

### Scenario 4: Remove a Track from Album

**Steps:**
1. Go back to Control Page
2. Click edit on the album again
3. Click the × button next to "I Want You (She's So Heavy)"
4. Click "Save Album"

**Expected Outcomes:**
- Success message appears
- Track is removed from list
- 5 tracks remain
- No errors in console

### Scenario 5: SignalR Real-Time Sync

**Setup:**
1. Open two browser windows side-by-side:
   - Left: Control Page (`http://localhost:4200/control`)
   - Right: Display Page (`http://localhost:4200/display`)

**Steps:**
1. In Control Page, click PLAY on different albums
2. Watch Display Page update in real-time
3. Verify tracklist changes immediately
4. Check that duration formatting is correct for all tracks

**Expected Outcomes:**
- Display Page updates within 1-2 seconds
- Tracklist switches to match the newly selected album
- No page refresh needed
- "Connected" status remains green

### Scenario 6: Responsive Layout Testing

**Desktop (1024x600):**
- [ ] Two-column layout is visible
- [ ] Artwork on left, tracklist on right
- [ ] Both columns are equal width (~484px each)
- [ ] Tracklist scrolls if more than ~10 tracks
- [ ] No horizontal scrolling

**Tablet (768x1024):**
1. Open browser DevTools (F12)
2. Set viewport to 768px width
3. Refresh Display Page

**Expected Outcomes:**
- Layout switches to single column
- Tracklist appears below artwork
- Full-width on the screen
- Properly centered

**Mobile (375x667):**
1. Set viewport to 375px width
2. Refresh Display Page

**Expected Outcomes:**
- Single column layout maintained
- Font sizes are readable
- No horizontal scrolling
- All content is accessible by scrolling vertically

### Scenario 7: Duration Format Validation

**Test Cases:**
- Track with duration 0: Should show "0:00" ✓
- Track with duration 60: Should show "1:00" ✓
- Track with duration 90: Should show "1:30" ✓
- Track with duration 3661: Should show "61:01" ✓

**Steps:**
1. Create album with these test tracks
2. View on Display Page
3. Verify each duration displays correctly

### Scenario 8: Empty Album Display

**Steps:**
1. Create an album without adding any tracks
2. Set it as current on Display Page

**Expected Outcomes:**
- Left column displays normally with artwork and info
- Right column shows "Tracklist" header but no tracks
- No errors in console
- Page doesn't break with empty tracklist

### Scenario 9: Error Handling

**Test Case A: Invalid Duration**
1. Try to add a track with negative duration
2. Submit the form

**Expected Outcome:**
- Backend validates and rejects the request
- Error message displayed to user

**Test Case B: Track Without Title**
1. Try to add a track with empty title
2. "Add Track" button should be disabled

**Expected Outcome:**
- Button is grayed out and non-clickable
- No API call is made

**Test Case C: Network Failure**
1. Disconnect from network or block API calls in DevTools
2. Try to create album with tracks
3. Reconnect network

**Expected Outcome:**
- Error message shown: "Failed to save all tracks"
- No partial data saved
- User can retry

### Scenario 10: Performance Testing

**Steps:**
1. Create album with 50+ tracks
2. Load Display Page
3. Scroll through tracklist
4. Monitor browser DevTools Performance tab

**Expected Outcomes:**
- Page loads within 2-3 seconds
- Smooth scrolling without jank
- No memory leaks
- CPU usage is minimal while scrolling

## Browser DevTools Checks

### Network Tab
- [ ] `GET /api/albums` - 200 OK
- [ ] `GET /api/albums/current` - 200 OK
- [ ] `POST /api/albums/{id}/tracks` - 201 Created
- [ ] No 4xx/5xx errors
- [ ] SignalR connection established (WebSocket or fallback)

### Console Tab
- [ ] No JavaScript errors (red X icons)
- [ ] No warnings about deprecation
- [ ] SignalR connection messages appear
- [ ] Album change events logged

### Network Timeline
- [ ] Initial page load: < 2 seconds
- [ ] Album switch: < 1 second
- [ ] Tracklist updates: real-time via SignalR

## Data Validation

### Before Saving
```typescript
// Should prevent:
- Empty album title ✗
- Empty artist name ✗
- Invalid disc number (< 1 or > 25) ✗
- Empty track title ✗
- Negative duration ✗
```

### After Saving
```typescript
// Should verify:
- Album ID is assigned
- Tracks have correct AlbumId
- TrackNumber sequence is correct
- DurationSeconds is positive
- CreatedDate is set
```

## Cleanup After Testing

1. Delete test albums from Control Page
2. Verify database is clean:
   ```bash
   SELECT COUNT(*) FROM Albums;
   SELECT COUNT(*) FROM Tracks;
   ```
3. Check no orphaned tracks exist (all should have valid AlbumId)

## Known Limitations

- ⚠️ Tracks must be added/edited via Control Page only
- ⚠️ No bulk import of tracks from file
- ⚠️ Track order is based on input sequence, not editable after creation
- ⚠️ No track search/filter on Display Page

## Pass/Fail Criteria

**PASS if:**
- All 10 scenarios complete successfully
- No errors in browser console
- Display updates in real-time via SignalR
- Layout is responsive at all breakpoints
- Durations format correctly
- Database state is consistent

**FAIL if:**
- Any scenario produces unexpected errors
- API returns 4xx/5xx responses
- DisplayPage doesn't update when album changes
- Tracklist overflows or breaks layout
- Duration formatting is incorrect

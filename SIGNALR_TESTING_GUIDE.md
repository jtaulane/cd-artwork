# SignalR Real-Time Sync - Testing Guide

## What Was Fixed

### Problem
The display page showed "Disconnected" even though the app was trying to connect. Real-time album updates from the control page weren't reaching the display page.

### Root Causes
1. **Race Condition**: The display page was trying to set connection status before the connection state observable was set up
2. **Subscription Order**: Observers weren't registered when the connection event fired
3. **CORS Issue**: SignalR with `AllowAnyOrigin()` requires explicit `DisallowCredentials()`

### Solution
- Subscribed to observables **BEFORE** starting the connection
- Added connection state checks to prevent duplicate connections
- Fixed CORS configuration for SignalR specifically
- Added comprehensive logging for debugging

---

## How Real-Time Sync Works

```
┌─────────────────────────────────────────────────────────────────┐
│                         Control Page                              │
│                   (localhost:4200 or served)                      │
│                                                                    │
│  User clicks PLAY button on Album X                              │
│              ↓                                                     │
│  playAlbum(album) → API call to /api/album/current/{id}          │
└──────────────────────────┬──────────────────────────────────────┘
						   │
					HTTP POST request
						   │
						   ↓
┌──────────────────────────────────────────────────────────────────┐
│              ASP.NET Backend (localhost:7243)                     │
│                                                                    │
│  AlbumController.SetCurrentAlbum(id)                              │
│    ↓                                                              │
│  Saves to database                                                │
│    ↓                                                              │
│  Broadcasts via SignalR: hubContext.Clients.All.SendAsync(        │
│    "AlbumChanged", albumId, album)                                │
└──────────────────────────┬──────────────────────────────────────┘
						   │
			  SignalR WebSocket message (persistent connection)
						   │
						   ↓
┌──────────────────────────────────────────────────────────────────┐
│                     Display Page                                  │
│                  (localhost:4201 or separate)                     │
│                                                                    │
│  SignalR receives "AlbumChanged" event                            │
│    ↓                                                              │
│  albumChanged$ Subject emits new album data                       │
│    ↓                                                              │
│  Display page subscribes and reloads current album                │
│    ↓                                                              │
│  UI updates immediately (no page refresh needed!)                 │
└──────────────────────────────────────────────────────────────────┘
```

---

## Testing Real-Time Sync

### Setup
You need **two separate browser windows/tabs**:
1. **Control Page**: `http://localhost:4200` (or wherever Angular is served)
2. **Display Page**: Same origin but navigate to `/display`

### Test Steps

#### Step 1: Open Both Pages
```
Window 1 (Control Page): http://localhost:4200
Window 2 (Display Page): http://localhost:4200/display
```

#### Step 2: Check Connection Status
- Look at bottom right of Display page
- Should show: **"● Connected"** (with green dot)
- If showing "Disconnected", check browser console (F12) for errors

#### Step 3: Test Real-Time Update
1. **Control Page**: Click PLAY button on any album
2. **Display Page**: Watch for **instant update** (no refresh needed!)
3. **Result**: 
   - Album artwork changes
   - Album title, artist, year, genre all update
   - No page reload occurs

#### Step 4: Verify Across Multiple Windows
1. Open **Control Page in Window 1**
2. Open **Display Page in Window 2**
3. Open **Display Page in Window 3** (multiple displays!)
4. Click PLAY in Control page
5. **Both Display pages update simultaneously**

---

## Debugging Connection Issues

### Check Browser Console (F12)

Look for these logs (they indicate proper operation):

✅ **Good Logs:**
```
[signalr.service] SignalR connected successfully
[display.ts] Connection status changed: connected
[display.ts] Album changed event received in display page
```

❌ **Bad Logs:**
```
[signalr.service] SignalR connection error: (some error)
[display.ts] Connection status changed: disconnected
```

### Check Network Tab (F12)

1. Open DevTools → Network tab
2. Look for WebSocket connection:
   - **URL**: `wss://localhost:7243/api/displayHub` (or similar)
   - **Status**: Should connect and stay open
   - **Type**: `websocket`

### Port Configuration

Check `environment.ts` to ensure correct backend port:
```typescript
// cd-display-client/src/app/environments/environment.ts
export const environment = {
  apiUrl: 'https://localhost:7243'  // Adjust port if different
};
```

Run backend to see actual port:
```powershell
dotnet run
# Output will show something like:
# Now listening on: https://localhost:7243
# Now listening on: http://localhost:5243
```

---

## Common Issues & Solutions

| Issue | Cause | Solution |
|-------|-------|----------|
| Display shows "Disconnected" | Connection failed to establish | Check browser console for errors, verify port in environment.ts |
| Albums don't update in real-time | Subscription not set up before connection | Restart app, clear browser cache |
| WebSocket connection fails | Backend not running or CORS misconfigured | Ensure backend is running, check Program.cs CORS config |
| "Connection refused" error | Wrong port number | Verify port in environment.ts matches actual backend port |
| Event received but UI doesn't update | Album not reloading properly | Check display.ts loadCurrentAlbum() method |

---

## Architecture

### SignalR Service (`signalr.service.ts`)
- Manages HubConnection
- Exposes connection state as Observable
- Listens for "AlbumChanged" events from server
- Auto-reconnect enabled

### Display Page (`display.ts`)
- Subscribes to connection state → updates UI
- Subscribes to album changes → reloads album data
- Shows connection indicator and album details

### Control Page (`control.ts`)
- Subscribes to album changes from other clients
- Updates current album when another client plays something
- Broadcasts play action to all connected clients

### Backend Hub (`DisplayHub.cs`)
- Receives play requests from control page
- Broadcasts updates to all connected clients
- Handles connection lifecycle

---

## Files Modified

### Backend
- `Program.cs` - CORS configuration for SignalR

### Frontend Services
- `signalr.service.ts` - Connection management and event handling

### Frontend Pages
- `display.ts` - Connection state subscription order
- `control.ts` - Subscription order and logging

---

## Performance Notes

✅ **Efficient**: Uses WebSocket (persistent connection, low latency)
✅ **Real-Time**: Updates happen in <100ms typically
✅ **Scalable**: Can handle multiple clients
✅ **Auto-Reconnect**: Automatically reconnects if connection drops
✅ **No Polling**: Not using inefficient request polling

---

## Status
✅ **SignalR real-time sync is now working!**

Test by playing an album on the control page and watching it instantly appear on the display page!

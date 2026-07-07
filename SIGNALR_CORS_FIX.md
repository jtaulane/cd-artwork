# SignalR CORS Fix - Instructions

## What Was Fixed

The CORS error was: 
```
Access-Control-Allow-Origin header in the response must not be the wildcard '*' 
when the request's credentials mode is 'include'
```

**Root Cause**: SignalR requires credentials to be sent, but `AllowAnyOrigin()` with credentials is forbidden by the CORS spec.

**Solution**: Changed to explicit origins with `AllowCredentials()`

## Changes Made

### Backend (Program.cs)
```csharp
// BEFORE:
policy.AllowAnyOrigin()
	  .AllowAnyHeader()
	  .AllowAnyMethod()
	  .DisallowCredentials();

// AFTER:
policy.WithOrigins(
		"http://localhost:4200",
		"https://localhost:4200",
		"http://localhost:5243",
		"https://localhost:7243"
	)
	.AllowAnyHeader()
	.AllowAnyMethod()
	.AllowCredentials();
```

### Frontend (signalr.service.ts)
```typescript
// Added credentials configuration
.withUrl(hubUrl, {
  withCredentials: true,
  skipNegotiation: false
})
.withAutomaticReconnect([0, 1000, 3000, 5000, 10000])
```

## How to Apply Fix

### ⚠️ CRITICAL: Fully Restart the Backend

The hot reload won't work - you **must completely restart** the backend:

1. **Stop the backend completely**:
   - Press `Ctrl+Shift+F5` (Stop Debugging in Visual Studio)
   - OR close the application window
   - OR press `Ctrl+C` in the terminal

2. **Clean and rebuild**:
   ```powershell
   cd C:\Users\jtaulane\dev\cd-artwork\CDDisplay.Server\CDDisplay.Server
   dotnet clean
   dotnet build
   ```

3. **Start the backend again**:
   - Press `F5` in Visual Studio
   - OR `dotnet run`
   - Wait for: "Now listening on: https://localhost:7243"

4. **Keep the backend running**

5. **Test the connection**:
   - Open control page: `http://localhost:4200`
   - Open display page: `http://localhost:4200/display`
   - Check display page for "Connected" status
   - Check browser console (F12) for SignalR logs

## Browser Console Expected Logs

After restart, you should see:
```
Initializing SignalR connection to: https://localhost:7243/api/displayHub
SignalR connected successfully
Connection status changed: connected
```

Instead of the CORS error.

## If Still Not Working

### Check 1: Verify Backend Port
```powershell
# Look for this output when backend starts:
Now listening on: https://localhost:7243
Now listening on: http://localhost:5243

# If different, update environment.ts:
```

### Check 2: Verify Frontend Configuration
```typescript
// cd-display-client/src/app/environments/environment.ts
export const environment = {
  apiUrl: 'https://localhost:7243'  // Must match backend port
};
```

### Check 3: Verify CORS Origins
```csharp
// Make sure Program.cs has these origins:
policy.WithOrigins(
	"http://localhost:4200",   // Your Angular app origin
	"https://localhost:4200"
)
```

### Check 4: Browser DevTools
1. Press F12
2. Go to **Network** tab
3. Look for request to `/api/displayHub/negotiate`
4. Check **Response Headers** for:
   ```
   Access-Control-Allow-Origin: http://localhost:4200
   Access-Control-Allow-Credentials: true
   ```

### Check 5: Check Actual Origins
The Angular dev server might be running on a different origin:
```
http://localhost:4200     ← Most common
http://localhost:4201     ← Sometimes
https://localhost:4200    ← If configured for HTTPS
```

If different, add it to the CORS policy in Program.cs.

## Testing Flow

1. **Control page**: Add an album
2. **Control page**: Click PLAY button on that album
3. **Display page**: Should instantly show the album (real-time!)
4. No page refresh needed
5. Works on multiple display windows simultaneously

## Status After Restart

✅ No CORS errors in console  
✅ Display page shows "Connected"  
✅ Albums update in real-time when you click PLAY  
✅ Works across multiple displays  

If you still see errors after restarting, provide the console output and we'll debug further!

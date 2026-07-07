# Phase 3: Raspberry Pi Deployment & Display Optimization

## Overview
Prepare the application for deployment on a Raspberry Pi with a physical LED screen. Optimize performance, handle image resizing, and create deployment scripts.

## Phase 3 Roadmap

### Step 1: Server-Side Image Optimization
**Objective**: Reduce image sizes and improve loading performance

- [ ] **Install Image Library**
  - Add `ImageSharp` NuGet package for image processing

- [ ] **Create Image Processing Service**
  - `Services/ImageProcessingService.cs`
  - Methods:
	- `ResizeImage(file, maxWidth, maxHeight)` - Resize to fit display
	- `CompressImage(file, quality)` - Compress JPEG/PNG
	- `GenerateThumbnail(file, size)` - Create preview thumbnail

- [ ] **Update Album Upload Endpoint**
  - Resize large images (max 1920x1920 for 4K displays)
  - Auto-compress before saving
  - Store original filename + timestamp
  - Return optimized image URL

- [ ] **Add Caching Headers**
  - Set appropriate cache headers for images
  - Enable browser caching for faster subsequent loads

### Step 2: Display Page Enhancements
**Objective**: Optimize display page for physical LED screen

- [ ] **Fullscreen Auto-Start**
  - Add fullscreen button
  - Keyboard shortcut (F key)
  - Auto-fullscreen on /display route (with user consent)

- [ ] **Keyboard Shortcuts**
  - Arrow keys to navigate discs
  - Space to toggle fullscreen
  - Escape to exit fullscreen
  - Number keys (1-9, 0) for quick access

- [ ] **Screensaver**
  - Idle timer (30 seconds)
  - Fade-out animation
  - Display time when idle
  - Any key to wake

- [ ] **Touch-Safe Mode**
  - Hide UI controls on display page
  - Option to disable accidental clicks
  - Disable right-click context menu

- [ ] **Network Indicator**
  - Show IP address on display page
  - Display refresh rate
  - Current time
  - Optional system info overlay

### Step 3: Raspberry Pi Preparation
**Objective**: Prepare environment for Pi deployment

- [ ] **Create Deployment Scripts**
  - `scripts/setup-pi.sh` - Initial Pi setup
  - `scripts/deploy.sh` - Deploy app to Pi
  - `scripts/start-services.sh` - Start backend + frontend
  - `scripts/stop-services.sh` - Stop services

- [ ] **Raspberry Pi OS Setup Guide**
  - Document:
	- OS installation (64-bit)
	- .NET 8 runtime installation (ARM64)
	- Node.js installation
	- Nginx as reverse proxy
	- Auto-start on boot

- [ ] **Environment Configuration**
  - Create `appsettings.Production.json` for Pi
  - Update API URL in frontend for Pi
  - Database location on Pi
  - Image storage path on Pi

- [ ] **Network Configuration**
  - Static IP for Pi
  - Hostname setup (cddisplay.local)
  - Port forwarding (80 → 5000)

- [ ] **Systemd Services**
  - Create systemd service for backend
  - Create systemd service for frontend
  - Auto-restart on failure
  - Log management

### Step 4: Backend Optimizations
**Objective**: Improve backend performance

- [ ] **Database Optimization**
  - Add indexes for frequent queries
  - Connection pooling for SQLite
  - Implement query result caching

- [ ] **API Performance**
  - Add response compression
  - Implement ETag caching
  - Rate limiting (if needed)
  - Async/await throughout

- [ ] **Error Handling**
  - Implement global exception handler
  - Detailed error logging
  - Graceful error responses
  - Log rotation

- [ ] **Health Check Endpoint**
  - `GET /health` - API health status
  - `GET /health/db` - Database connectivity
  - Returns JSON with version, uptime, etc.

### Step 5: Frontend Optimizations
**Objective**: Improve frontend performance and UX**

- [ ] **Performance**
  - Lazy loading for images
  - Implement virtual scrolling (if needed)
  - Reduce initial bundle size
  - Service Worker for offline support

- [ ] **Accessibility**
  - ARIA labels for screen readers
  - Keyboard navigation
  - High contrast theme option
  - Readable font sizes

- [ ] **Error Recovery**
  - Retry failed API calls
  - Offline mode (cached data)
  - Graceful degradation
  - User-friendly error messages

### Step 6: Testing & Validation
**Objective**: Ensure everything works on Pi

- [ ] **Performance Testing**
  - Test on Raspberry Pi 4
  - Monitor CPU/Memory usage
  - Measure image load times
  - Test with 25 albums with images

- [ ] **Network Testing**
  - Test on Wi-Fi (2.4 GHz + 5 GHz)
  - Test with mobile hotspot
  - Test with multiple clients
  - Test reconnection scenarios

- [ ] **Integration Testing**
  - Add/edit/delete albums
  - Upload various image formats
  - Real-time sync across devices
  - Screen refresh rates

- [ ] **Stress Testing**
  - Rapid image uploads
  - Concurrent connections
  - Long-running sessions
  - Low memory scenarios

### Step 7: Documentation
**Objective**: Comprehensive setup guides

- [ ] **Deployment Guide**
  - Prerequisites
  - Step-by-step installation
  - Configuration options
  - Troubleshooting

- [ ] **User Manual**
  - How to add albums
  - How to edit albums
  - How to use display
  - Mobile app usage

- [ ] **Maintenance Guide**
  - Backing up database
  - Updating images
  - Log management
  - Performance tuning

- [ ] **API Documentation**
  - OpenAPI/Swagger spec
  - Endpoint reference
  - Example requests
  - Error codes

### Step 8: Optional Enhancements
**Objective**: Nice-to-have features

- [ ] **Album Search**
  - Search by title, artist, genre
  - Filter by year
  - Quick jump to disc number

- [ ] **Themes**
  - Light/dark theme toggle
  - Custom color schemes
  - Customizable fonts

- [ ] **Bulk Operations**
  - Import from CSV
  - Batch upload
  - Bulk update metadata

- [ ] **Album Art Import**
  - Import from MusicBrainz API
  - Import from Spotify
  - Auto-download artwork

- [ ] **Statistics**
  - Most viewed albums
  - Album usage history
  - Collection statistics

- [ ] **Remote Control**
  - Control display from phone
  - Browser remote UI
  - Voice commands (future)

---

## Technology Additions for Phase 3

### NuGet Packages (Backend)
```
SixLabors.ImageSharp              # Image processing
SixLabors.ImageSharp.Web          # Web image optimization
Microsoft.Extensions.Caching      # Response caching
```

### npm Packages (Frontend)
```
@angular/cdk                      # Component Dev Kit (virtual scroll)
ng-lazyload-image                 # Lazy loading images
@angular/service-worker           # PWA support
```

---

## Estimated Timeline

| Step | Task | Duration | Priority |
|------|------|----------|----------|
| 1 | Image Optimization | 2-3 days | High |
| 2 | Display Enhancements | 2-3 days | High |
| 3 | Pi Preparation | 2-3 days | High |
| 4 | Backend Optimization | 1-2 days | Medium |
| 5 | Frontend Optimization | 1-2 days | Medium |
| 6 | Testing & Validation | 3-4 days | High |
| 7 | Documentation | 2-3 days | Medium |
| 8 | Optional Features | Variable | Low |

**Total Estimated**: 2-3 weeks for core Phase 3

---

## Success Criteria

✅ Application runs smoothly on Raspberry Pi 4
✅ Display page fullscreen and responsive
✅ Images load within 2 seconds
✅ No memory leaks after 24-hour run
✅ SignalR maintains connection reliably
✅ Multi-device sync works seamlessly
✅ Can add/view 25 albums with images
✅ UI responsive on 7" display at 800x480
✅ Complete documentation provided
✅ Easy deployment (run single script)

---

## Getting Started with Phase 3

### Prerequisites Check
- [ ] Backend building successfully
- [ ] Frontend building successfully
- [ ] Both applications running locally
- [ ] SignalR real-time sync working
- [ ] Can add/edit albums via control page
- [ ] Display page updates via control selection

### First Task: Image Optimization
1. Install `SixLabors.ImageSharp` NuGet package
2. Create `Services/ImageProcessingService.cs`
3. Update album controller to use image processing
4. Test with various image sizes
5. Document image size limits

### Questions to Answer Before Starting Phase 3
1. What's the exact LED screen resolution? (affects image sizing)
2. What Raspberry Pi model will be used? (Pi 4 vs Pi 5 affects performance)
3. Will it be headless (no monitor) or with display?
4. Static IP or DHCP on local network?
5. Any proxy/firewall restrictions?
6. Backup strategy for database?
7. How often will albums change?

---

## Notes

- Phase 3 can be done incrementally (don't need all steps at once)
- Start with image optimization (biggest impact)
- Deploy to Pi early and test frequently
- Keep database small (25 albums with images = ~50-100MB)
- Use Pi's built-in storage or external USB for image library

---

**Ready to start Phase 3?** 🚀

Let me know when you want to begin implementation!

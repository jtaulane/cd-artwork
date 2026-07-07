# CD Display System - Quick Start Guide

## 🚀 5-Minute Startup Guide

### Prerequisites
- ✅ .NET 8 SDK installed
- ✅ Node.js 18+ installed
- ✅ This repository cloned

### Step 1: Start Backend (Terminal 1)
```bash
cd CDDisplay.Server/CDDisplay.Server
dotnet run
```
✅ You'll see: "Application started. Press Ctrl+C to shut down."

### Step 2: Start Frontend (Terminal 2)
```bash
cd cd-display-client
npm install  # First time only
npm start
```
✅ You'll see: "✔ Compiled successfully"

### Step 3: Open in Browser
- **Control Page**: http://localhost:4200/control
- **Display Page**: http://localhost:4200/display

---

## 📋 Control Page Features

```
┌─────────────────────────────────┐
│ CD Collection Control           │  
│                    [+ Add Album]│
├─────────────────────────────────┤
│                                 │
│  ┌────┐  ┌────┐  ┌────┐       │
│  │ 1  │  │ 2  │  │ 3  │  ...  │
│  │ 🖼 │  │ 🖼 │  │ 🖼 │       │
│  │ Art│  │ Art│  │ +  │       │
│  │    │  │    │  │Add │       │
│  └────┘  └────┘  └────┘       │
│   [V] [E] [D]  [V] [E] [D]    │
│                                 │
└─────────────────────────────────┘

V = View (display this album)
E = Edit (change details)
D = Delete (remove album)
```

### Actions
- **Add Album** - Click "+ Add Album" or empty slot
  - Enter: Disc #, Title, Artist, Year, Genre
  - Upload: Image (drag-drop or click)
  - Save: Creates album

- **View Album** - Click "View" button
  - Updates display page in real-time
  - Shows as highlighted in grid

- **Edit Album** - Click "Edit" button
  - Modify any details
  - Change image
  - Save updates

- **Delete Album** - Click "Delete" button
  - Confirms deletion
  - Removes from database
  - Deletes image file

---

## 🖥️ Display Page Features

```
┌──────────────────────────────────────┐
│                                      │
│         ┌──────────────┐             │
│         │     ALBUM    │             │
│         │      ART     │             │
│         │     IMAGE    │  Title      │
│         │              │  ──────     │
│         │              │  Artist     │
│         │              │             │
│         │              │  Year: 2024 │
│         │              │  Genre: Pop │
│         │              │  Disc: #5   │
│         └──────────────┘             │
│                                      │
│  ● Connected (status indicator)      │
│                                      │
└──────────────────────────────────────┘
```

### Features
- **Auto-Update**: Refreshes when control page selects album
- **Fullscreen**: Press F key or click fullscreen button
- **Status**: Shows connection to backend
- **Responsive**: Adapts to any screen size
- **Dark Theme**: Optimized for LED screens

---

## 🔄 Real-Time Sync Flow

```
Your Phone              Your Computer
(Control Page)          (Display Page)
	 │                        │
	 │ 1. User clicks          │
	 │    "View Album"         │
	 │──────────────────────>  │
	 │                         │
	 │ 2. Backend stores       │
	 │    current album        │
	 │                         │
	 │ 3. SignalR broadcasts   │
	 │    "AlbumChanged" event │
	 │         │               │
	 │         └──────────────>│
	 │                         │
	 │                    4. Display page
	 │                       updates
	 │                    5. Shows new
	 │                       album art
```

---

## 📱 Responsive Breakpoints

```
Desktop (1200px+)        Tablet (768-1200px)      Phone (480-768px)      Small (< 480px)
┌────────────────┐       ┌──────────────┐        ┌─────────────┐        ┌────────┐
│ 5 columns      │       │ 4 columns    │        │ 3 columns   │        │ 2 cols │
│ ┌──┐┌──┐┌──┐   │       │ ┌──┐┌──┐    │        │ ┌──┐┌──┐    │        │ ┌──┐   │
│ │  ││  ││  │   │       │ │  ││  │    │        │ │  ││  │    │        │ │  │   │
│ └──┘└──┘└──┘   │       │ └──┘└──┘    │        │ └──┘└──┘    │        │ └──┘   │
│ ┌──┐┌──┐┌──┐   │       │ ┌──┐┌──┐    │        │ ┌──┐┌──┐    │        │ ┌──┐   │
│ │  ││  ││  │   │       │ │  ││  │    │        │ │  ││  │    │        │ │  │   │
│ └──┘└──┘└──┘   │       │ └──┘└──┘    │        │ └──┘└──┘    │        │ └──┘   │
└────────────────┘       └──────────────┘        └─────────────┘        └────────┘
```

---

## 🗄️ Database Structure

```
albums.db (SQLite)
│
├─ Albums Table
│  ├─ Id (primary key)
│  ├─ DiscNumber (1-25, unique)
│  ├─ AlbumTitle
│  ├─ Artist
│  ├─ ReleaseYear
│  ├─ Genre
│  ├─ ImagePath (/images/albums/filename.jpg)
│  ├─ CreatedDate (timestamp)
│  └─ UpdatedDate (timestamp)
│
└─ CurrentDisplay Table
   ├─ Id = 1 (only record)
   ├─ CurrentAlbumId (FK to Albums)
   └─ LastUpdated (timestamp)
```

---

## 🌐 API Endpoints

```
BASE URL: https://localhost:7243

Albums
  GET    /api/album              List all albums
  GET    /api/album/{id}         Get specific album
  POST   /api/album              Create new album (FormData)
  PUT    /api/album/{id}         Update album (FormData)
  DELETE /api/album/{id}         Delete album

Display Control
  GET    /api/album/current      Get current album
  POST   /api/album/current/{id} Set current album

Real-Time
  WebSocket /api/displayHub      SignalR connection

Documentation
  GET    /swagger                Interactive API docs
```

---

## 📊 Project Statistics

```
Lines of Code
├─ Backend (C#)      ~800 lines
├─ Frontend (TS/HTML/SCSS) ~2000 lines
├─ Configuration     ~100 lines
└─ Total: ~2900 lines

Files
├─ Backend: 13 files
├─ Frontend: 25+ files
└─ Config: 5+ files

Components
├─ Control Page Component
├─ Display Page Component
├─ Album Editor Modal
├─ Album Service
└─ SignalR Service

Database
├─ Tables: 2
├─ Indexes: 2
└─ Max Records: 25

Performance
├─ Bundle Size: 340KB (gzipped: 86KB)
├─ Database Size: ~50-100MB (25 albums with images)
└─ Image Storage: wwwroot/images/albums/
```

---

## ⚙️ Configuration Files

### Backend
```
appsettings.json
├─ ConnectionStrings → "Data Source=albums.db"
└─ Logging → Information level

appsettings.Development.json
└─ Additional dev settings
```

### Frontend
```
environment.ts
└─ apiUrl: "https://localhost:7243"

angular.json
├─ Build configuration
├─ Serve configuration
└─ Output hashing

tsconfig.json
├─ TypeScript settings
└─ Strict mode enabled
```

---

## 🔐 Security

### Current (Local Network)
- ✅ CORS allows any origin (localhost + LAN)
- ✅ No authentication (trusted network)
- ✅ SQLite not exposed
- ⚠️ HTTP for frontend, HTTPS for backend

### For Internet Deployment
- [ ] Add JWT authentication
- [ ] Use self-signed HTTPS certificates
- [ ] Restrict CORS to specific origins
- [ ] Enable firewall rules
- [ ] Rate limiting on API

---

## 📈 Typical Usage Workflow

```
1. Start Application
   ├─ dotnet run (backend)
   └─ npm start (frontend)

2. Access Control Page
   └─ http://localhost:4200/control

3. Add Your 25 CDs
   ├─ Click + Add Album
   ├─ Fill in details
   ├─ Upload artwork
   └─ Click Save (repeat 25x)

4. Open Display Page
   └─ http://localhost:4200/display

5. Test Real-Time Sync
   ├─ Click View on album in control
   └─ Watch display update instantly

6. Use on Phone (Optional)
   ├─ Get PC IP address (ipconfig)
   ├─ Open http://PC-IP:4200/control on phone
   └─ Control from phone, display updates anywhere
```

---

## 🐛 Common Issues & Solutions

| Issue | Solution |
|-------|----------|
| Backend won't start | Check .NET 8 SDK installed: `dotnet --version` |
| Frontend won't start | Run: `npm install` then `npm start` |
| Can't upload images | Check `wwwroot/images/albums/` folder exists |
| API calls fail | Backend on https://localhost:7243? Check ports |
| Display doesn't update | Backend SignalR enabled? Check console logs |
| Phone can't connect | Use computer IP not localhost: `ipconfig` |

---

## 📞 Support Resources

| Resource | Location |
|----------|----------|
| Full Overview | `PROJECT_STATUS.md` |
| Backend Details | `PHASE1_COMPLETE.md` |
| Frontend Details | `PHASE2_COMPLETE.md` |
| Next Steps (Phase 3) | `PHASE3_ROADMAP.md` |
| API Docs | https://localhost:7243/swagger (when running) |

---

## 🚀 What's Next?

### Immediate (Today)
- [ ] Start backend and frontend
- [ ] Open control page
- [ ] Add 2-3 test albums
- [ ] Test display page updates

### Short Term (This Week)
- [ ] Add all 25 CDs to system
- [ ] Upload artwork for each
- [ ] Test on multiple devices
- [ ] Test real-time sync

### Medium Term (Next Few Weeks)
- [ ] Deploy to Raspberry Pi (Phase 3)
- [ ] Set up on actual LED display
- [ ] Optimize images
- [ ] Test in production environment

### Long Term (After Deployment)
- [ ] Add search/filter features
- [ ] Import from external APIs
- [ ] Add statistics
- [ ] Customize themes

---

## 💡 Pro Tips

1. **Use Keyboard Shortcuts** (when implemented)
   - F = Fullscreen
   - Arrow keys = Navigate
   - Number keys = Quick jump

2. **Mobile Access**
   - Save bookmark: `http://<IP>:4200/control`
   - Add to home screen (PWA)
   - Works offline with cached data

3. **Image Quality**
   - JPG ~100-200KB per image
   - PNG ~50-150KB per image
   - Square images (1:1) look best

4. **Database Backup**
   - Backup: `copy albums.db albums.db.backup`
   - Restore: `copy albums.db.backup albums.db`

5. **Git Tracking**
   - `git log --oneline` = see changes
   - `.gitignore` excludes albums.db + node_modules
   - `git push` = back up to GitHub (optional)

---

## ✅ Project Checklist

### Phase 1 (Backend)
- ✅ SQLite database created
- ✅ EF Core models defined
- ✅ API endpoints implemented
- ✅ Image upload working
- ✅ SignalR hub created
- ✅ CORS configured

### Phase 2 (Frontend)
- ✅ Control page grid layout
- ✅ Album editor modal
- ✅ Image upload with preview
- ✅ Display page fullscreen
- ✅ SignalR integration
- ✅ Responsive design

### Phase 3 (Coming Soon)
- [ ] Raspberry Pi deployment
- [ ] Image optimization
- [ ] Performance tuning
- [ ] Documentation

---

## 🎓 Technology Stack Quick Reference

```
Frontend (Your Phone)
└─ Angular 21.2 (TypeScript)
   ├─ Responsive Design (SCSS)
   ├─ HTTP Client (API calls)
   └─ SignalR Client (Real-time)

Backend (Your Computer)
└─ ASP.NET Core 8 (C#)
   ├─ Entity Framework Core (Database)
   ├─ SQLite (Data storage)
   ├─ SignalR (Real-time communication)
   └─ File I/O (Image storage)

Communication
└─ HTTP/HTTPS (REST API)
   └─ WebSocket (SignalR)

Deployment
└─ Raspberry Pi 4
   ├─ .NET 8 Runtime
   ├─ Node.js/npm (if needed)
   └─ Systemd services
```

---

## 🎉 Summary

You now have a **working CD Display System** with:
- ✅ Web control interface
- ✅ Real-time display updates
- ✅ Image upload & storage
- ✅ Database persistence
- ✅ Mobile responsiveness
- ✅ Professional styling

**Time to production**: Ready for Raspberry Pi deployment!

---

**Questions?** Check the documentation files above or review the source code.

**Ready to deploy to Raspberry Pi?** See `PHASE3_ROADMAP.md`

**Let's build something awesome!** 🚀

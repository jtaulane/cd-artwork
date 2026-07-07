# Phase 1: Project Setup & Database Foundation - COMPLETED

## Summary
Successfully set up the database foundation and API structure for the CD Display application using ASP.NET 8, Entity Framework Core, and SQLite.

## Changes Made

### 1. **NuGet Packages Added**
   - `Microsoft.EntityFrameworkCore.Sqlite` (8.0.28) - SQLite database provider
   - `Microsoft.EntityFrameworkCore.Design` (8.0.28) - EF Core tools for migrations

### 2. **Database Models**
   - **Album.cs** - Updated with:
	 - `Id` (primary key)
	 - `DiscNumber` (unique index for 1-25 discs)
	 - `AlbumTitle`, `Artist`, `ReleaseYear`, `Genre`
	 - `ImagePath` (replaces hardcoded filename)
	 - `CreatedDate`, `UpdatedDate` timestamps

   - **CurrentDisplay.cs** - Created (renamed from CurrentDisc):
	 - `Id` (always 1, single record)
	 - `CurrentAlbumId` (nullable, tracks which album is being displayed)
	 - `LastUpdated` timestamp

### 3. **Entity Framework**
   - **AlbumDbContext.cs** - New DbContext:
	 - Two DbSet properties: `Albums` and `CurrentDisplay`
	 - Unique index on Album.DiscNumber
	 - Initial seed data for CurrentDisplay record

   - **Migrations** - Initial migration created:
	 - `20260707143737_InitialCreate.cs` and supporting files
	 - Database schema ready for SQLite

### 4. **SignalR Hub**
   - **DisplayHub.cs** - Created for real-time updates:
	 - `NotifyAlbumChanged(albumId)` method to broadcast album changes to all clients
	 - Connection/disconnection handlers

### 5. **API Controller**
   - **AlbumController.cs** - Completely rewritten:
	 - Endpoints:
	   - `GET /api/album` - List all albums
	   - `GET /api/album/{id}` - Get single album
	   - `POST /api/album` - Create album with image upload
	   - `PUT /api/album/{id}` - Update album with image replacement
	   - `DELETE /api/album/{id}` - Delete album and its image
	   - `GET /api/album/current` - Get currently displayed album
	   - `POST /api/album/current/{albumId}` - Set current album (triggers SignalR broadcast)

	 - Image handling:
	   - Saves uploads to `wwwroot/images/albums/`
	   - Generates unique filenames with GUIDs
	   - Cleans up old images on update/delete
	   - Returns relative paths for client access

### 6. **Program.cs Configuration**
   - DbContext registration with SQLite connection string from appsettings
   - SignalR service registration
   - Updated CORS policy to allow all origins (for mobile access from different networks)
   - Automatic database creation on startup
   - SignalR hub mapping at `/api/displayHub`

### 7. **Configuration Files**
   - **appsettings.json** - Added connection string:
	 ```json
	 "ConnectionStrings": {
	   "DefaultConnection": "Data Source=albums.db"
	 }
	 ```

## Database Location
- SQLite database file: `albums.db` in the project root directory
- This file will be auto-created on first run
- **Note**: Add `albums.db` to `.gitignore` to avoid committing the database to version control

## Next Steps (Phase 2)
1. Create Angular control page component with grid view of 25 album slots
2. Implement album editor modal for adding/editing album details
3. Create album API service for CRUD operations and image upload
4. Connect control page to SignalR hub for real-time updates

## API Endpoint Examples

### Get All Albums
```
GET /api/album
```

### Create Album (with image)
```
POST /api/album
Content-Type: multipart/form-data

discNumber: 1
albumTitle: "Album Name"
artist: "Artist Name"
releaseYear: 2024
genre: "Rock"
imageFile: <file upload>
```

### Set Current Album (triggers broadcast)
```
POST /api/album/current/1
```

### Get Current Album
```
GET /api/album/current
```

## Testing the Backend
```bash
cd CDDisplay.Server/CDDisplay.Server
dotnet run
```
Then navigate to `https://localhost:5001/swagger` to test endpoints via Swagger UI.

---

**Status**: ✅ Phase 1 Complete - Backend database and API ready for frontend integration.

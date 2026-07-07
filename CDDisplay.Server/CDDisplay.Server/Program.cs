using CDDisplay.Server.Data;
using CDDisplay.Server.Hubs;
using Microsoft.EntityFrameworkCore;
using System.Text.Json.Serialization;
using Microsoft.Extensions.FileProviders;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.

builder.Services.AddControllers()
    .AddJsonOptions(options =>
    {
        options.JsonSerializerOptions.ReferenceHandler = ReferenceHandler.IgnoreCycles;
        options.JsonSerializerOptions.DefaultIgnoreCondition = JsonIgnoreCondition.WhenWritingNull;
    });
// Learn more about configuring Swagger/OpenAPI at https://aka.ms/aspnetcore/swashbuckle
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// Add DbContext
builder.Services.AddDbContext<AlbumDbContext>(options =>
    options.UseSqlite("Data Source=albums.db"));

// Add SignalR
builder.Services.AddSignalR();

builder.Services.AddCors(options =>
{
    options.AddPolicy("AngularApp", policy =>
    {
        policy.WithOrigins(
                "http://localhost:4200",      // Angular dev server
                "https://localhost:4200",     // HTTPS variant
                "http://localhost:5243",      // Fallback ports
                "https://localhost:7243",     // Backend itself
                "http://localhost",           // Localhost without port
                "http://127.0.0.1"            // Loopback
            )
            .AllowAnyHeader()
            .AllowAnyMethod()
            .AllowCredentials();
    });
});

var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();

// Enable static file serving for images
app.UseStaticFiles();

// Serve Angular app from dist folder
var angularDistPath = Path.Combine(Directory.GetCurrentDirectory(), "..", "..", "cd-display-client", "dist", "cd-display-client");
if (Directory.Exists(angularDistPath))
{
    app.UseStaticFiles(new StaticFileOptions
    {
        FileProvider = new PhysicalFileProvider(angularDistPath),
        RequestPath = ""
    });
}

app.UseRouting();

app.UseCors("AngularApp");

app.UseAuthorization();

app.MapControllers();

app.MapHub<DisplayHub>("/api/displayHub");

// SPA fallback - route unknown requests to index.html for Angular routing
if (Directory.Exists(angularDistPath))
{
    app.MapFallbackToFile("index.html", new StaticFileOptions
    {
        FileProvider = new PhysicalFileProvider(angularDistPath)
    });
}

// Create database on startup
using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<AlbumDbContext>();
    db.Database.EnsureCreated();
}

app.Run();

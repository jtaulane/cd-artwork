using CDDisplay.Server.Data;
using CDDisplay.Server.Hubs;
using Microsoft.EntityFrameworkCore;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.

builder.Services.AddControllers();
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
                "https://localhost:7243"      // Backend itself
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

app.UseRouting();

app.UseCors("AngularApp");

app.UseAuthorization();

app.MapControllers();

app.MapHub<DisplayHub>("/api/displayHub");

// Create database on startup
using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<AlbumDbContext>();
    db.Database.EnsureCreated();
}

app.Run();

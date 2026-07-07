using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace CDDisplay.Server.Migrations
{
    /// <inheritdoc />
    public partial class InitialCreate : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "Albums",
                columns: table => new
                {
                    Id = table.Column<int>(type: "INTEGER", nullable: false)
                        .Annotation("Sqlite:Autoincrement", true),
                    DiscNumber = table.Column<int>(type: "INTEGER", nullable: false),
                    AlbumTitle = table.Column<string>(type: "TEXT", nullable: true),
                    Artist = table.Column<string>(type: "TEXT", nullable: true),
                    ReleaseYear = table.Column<int>(type: "INTEGER", nullable: false),
                    Genre = table.Column<string>(type: "TEXT", nullable: true),
                    ImagePath = table.Column<string>(type: "TEXT", nullable: true),
                    CreatedDate = table.Column<DateTime>(type: "TEXT", nullable: false),
                    UpdatedDate = table.Column<DateTime>(type: "TEXT", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Albums", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "CurrentDisplay",
                columns: table => new
                {
                    Id = table.Column<int>(type: "INTEGER", nullable: false)
                        .Annotation("Sqlite:Autoincrement", true),
                    CurrentAlbumId = table.Column<int>(type: "INTEGER", nullable: true),
                    LastUpdated = table.Column<DateTime>(type: "TEXT", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_CurrentDisplay", x => x.Id);
                });

            migrationBuilder.InsertData(
                table: "CurrentDisplay",
                columns: new[] { "Id", "CurrentAlbumId", "LastUpdated" },
                values: new object[] { 1, null, new DateTime(2026, 7, 7, 14, 37, 36, 507, DateTimeKind.Utc).AddTicks(9283) });

            migrationBuilder.CreateIndex(
                name: "IX_Albums_DiscNumber",
                table: "Albums",
                column: "DiscNumber",
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "Albums");

            migrationBuilder.DropTable(
                name: "CurrentDisplay");
        }
    }
}

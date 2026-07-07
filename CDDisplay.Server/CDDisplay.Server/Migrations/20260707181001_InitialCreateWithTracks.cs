using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace CDDisplay.Server.Migrations
{
    /// <inheritdoc />
    public partial class InitialCreateWithTracks : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "Tracks",
                columns: table => new
                {
                    Id = table.Column<int>(type: "INTEGER", nullable: false)
                        .Annotation("Sqlite:Autoincrement", true),
                    AlbumId = table.Column<int>(type: "INTEGER", nullable: false),
                    TrackNumber = table.Column<int>(type: "INTEGER", nullable: false),
                    TrackTitle = table.Column<string>(type: "TEXT", nullable: true),
                    DurationSeconds = table.Column<int>(type: "INTEGER", nullable: false),
                    CreatedDate = table.Column<DateTime>(type: "TEXT", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Tracks", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Tracks_Albums_AlbumId",
                        column: x => x.AlbumId,
                        principalTable: "Albums",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.UpdateData(
                table: "CurrentDisplay",
                keyColumn: "Id",
                keyValue: 1,
                column: "LastUpdated",
                value: new DateTime(2026, 7, 7, 18, 10, 1, 142, DateTimeKind.Utc).AddTicks(7208));

            migrationBuilder.CreateIndex(
                name: "IX_Tracks_AlbumId_TrackNumber",
                table: "Tracks",
                columns: new[] { "AlbumId", "TrackNumber" },
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "Tracks");

            migrationBuilder.UpdateData(
                table: "CurrentDisplay",
                keyColumn: "Id",
                keyValue: 1,
                column: "LastUpdated",
                value: new DateTime(2026, 7, 7, 14, 37, 36, 507, DateTimeKind.Utc).AddTicks(9283));
        }
    }
}

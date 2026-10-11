using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

#pragma warning disable CA1814 // Prefer jagged arrays over multidimensional

namespace DataAccessLayer.Migrations
{
    /// <inheritdoc />
    public partial class OdbranaSeed : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "Roles",
                columns: table => new
                {
                    Id = table.Column<int>(type: "INTEGER", nullable: false)
                        .Annotation("Sqlite:Autoincrement", true),
                    Naziv = table.Column<string>(type: "TEXT", maxLength: 50, nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "TEXT", nullable: false),
                    ModifiedAt = table.Column<DateTime>(type: "TEXT", nullable: true),
                    DeletedAt = table.Column<DateTime>(type: "TEXT", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Roles", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Sportovi",
                columns: table => new
                {
                    Id = table.Column<int>(type: "INTEGER", nullable: false)
                        .Annotation("Sqlite:Autoincrement", true),
                    Naziv = table.Column<string>(type: "TEXT", maxLength: 100, nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "TEXT", nullable: false),
                    ModifiedAt = table.Column<DateTime>(type: "TEXT", nullable: true),
                    DeletedAt = table.Column<DateTime>(type: "TEXT", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Sportovi", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Users",
                columns: table => new
                {
                    Id = table.Column<int>(type: "INTEGER", nullable: false)
                        .Annotation("Sqlite:Autoincrement", true),
                    Ime = table.Column<string>(type: "TEXT", maxLength: 100, nullable: false),
                    Prezime = table.Column<string>(type: "TEXT", maxLength: 100, nullable: false),
                    Email = table.Column<string>(type: "TEXT", maxLength: 200, nullable: false),
                    PasswordHash = table.Column<string>(type: "TEXT", nullable: false),
                    Telefon = table.Column<string>(type: "TEXT", maxLength: 20, nullable: true),
                    Pol = table.Column<char>(type: "TEXT", nullable: false),
                    DatumRodjenja = table.Column<DateTime>(type: "TEXT", nullable: true),
                    SlikaUrl = table.Column<string>(type: "TEXT", maxLength: 500, nullable: true),
                    RoleId = table.Column<int>(type: "INTEGER", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "TEXT", nullable: false),
                    ModifiedAt = table.Column<DateTime>(type: "TEXT", nullable: true),
                    DeletedAt = table.Column<DateTime>(type: "TEXT", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Users", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Users_Roles_RoleId",
                        column: x => x.RoleId,
                        principalTable: "Roles",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "Objekti",
                columns: table => new
                {
                    Id = table.Column<int>(type: "INTEGER", nullable: false)
                        .Annotation("Sqlite:Autoincrement", true),
                    Naziv = table.Column<string>(type: "TEXT", maxLength: 200, nullable: false),
                    Adresa = table.Column<string>(type: "TEXT", maxLength: 300, nullable: false),
                    Opis = table.Column<string>(type: "TEXT", maxLength: 1000, nullable: false),
                    VlasnikId = table.Column<int>(type: "INTEGER", nullable: false),
                    SlikaUrl = table.Column<string>(type: "TEXT", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "TEXT", nullable: false),
                    ModifiedAt = table.Column<DateTime>(type: "TEXT", nullable: true),
                    DeletedAt = table.Column<DateTime>(type: "TEXT", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Objekti", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Objekti_Users_VlasnikId",
                        column: x => x.VlasnikId,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "OceneIgraca",
                columns: table => new
                {
                    Id = table.Column<int>(type: "INTEGER", nullable: false)
                        .Annotation("Sqlite:Autoincrement", true),
                    OcenjeniId = table.Column<int>(type: "INTEGER", nullable: false),
                    OcenioId = table.Column<int>(type: "INTEGER", nullable: false),
                    Vrednost = table.Column<int>(type: "INTEGER", nullable: false),
                    Komentar = table.Column<string>(type: "TEXT", nullable: true),
                    DatumOcene = table.Column<DateTime>(type: "TEXT", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_OceneIgraca", x => x.Id);
                    table.ForeignKey(
                        name: "FK_OceneIgraca_Users_OcenioId",
                        column: x => x.OcenioId,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_OceneIgraca_Users_OcenjeniId",
                        column: x => x.OcenjeniId,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "ObjekatSportovi",
                columns: table => new
                {
                    ObjekatId = table.Column<int>(type: "INTEGER", nullable: false),
                    SportId = table.Column<int>(type: "INTEGER", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ObjekatSportovi", x => new { x.ObjekatId, x.SportId });
                    table.ForeignKey(
                        name: "FK_ObjekatSportovi_Objekti_ObjekatId",
                        column: x => x.ObjekatId,
                        principalTable: "Objekti",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_ObjekatSportovi_Sportovi_SportId",
                        column: x => x.SportId,
                        principalTable: "Sportovi",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "Ocene",
                columns: table => new
                {
                    Id = table.Column<int>(type: "INTEGER", nullable: false)
                        .Annotation("Sqlite:Autoincrement", true),
                    ObjekatId = table.Column<int>(type: "INTEGER", nullable: false),
                    IgracId = table.Column<int>(type: "INTEGER", nullable: false),
                    Vrednost = table.Column<int>(type: "INTEGER", nullable: false),
                    Komentar = table.Column<string>(type: "TEXT", nullable: true),
                    DatumOcene = table.Column<DateTime>(type: "TEXT", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Ocene", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Ocene_Objekti_ObjekatId",
                        column: x => x.ObjekatId,
                        principalTable: "Objekti",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_Ocene_Users_IgracId",
                        column: x => x.IgracId,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "Termini",
                columns: table => new
                {
                    Id = table.Column<int>(type: "INTEGER", nullable: false)
                        .Annotation("Sqlite:Autoincrement", true),
                    ObjekatId = table.Column<int>(type: "INTEGER", nullable: false),
                    SportId = table.Column<int>(type: "INTEGER", nullable: false),
                    Datum = table.Column<DateTime>(type: "TEXT", nullable: false),
                    VremeOd = table.Column<TimeOnly>(type: "TEXT", nullable: false),
                    VremeDo = table.Column<TimeOnly>(type: "TEXT", nullable: false),
                    Cena = table.Column<decimal>(type: "TEXT", precision: 10, scale: 2, nullable: false),
                    Status = table.Column<string>(type: "TEXT", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "TEXT", nullable: false),
                    ModifiedAt = table.Column<DateTime>(type: "TEXT", nullable: true),
                    DeletedAt = table.Column<DateTime>(type: "TEXT", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Termini", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Termini_Objekti_ObjekatId",
                        column: x => x.ObjekatId,
                        principalTable: "Objekti",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_Termini_Sportovi_SportId",
                        column: x => x.SportId,
                        principalTable: "Sportovi",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "Rezervacije",
                columns: table => new
                {
                    Id = table.Column<int>(type: "INTEGER", nullable: false)
                        .Annotation("Sqlite:Autoincrement", true),
                    TerminId = table.Column<int>(type: "INTEGER", nullable: false),
                    GlavniIgracId = table.Column<int>(type: "INTEGER", nullable: false),
                    DatumRezervacije = table.Column<DateTime>(type: "TEXT", nullable: false),
                    MinIgraca = table.Column<int>(type: "INTEGER", nullable: false),
                    MaxIgraca = table.Column<int>(type: "INTEGER", nullable: false),
                    Status = table.Column<string>(type: "TEXT", nullable: false),
                    SportId = table.Column<int>(type: "INTEGER", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "TEXT", nullable: false),
                    ModifiedAt = table.Column<DateTime>(type: "TEXT", nullable: true),
                    DeletedAt = table.Column<DateTime>(type: "TEXT", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Rezervacije", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Rezervacije_Sportovi_SportId",
                        column: x => x.SportId,
                        principalTable: "Sportovi",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_Rezervacije_Termini_TerminId",
                        column: x => x.TerminId,
                        principalTable: "Termini",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_Rezervacije_Users_GlavniIgracId",
                        column: x => x.GlavniIgracId,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "RezervacijaIgraci",
                columns: table => new
                {
                    Id = table.Column<int>(type: "INTEGER", nullable: false)
                        .Annotation("Sqlite:Autoincrement", true),
                    RezervacijaId = table.Column<int>(type: "INTEGER", nullable: false),
                    IgracId = table.Column<int>(type: "INTEGER", nullable: false),
                    Status = table.Column<string>(type: "TEXT", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "TEXT", nullable: false),
                    ModifiedAt = table.Column<DateTime>(type: "TEXT", nullable: true),
                    DeletedAt = table.Column<DateTime>(type: "TEXT", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_RezervacijaIgraci", x => x.Id);
                    table.ForeignKey(
                        name: "FK_RezervacijaIgraci_Rezervacije_RezervacijaId",
                        column: x => x.RezervacijaId,
                        principalTable: "Rezervacije",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_RezervacijaIgraci_Users_IgracId",
                        column: x => x.IgracId,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.InsertData(
                table: "Roles",
                columns: new[] { "Id", "CreatedAt", "DeletedAt", "ModifiedAt", "Naziv" },
                values: new object[,]
                {
                    { 1, new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified), null, null, "Admin" },
                    { 2, new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified), null, null, "Igrac" },
                    { 3, new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified), null, null, "Vlasnik" }
                });

            migrationBuilder.InsertData(
                table: "Sportovi",
                columns: new[] { "Id", "CreatedAt", "DeletedAt", "ModifiedAt", "Naziv" },
                values: new object[,]
                {
                    { 1, new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified), null, null, "Fudbal" },
                    { 2, new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified), null, null, "Kosarka" },
                    { 3, new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified), null, null, "Tenis" }
                });

            migrationBuilder.InsertData(
                table: "Users",
                columns: new[] { "Id", "CreatedAt", "DatumRodjenja", "DeletedAt", "Email", "Ime", "ModifiedAt", "PasswordHash", "Pol", "Prezime", "RoleId", "SlikaUrl", "Telefon" },
                values: new object[,]
                {
                    { 1, new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified), null, null, "admin@test.com", "Admin", null, "$2a$11$I/SO/2RIaNpYJSyHE1wsbOr/iOrNzCC2uGiIf83MeqM7oX5wTz45.", 'M', "Admin", 1, null, null },
                    { 2, new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified), null, null, "igrac@test.com", "Petar", null, "$2a$11$z1wMC2efX55Muc/Aol/eNuS2Bx9cr5luIO2eVIMSPGCHhRo.RMYO.", 'M', "Petrovic", 2, null, null },
                    { 3, new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified), null, null, "igrac2@test.com", "Nikola", null, "$2a$11$SVTEpskFsdKswjVMSXsZEugrgV8/wHq2QFweqyUgp.K686U1r5lvO", 'M', "Nikolic", 2, null, null },
                    { 4, new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified), null, null, "vlasnik@test.com", "Marko", null, "$2a$11$b/X0P05bwjHCLYYpiDs9gOs0VGquq6O7V1yG0e8AefGe36nDLIlSm", 'M', "Markovic", 3, null, null }
                });

            migrationBuilder.CreateIndex(
                name: "IX_ObjekatSportovi_SportId",
                table: "ObjekatSportovi",
                column: "SportId");

            migrationBuilder.CreateIndex(
                name: "IX_Objekti_VlasnikId",
                table: "Objekti",
                column: "VlasnikId");

            migrationBuilder.CreateIndex(
                name: "IX_Ocene_IgracId",
                table: "Ocene",
                column: "IgracId");

            migrationBuilder.CreateIndex(
                name: "IX_Ocene_ObjekatId_IgracId",
                table: "Ocene",
                columns: new[] { "ObjekatId", "IgracId" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_OceneIgraca_OcenioId",
                table: "OceneIgraca",
                column: "OcenioId");

            migrationBuilder.CreateIndex(
                name: "IX_OceneIgraca_OcenjeniId_OcenioId",
                table: "OceneIgraca",
                columns: new[] { "OcenjeniId", "OcenioId" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_RezervacijaIgraci_IgracId",
                table: "RezervacijaIgraci",
                column: "IgracId");

            migrationBuilder.CreateIndex(
                name: "IX_RezervacijaIgraci_RezervacijaId",
                table: "RezervacijaIgraci",
                column: "RezervacijaId");

            migrationBuilder.CreateIndex(
                name: "IX_Rezervacije_GlavniIgracId",
                table: "Rezervacije",
                column: "GlavniIgracId");

            migrationBuilder.CreateIndex(
                name: "IX_Rezervacije_SportId",
                table: "Rezervacije",
                column: "SportId");

            migrationBuilder.CreateIndex(
                name: "IX_Rezervacije_TerminId",
                table: "Rezervacije",
                column: "TerminId",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Sportovi_Naziv",
                table: "Sportovi",
                column: "Naziv",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Termini_ObjekatId",
                table: "Termini",
                column: "ObjekatId");

            migrationBuilder.CreateIndex(
                name: "IX_Termini_SportId",
                table: "Termini",
                column: "SportId");

            migrationBuilder.CreateIndex(
                name: "IX_Users_Email",
                table: "Users",
                column: "Email",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Users_RoleId",
                table: "Users",
                column: "RoleId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "ObjekatSportovi");

            migrationBuilder.DropTable(
                name: "Ocene");

            migrationBuilder.DropTable(
                name: "OceneIgraca");

            migrationBuilder.DropTable(
                name: "RezervacijaIgraci");

            migrationBuilder.DropTable(
                name: "Rezervacije");

            migrationBuilder.DropTable(
                name: "Termini");

            migrationBuilder.DropTable(
                name: "Objekti");

            migrationBuilder.DropTable(
                name: "Sportovi");

            migrationBuilder.DropTable(
                name: "Users");

            migrationBuilder.DropTable(
                name: "Roles");
        }
    }
}

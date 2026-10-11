using DomainLayer.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.ChangeTracking;
using System.Reflection;

namespace DataAccessLayer
{
    public class TeamUpContext : DbContext
    {
        public TeamUpContext(DbContextOptions<TeamUpContext> options) : base(options) { }

        //ovaj konstruktor treba za Add-Migration komandu
        public TeamUpContext() { }

        protected override void OnConfiguring(DbContextOptionsBuilder optionsBuilder)
        {
            if (!optionsBuilder.IsConfigured)
            {
                optionsBuilder.UseSqlite("Data Source=teamup.db");
            }
        }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            modelBuilder.ApplyConfigurationsFromAssembly(Assembly.GetExecutingAssembly());
            base.OnModelCreating(modelBuilder);

            modelBuilder.Entity<Ocena>()
            .HasIndex(o => new { o.ObjekatId, o.IgracId })
            .IsUnique();

            modelBuilder.Entity<OcenaIgraca>()
            .HasIndex(o => new { o.OcenjeniId, o.OcenioId })
            .IsUnique();

            modelBuilder.Entity<User>().HasData(
                new User
                {
                    Id = 1,
                    CreatedAt = new DateTime(2026, 1, 1),
                    Ime = "Admin",
                    Prezime = "Admin",
                    Email = "admin@test.com",
                    PasswordHash = BCrypt.Net.BCrypt.HashPassword("admin123"),
                    Pol = 'M',
                    RoleId = 1
                },
                 new User
                 {
                     Id = 2,
                     CreatedAt = new DateTime(2026, 1, 1),
                     Ime = "Petar",
                     Prezime = "Petrovic",
                     Email = "igrac@test.com",
                     PasswordHash = BCrypt.Net.BCrypt.HashPassword("igrac123"),
                     Pol = 'M',
                     RoleId = 2
                 },
                  new User
                  {
                       Id = 3,
                       CreatedAt = new DateTime(2026, 1, 1),
                       Ime = "Nikola",
                       Prezime = "Nikolic",
                       Email = "igrac2@test.com",
                       PasswordHash = BCrypt.Net.BCrypt.HashPassword("igrac2123"),
                       Pol = 'M',
                       RoleId = 2
                  },
                new User
                {
                    Id = 4,
                    CreatedAt = new DateTime(2026, 1, 1),
                    Ime = "Marko",
                    Prezime = "Markovic",
                    Email = "vlasnik@test.com",
                    PasswordHash = BCrypt.Net.BCrypt.HashPassword("vlasnik123"),
                    Pol = 'M',
                    RoleId = 3
                }
              

            );

            modelBuilder.Entity<Sport>().HasData(
                new Sport { Id = 1, CreatedAt = new DateTime(2026, 1, 1), Naziv = "Fudbal" },
                new Sport { Id = 2, CreatedAt = new DateTime(2026, 1, 1), Naziv = "Kosarka" },
                new Sport { Id = 3, CreatedAt = new DateTime(2026, 1, 1), Naziv = "Tenis" }
            );

        }

        public override int SaveChanges()
        {
            IEnumerable<EntityEntry> entries = this.ChangeTracker.Entries();

            foreach (EntityEntry entry in entries)
            {
                if (entry.State == EntityState.Added)
                {
                    if (entry.Entity is Entity e)
                    {
                        e.CreatedAt = DateTime.UtcNow;
                    }
                }

                if (entry.State == EntityState.Modified)
                {
                    if (entry.Entity is Entity e)
                    {
                        e.ModifiedAt = DateTime.UtcNow;
                    }
                }
            }

            return base.SaveChanges();
        }

        public DbSet<Role> Roles { get; set; }
        public DbSet<User> Users { get; set; }
        public DbSet<Sport> Sportovi { get; set; }
        public DbSet<Objekat> Objekti { get; set; }
        public DbSet<ObjekatSport> ObjekatSportovi { get; set; }
        public DbSet<Termin> Termini { get; set; }
        public DbSet<Rezervacija> Rezervacije { get; set; }
        public DbSet<RezervacijaIgrac> RezervacijaIgraci { get; set; }
        public DbSet<Ocena> Ocene { get; set; }
        public DbSet<OcenaIgraca> OceneIgraca { get; set; }
    }
}
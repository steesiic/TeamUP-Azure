using System;
using System.Collections.Generic;
namespace DomainLayer.Entities
{
    public class User : Entity
    {
        public string Ime { get; set; }
        public string Prezime { get; set; }
        public string Email { get; set; }
        public string PasswordHash { get; set; }
        public string? Telefon { get; set; }
        public char Pol { get; set; }
        public DateTime? DatumRodjenja { get; set; }
        //public DateTime DateCreated { get; set; }
        public string? SlikaUrl { get; set; }

        public int RoleId { get; set; }
        public Role Role { get; set; }

        public ICollection<Objekat> Objekti { get; set; } = new HashSet<Objekat>();
        public ICollection<Rezervacija> Rezervacije { get; set; } = new HashSet<Rezervacija>();
        public ICollection<RezervacijaIgrac> RezervacijeIgraci { get; set; } = new HashSet<RezervacijaIgrac>();
    }
}
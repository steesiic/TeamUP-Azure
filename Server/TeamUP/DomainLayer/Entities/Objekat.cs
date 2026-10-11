using System.Collections.Generic;
namespace DomainLayer.Entities
{
    public class Objekat : Entity
    {
        public string Naziv { get; set; }
        public string Adresa { get; set; }
        public string Opis { get; set; }
        public int VlasnikId { get; set; }
        public string? SlikaUrl { get; set; }
        public User Vlasnik { get; set; }
        public ICollection<ObjekatSport> ObjekatSportovi { get; set; } = new HashSet<ObjekatSport>();
        public ICollection<Termin> Termini { get; set; } = new HashSet<Termin>();
    }
}
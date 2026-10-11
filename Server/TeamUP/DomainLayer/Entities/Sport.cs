using System.Collections.Generic;
namespace DomainLayer.Entities
{
    public class Sport : Entity
    {
        public string Naziv { get; set; }

        public ICollection<ObjekatSport> ObjekatSportovi { get; set; } = new HashSet<ObjekatSport>();
        public ICollection<Termin> Termini { get; set; } = new HashSet<Termin>();
    }
}
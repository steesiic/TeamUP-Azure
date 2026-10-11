using System;
using System.Collections.Generic;
namespace DomainLayer.Entities
{
    public class Rezervacija : Entity
    {
        public int TerminId { get; set; }
        public int GlavniIgracId { get; set; }
        public DateTime DatumRezervacije { get; set; }
        public int MinIgraca { get; set; }
        public int MaxIgraca { get; set; }
        public RezervacijaStatus Status { get; set; }

        public Termin Termin { get; set; }
        public User GlavniIgrac { get; set; }
        public ICollection<RezervacijaIgrac> RezervacijaIgraci { get; set; } = new HashSet<RezervacijaIgrac>();

        public int? SportId { get; set; }
        public Sport Sport { get; set; }
    }

    public enum RezervacijaStatus
    {
        Aktivna,
        Zavrsena,
        Otkazana
    }
}
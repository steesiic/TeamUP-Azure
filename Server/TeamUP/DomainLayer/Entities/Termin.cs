using System;
using System.Collections.Generic;
namespace DomainLayer.Entities
{
    public class Termin : Entity
    {
        public int ObjekatId { get; set; }
        public int SportId { get; set; }
        public DateTime Datum { get; set; }
        public TimeOnly VremeOd { get; set; }
        public TimeOnly VremeDo { get; set; }
        public decimal Cena { get; set; }
        public TerminStatus Status { get; set; }

        public Objekat Objekat { get; set; }
        public Sport Sport { get; set; }

        //public ICollection<Rezervacija> Rezervacije { get; set; } = new List<Rezervacija>();

        public Rezervacija? Rezervacija { get; set; }
    }

    public enum TerminStatus
    {
        Slobodan,
        Rezervisan,
        Otkazan
    }
}
namespace DomainLayer.Entities
{
    public class RezervacijaIgrac : Entity
    {
        public int RezervacijaId { get; set; }
        public int IgracId { get; set; }
        public IgracStatus Status { get; set; }

        public Rezervacija Rezervacija { get; set; }
        public User Igrac { get; set; }
    }

    public enum IgracStatus
    {
        CekaPotvrdu,
        Prihvacen,
        Otkazao
    }
}
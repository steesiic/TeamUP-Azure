namespace DomainLayer.Entities
{
    public class ObjekatSport //ne izvodi entity jer nema svoj id
    {
        public int ObjekatId { get; set; }  // ujednačeno sa Id konvencijom
        public int SportId { get; set; }

        public Objekat Objekat { get; set; }
        public Sport Sport { get; set; }
    }
}
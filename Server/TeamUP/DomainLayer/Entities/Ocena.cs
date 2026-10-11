using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace DomainLayer.Entities
{
    public class Ocena
    {
        public int Id { get; set; }
        public int ObjekatId { get; set; }
        public Objekat Objekat { get; set; }
        public int IgracId { get; set; }
        public User Igrac { get; set; }
        public int Vrednost { get; set; }
        public string? Komentar { get; set; }
        public DateTime DatumOcene { get; set; } = DateTime.UtcNow;
    }
}

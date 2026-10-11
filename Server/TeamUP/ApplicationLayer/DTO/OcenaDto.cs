using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace ApplicationLayer.DTO
{
    public class OcenaDto
    {
        public int Id { get; set; }
        public int ObjekatId { get; set; }
        public int IgracId { get; set; }
        public string? IgracIme { get; set; }
        public string? IgracPrezime { get; set; }
        public int Vrednost { get; set; }
        public string? Komentar { get; set; }
        public DateTime DatumOcene { get; set; }
    }
}

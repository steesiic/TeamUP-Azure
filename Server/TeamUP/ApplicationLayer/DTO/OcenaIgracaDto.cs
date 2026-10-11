using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace ApplicationLayer.DTO
{
    public class OcenaIgracaDto
    {
        public int Id { get; set; }
        public int OcenjeniId { get; set; }
        public int OcenioId { get; set; }
        public string? OcenioIme { get; set; }
        public string? OcenioPrezime { get; set; }
        public int Vrednost { get; set; }
        public string? Komentar { get; set; }
        public DateTime DatumOcene { get; set; }
    }
}

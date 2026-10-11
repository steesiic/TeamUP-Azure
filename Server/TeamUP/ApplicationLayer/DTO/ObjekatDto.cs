using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace ApplicationLayer.DTO
{
    public class ObjekatDto
    {
        public int Id { get; set; }
        public int VlasnikId { get; set; }
        public string Naziv { get; set; }
        public string Adresa { get; set; }
        public string Opis { get; set; }
        public string VlasnikIme { get; set; }
        public string VlasnikPrezime { get; set; }
        public List<string> Sportovi { get; set; }
        public string? SlikaUrl { get; set; }
        public decimal? ProsecnaCena { get; set; }
        public double? ProsecnaOcena { get; set; }
    }
}

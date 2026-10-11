using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace ApplicationLayer.DTO
{
    public class RezervacijaDto
    {
        public int Id { get; set; }
        public int GlavniIgracId { get; set; }
        public string GlavniIgracIme { get; set; }
        public string GlavniIgracPrezime { get; set; }
        public TerminDto Termin { get; set; }
        public DateTime DatumRezervacije { get; set; }
        public int MinIgraca { get; set; }
        public int MaxIgraca { get; set; }
        public string Status { get; set; }
        public List<RezervacijaIgracDto> Igraci { get; set; }
        public int? SportId { get; set; }
        public string? SportNaziv { get; set; }
    }
}

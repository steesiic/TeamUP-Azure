using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace ApplicationLayer.DTO
{
    public class TerminDto
    {
        public int Id { get; set; }
        public string ObjekatNaziv { get; set; }
        public string SportNaziv { get; set; }
        public DateTime Datum { get; set; }
        public TimeOnly VremeOd { get; set; }
        public TimeOnly VremeDo { get; set; }
        public decimal Cena { get; set; }
        public string Status { get; set; }
    }
}

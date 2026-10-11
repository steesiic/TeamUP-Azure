using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace ApplicationLayer.DTO
{
    public class RezervacijaIgracDto
    {
        public int Id { get; set; }
        public int IgracId { get; set; }
        public string IgracIme { get; set; }
        public string IgracPrezime { get; set; }
        public string Status { get; set; }
    }
}

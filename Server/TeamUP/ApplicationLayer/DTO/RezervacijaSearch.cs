using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace ApplicationLayer.DTO
{
    public class RezervacijaSearch
    {
        public int? GlavniIgracId { get; set; }
        public int? TerminId { get; set; }
        public int? IgracId { get; set; }
        public string? Status { get; set; }
        public int Page { get; set; } = 1;
        public int PerPage { get; set; } = 10;
    }
}

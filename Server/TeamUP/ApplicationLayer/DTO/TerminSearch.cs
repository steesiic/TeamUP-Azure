using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace ApplicationLayer.DTO
{
    public class TerminSearch
    {
        public int? ObjekatId { get; set; }
        public int? SportId { get; set; }
        public DateTime? Datum { get; set; }
        public string? Status { get; set; }
        public int Page { get; set; } = 1;
        public int PerPage { get; set; } = 10;
    }
}

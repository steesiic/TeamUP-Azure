using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace ApplicationLayer.DTO
{
    public class ObjekatSearch
    {
        public string? Naziv { get; set; }
        public string? Adresa { get; set; }
        public int? SportId { get; set; }
        public int? VlasnikId { get; set; }
        public int Page { get; set; } = 1;
        public int PerPage { get; set; } = 10;
    }
}

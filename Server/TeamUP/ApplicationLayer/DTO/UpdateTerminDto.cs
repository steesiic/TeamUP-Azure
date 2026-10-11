using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace ApplicationLayer.DTO
{
    public class UpdateTerminDto
    {
        public int Id { get; set; }
        public DateTime? Datum { get; set; }
        public string? VremeOd { get; set; }
        public string? VremeDo { get; set; }
        public decimal? Cena { get; set; }
    }
}
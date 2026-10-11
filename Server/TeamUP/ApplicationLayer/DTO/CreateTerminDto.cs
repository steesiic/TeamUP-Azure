using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace ApplicationLayer.DTO
{
    public class CreateTerminDto
    {
        public int ObjekatId { get; set; }
        public int SportId { get; set; }
        public DateTime Datum { get; set; }
        public TimeOnly VremeOd { get; set; }
        public TimeOnly VremeDo { get; set; }
        public decimal Cena { get; set; }
    }
}
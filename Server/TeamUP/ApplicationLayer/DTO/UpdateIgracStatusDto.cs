using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace ApplicationLayer.DTO
{
    public class UpdateIgracStatusDto
    {
        public int RezervacijaId { get; set; }
        public int IgracId { get; set; }
        public string Status { get; set; }
    }
}

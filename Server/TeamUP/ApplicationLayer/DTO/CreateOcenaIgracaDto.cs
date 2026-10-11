using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace ApplicationLayer.DTO
{
    public class CreateOcenaIgracaDto
    {
        public int OcenjeniId { get; set; }
        public int OcenioId { get; set; }
        public int Vrednost { get; set; }
        public string? Komentar { get; set; }
    }
}

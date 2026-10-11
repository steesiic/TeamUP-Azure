using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace ApplicationLayer.DTO
{
    public class CreateOcenaDto
    {
        public int ObjekatId { get; set; }
        public int IgracId { get; set; }
        public int Vrednost { get; set; }
        public string? Komentar { get; set; }
    }
}

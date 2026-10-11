using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace ApplicationLayer.DTO
{
    public class CreateRezervacijuDto
    {
        public int TerminId { get; set; }
        public int GlavniIgracId { get; set; }
        public int MinIgraca { get; set; }
        public int MaxIgraca { get; set; }

        public int? SportId { get; set; }
    }
}

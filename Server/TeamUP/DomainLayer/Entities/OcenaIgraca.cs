using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace DomainLayer.Entities
{
    public class OcenaIgraca
    {
        public int Id { get; set; }
        public int OcenjeniId { get; set; }
        public User Ocenjeni { get; set; }
        public int OcenioId { get; set; }
        public User Ocenio { get; set; }
        public int Vrednost { get; set; }
        public string? Komentar { get; set; }
        public DateTime DatumOcene { get; set; } = DateTime.UtcNow;
    }
}

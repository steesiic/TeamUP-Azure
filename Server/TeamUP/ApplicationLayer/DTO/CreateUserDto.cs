using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace ApplicationLayer.DTO
{
    public class CreateUserDto
    {
        public string Ime { get; set; }
        public string Prezime { get; set; }
        public string Email { get; set; }
        public string Password { get; set; }
        public string? Telefon { get; set; }
        public char Pol { get; set; }
        public DateTime? DatumRodjenja { get; set; }
        public string? SlikaUrl { get; set; }
        public int RoleId { get; set; }
    }
}
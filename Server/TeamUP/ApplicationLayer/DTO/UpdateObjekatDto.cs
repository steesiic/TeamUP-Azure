using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace ApplicationLayer.DTO
{
    public class UpdateObjekatDto
    {
        public int Id { get; set; }
        public string? Naziv { get; set; }
        public string? Adresa { get; set; }
        public string? Opis { get; set; }
        public List<int>? SportIds { get; set; }
        public string? SlikaUrl { get; set; }
    }
}

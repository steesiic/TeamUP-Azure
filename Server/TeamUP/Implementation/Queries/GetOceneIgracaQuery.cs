using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using ApplicationLayer.DTO;
using ApplicationLayer.UseCases.Queries;
using DataAccessLayer;
using Microsoft.EntityFrameworkCore;

namespace Implementation.Queries
{
    public class GetOceneIgracaQuery : IGetOceneIgracaQuery
    {
        private readonly TeamUpContext _context;
        public GetOceneIgracaQuery(TeamUpContext context)
        {
            _context = context;
        }
        public List<OcenaIgracaDto> Execute(int ocenjeniId)
        {
            return _context.OceneIgraca
                .Include(o => o.Ocenio)
                .Where(o => o.OcenjeniId == ocenjeniId)
                .OrderByDescending(o => o.DatumOcene)
                .Select(o => new OcenaIgracaDto
                {
                    Id = o.Id,
                    OcenjeniId = o.OcenjeniId,
                    OcenioId = o.OcenioId,
                    OcenioIme = o.Ocenio.Ime,
                    OcenioPrezime = o.Ocenio.Prezime,
                    Vrednost = o.Vrednost,
                    Komentar = o.Komentar,
                    DatumOcene = o.DatumOcene
                })
                .ToList();
        }
    }
}
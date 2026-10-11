using ApplicationLayer.DTO;
using ApplicationLayer.UseCases.Queries;
using DataAccessLayer;
using Microsoft.EntityFrameworkCore;
namespace Implementation.Queries
{
    public class GetOceneQuery : IGetOceneQuery
    {
        private readonly TeamUpContext _context;
        public GetOceneQuery(TeamUpContext context)
        {
            _context = context;
        }
        public List<OcenaDto> Execute(int objekatId)
        {
            return _context.Ocene
                .Include(o => o.Igrac)
                .Where(o => o.ObjekatId == objekatId)
                .OrderByDescending(o => o.DatumOcene)
                .Select(o => new OcenaDto
                {
                    Id = o.Id,
                    ObjekatId = o.ObjekatId,
                    IgracId = o.IgracId,
                    IgracIme = o.Igrac.Ime,
                    IgracPrezime = o.Igrac.Prezime,
                    Vrednost = o.Vrednost,
                    Komentar = o.Komentar,
                    DatumOcene = o.DatumOcene
                })
                .ToList();
        }
    }
}
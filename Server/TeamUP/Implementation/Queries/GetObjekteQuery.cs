using ApplicationLayer;
using ApplicationLayer.DTO;
using ApplicationLayer.UseCases.Queries;
using DataAccessLayer;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Implementation.Queries
{
    public class GetObjekteQuery : IGetObjekteQuery
    {
        private readonly TeamUpContext _context;

        public GetObjekteQuery(TeamUpContext context)
        {
            _context = context;
        }

        public PagedResult<ObjekatDto> Execute(ObjekatSearch search)
        {
            var query = _context.Objekti
                .Include(o => o.Vlasnik)
                .Include(o => o.ObjekatSportovi)
                    .ThenInclude(os => os.Sport)
                .Where(o => o.DeletedAt == null)
                .AsQueryable();

            if (!string.IsNullOrEmpty(search.Naziv))
                query = query.Where(o => o.Naziv.ToLower().Contains(search.Naziv.ToLower()));
            if (!string.IsNullOrEmpty(search.Adresa))
                query = query.Where(o => o.Adresa.Contains(search.Adresa));
            if (search.SportId.HasValue)
                query = query.Where(o => o.ObjekatSportovi.Any(os => os.SportId == search.SportId));
            if (search.VlasnikId.HasValue)
                query = query.Where(o => o.VlasnikId == search.VlasnikId);

            var totalCount = query.Count();
            var data = query
                .OrderByDescending(o => o.Termini
                    .Where(t => t.DeletedAt == null && t.Rezervacija != null)
                    .Count())
                .Skip((search.Page - 1) * search.PerPage)
                .Take(search.PerPage)
                .Select(o => new ObjekatDto
                {
                    Id = o.Id,
                    Naziv = o.Naziv,
                    Adresa = o.Adresa,
                    Opis = o.Opis,
                    SlikaUrl = o.SlikaUrl,
                    VlasnikId = o.VlasnikId,
                    VlasnikIme = o.Vlasnik.Ime,
                    VlasnikPrezime = o.Vlasnik.Prezime,
                    Sportovi = o.ObjekatSportovi.Select(os => os.Sport.Naziv).ToList(),
                    ProsecnaCena = (decimal?)o.Termini
                        .Where(t => t.DeletedAt == null)
                        .Average(t => (double?)t.Cena),
                    ProsecnaOcena = (double?)_context.Ocene
                        .Where(oc => oc.ObjekatId == o.Id)
                        .Average(oc => (double?)oc.Vrednost)
                })
                .ToList();

            return new PagedResult<ObjekatDto>
            {
                Data = data,
                CurrentPage = search.Page,
                PerPage = search.PerPage,
                TotalCount = totalCount
            };
        }
    }
}

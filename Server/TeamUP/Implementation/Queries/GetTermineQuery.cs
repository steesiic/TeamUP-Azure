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
    public class GetTermineQuery : IGetTermineQuery
    {
        private readonly TeamUpContext _context;

        public GetTermineQuery(TeamUpContext context)
        {
            _context = context;
        }

        public PagedResult<TerminDto> Execute(TerminSearch search)
        {
            var query = _context.Termini
                .Include(t => t.Objekat)
                .Include(t => t.Sport)
                .Where(t => t.DeletedAt == null)
                .AsQueryable();

            if (search.ObjekatId.HasValue)
                query = query.Where(t => t.ObjekatId == search.ObjekatId);
            if (search.SportId.HasValue)
                query = query.Where(t => t.SportId == search.SportId);
            if (search.Datum.HasValue)
                query = query.Where(t => t.Datum.Date == search.Datum.Value.Date);
            if (!string.IsNullOrEmpty(search.Status))
                query = query.Where(t => t.Status.ToString() == search.Status);

            var totalCount = query.Count();

            var data = query
                .Skip((search.Page - 1) * search.PerPage)
                .Take(search.PerPage)
                .Select(t => new TerminDto
                {
                    Id = t.Id,
                    ObjekatNaziv = t.Objekat.Naziv,
                    SportNaziv = t.Sport.Naziv,
                    Datum = t.Datum,
                    VremeOd = t.VremeOd,
                    VremeDo = t.VremeDo,
                    Cena = t.Cena,
                    Status = t.Status.ToString()
                })
                .ToList();

            return new PagedResult<TerminDto>
            {
                Data = data,
                CurrentPage = search.Page,
                PerPage = search.PerPage,
                TotalCount = totalCount
            };
        }
    }
}

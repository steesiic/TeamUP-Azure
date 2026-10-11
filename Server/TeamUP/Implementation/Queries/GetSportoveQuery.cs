using ApplicationLayer;
using ApplicationLayer.DTO;
using ApplicationLayer.UseCases.Queries;
using DataAccessLayer;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Implementation.Queries
{
    public class GetSportoveQuery : IGetSportoveQuery
    {
        private readonly TeamUpContext _context;

        public GetSportoveQuery(TeamUpContext context)
        {
            _context = context;
        }

        public PagedResult<SportDto> Execute(SportSearch search)
        {
            var query = _context.Sportovi.AsQueryable();

            if (!string.IsNullOrEmpty(search.Naziv))
                query = query.Where(s => s.Naziv.Contains(search.Naziv));

            var totalCount = query.Count();

            var data = query
                .Skip((search.Page - 1) * search.PerPage)
                .Take(search.PerPage)
                .Select(s => new SportDto
                {
                    Id = s.Id,
                    Naziv = s.Naziv
                })
                .ToList();

            return new PagedResult<SportDto>
            {
                Data = data,
                CurrentPage = search.Page,
                PerPage = search.PerPage,
                TotalCount = totalCount
            };
        }
    }
}

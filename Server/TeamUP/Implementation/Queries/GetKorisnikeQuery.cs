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
    public class GetKorisnikeQuery : IGetKorisnikeQuery
    {
        private readonly TeamUpContext _context;

        public GetKorisnikeQuery(TeamUpContext context)
        {
            _context = context;
        }

        public PagedResult<UserDto> Execute(UserSearch search)
        {
            var query = _context.Users
                .Include(u => u.Role)
                .Where(u => u.DeletedAt == null)
                .AsQueryable();

            if (!string.IsNullOrEmpty(search.Ime))
                query = query.Where(u => u.Ime.Contains(search.Ime));
            if (!string.IsNullOrEmpty(search.Email))
                query = query.Where(u => u.Email.Contains(search.Email));
            if (search.RoleId.HasValue)
                query = query.Where(u => u.RoleId == search.RoleId);

            var totalCount = query.Count();

            var data = query
                .Skip((search.Page - 1) * search.PerPage)
                .Take(search.PerPage)
                .Select(u => new UserDto
                {
                    Id = u.Id,
                    Ime = u.Ime,
                    Prezime = u.Prezime,
                    Email = u.Email,
                    Telefon = u.Telefon,
                    Pol = u.Pol,
                    DatumRodjenja = u.DatumRodjenja,
                    SlikaUrl = u.SlikaUrl,
                    Role = u.Role.Naziv
                })
                .ToList();

            return new PagedResult<UserDto>
            {
                Data = data,
                CurrentPage = search.Page,
                PerPage = search.PerPage,
                TotalCount = totalCount
            };
        }
    }
}

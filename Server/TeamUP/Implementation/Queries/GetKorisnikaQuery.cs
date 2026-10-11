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
    public class GetKorisnikaQuery : IGetKorisnikaQuery
    {
        private readonly TeamUpContext _context;

        public GetKorisnikaQuery(TeamUpContext context)
        {
            _context = context;
        }

        public UserDto Execute(int id)
        {
            var user = _context.Users
                .Include(u => u.Role)
                .FirstOrDefault(u => u.Id == id && u.DeletedAt == null);

            if (user == null)
                throw new KeyNotFoundException($"Korisnik sa ID-em {id} nije pronadjen.");

            return new UserDto
            {
                Id = user.Id,
                Ime = user.Ime,
                Prezime = user.Prezime,
                Email = user.Email,
                Telefon = user.Telefon,
                Pol = user.Pol,
                DatumRodjenja = user.DatumRodjenja,
                SlikaUrl = user.SlikaUrl,
                Role = user.Role.Naziv
            };
        }
    }
}

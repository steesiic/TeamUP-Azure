using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using ApplicationLayer.DTO;
using ApplicationLayer.UseCases.Commands;
using DataAccessLayer;
using DomainLayer.Entities;

namespace Implementation.Commands
{
    public class RegisterUserCommand : IRegisterUserCommand
    {
        private readonly TeamUpContext _context;

        public RegisterUserCommand(TeamUpContext context)
        {
            _context = context;
        }

        public void Execute(CreateUserDto dto)
        {
            if (_context.Users.Any(u => u.Email == dto.Email && u.DeletedAt == null))
                throw new InvalidOperationException($"Korisnik sa emailom '{dto.Email}' već postoji.");

            var user = new User
            {
                Ime = dto.Ime,
                Prezime = dto.Prezime,
                Email = dto.Email,
                PasswordHash = BCrypt.Net.BCrypt.HashPassword(dto.Password),
                Telefon = dto.Telefon,
                Pol = dto.Pol,
                DatumRodjenja = dto.DatumRodjenja,
                SlikaUrl = dto.SlikaUrl,
                RoleId = dto.RoleId
            };

            _context.Users.Add(user);
            _context.SaveChanges();
        }
    }
}
using ApplicationLayer.DTO;
using ApplicationLayer.UseCases.Commands;
using DataAccessLayer;

namespace Implementation.Commands
{
    public class UpdateUserCommand : IUpdateUserCommand
    {
        private readonly TeamUpContext _context;
        public UpdateUserCommand(TeamUpContext context)
        {
            _context = context;
        }

        public void Execute(UpdateUserDto dto)
        {
            var user = _context.Users.Find(dto.Id);
            if (user == null)
                throw new KeyNotFoundException($"Korisnik sa ID-em {dto.Id} nije pronadjen.");

            if (dto.Ime != null) user.Ime = dto.Ime;
            if (dto.Prezime != null) user.Prezime = dto.Prezime;
            if (dto.Telefon != null) user.Telefon = dto.Telefon;
            if (dto.Pol != null) user.Pol = dto.Pol.Value;
            if (dto.DatumRodjenja != null) user.DatumRodjenja = dto.DatumRodjenja;
            if (dto.SlikaUrl != null) user.SlikaUrl = dto.SlikaUrl;

            if (dto.NovaLozinka != null)
            {
                if (string.IsNullOrEmpty(dto.StaraLozinka))
                    throw new InvalidOperationException("Morate uneti staru lozinku.");

                if (!BCrypt.Net.BCrypt.Verify(dto.StaraLozinka, user.PasswordHash))
                    throw new InvalidOperationException("Stara lozinka nije ispravna.");

                if (dto.NovaLozinka.Length < 8)
                    throw new InvalidOperationException("Nova lozinka mora imati najmanje 8 karaktera.");

                user.PasswordHash = BCrypt.Net.BCrypt.HashPassword(dto.NovaLozinka);
            }

            _context.SaveChanges();
        }
    }
}
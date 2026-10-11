using ApplicationLayer;
using ApplicationLayer.DTO;
using ApplicationLayer.UseCases.Queries;
using DataAccessLayer;
using DomainLayer.Entities;
using Implementation.Auth;
using Microsoft.EntityFrameworkCore;

namespace Implementation.Queries
{
    public class LoginUserQuery : ILoginUserQuery
    {
        private readonly TeamUpContext _context;
        private readonly ITokenStorage _tokenStorage;

        public LoginUserQuery(TeamUpContext context, ITokenStorage tokenStorage)
        {
            _context = context;
            _tokenStorage = tokenStorage;
        }

        public string Execute(LoginDto request)
        {
            var user = _context.Users
                .Include(u => u.Role)
                .FirstOrDefault(u => u.Email == request.Email && u.DeletedAt == null);

            if (user == null)
                throw new UnauthorizedAccessException("Invalid credentials.");

            if (!BCrypt.Net.BCrypt.Verify(request.Password, user.PasswordHash))
                throw new UnauthorizedAccessException("Invalid credentials.");

            var actor = new JwtActor
            {
                Id = user.Id,
                Identity = user.Email,
                AllowedUseCases = GetAllowedUseCases(user)
            };

            return _tokenStorage.Create(actor);
        }

        private static IEnumerable<int> GetAllowedUseCases(User user)
        {
            if (user.Role.Naziv == "Admin")
                return Enum.GetValues<ApplicationLayer.UseCases.UseCases>().Cast<int>();

            if (user.Role.Naziv == "Vlasnik")
                return new[]
                {
                    (int)ApplicationLayer.UseCases.UseCases.Login,
                    (int)ApplicationLayer.UseCases.UseCases.GetKorisnika,
                    (int)ApplicationLayer.UseCases.UseCases.GetObjekat,
                    (int)ApplicationLayer.UseCases.UseCases.GetObjekte,
                    (int)ApplicationLayer.UseCases.UseCases.CreateObjekat,
                    (int)ApplicationLayer.UseCases.UseCases.UpdateObjekat,
                    (int)ApplicationLayer.UseCases.UseCases.DeleteObjekat,
                    (int)ApplicationLayer.UseCases.UseCases.GetSport,
                    (int)ApplicationLayer.UseCases.UseCases.GetSportove,
                    (int)ApplicationLayer.UseCases.UseCases.GetTermin,
                    (int)ApplicationLayer.UseCases.UseCases.GetTermine,
                    (int)ApplicationLayer.UseCases.UseCases.CreateTermin,
                    (int)ApplicationLayer.UseCases.UseCases.UpdateTermin,
                    (int)ApplicationLayer.UseCases.UseCases.DeleteTermin,
                    (int)ApplicationLayer.UseCases.UseCases.GetRezervacije,
                    (int)ApplicationLayer.UseCases.UseCases.GetRezervaciju,
                    (int)ApplicationLayer.UseCases.UseCases.UpdateRezervaciju,
                    (int)ApplicationLayer.UseCases.UseCases.UpdateIgracStatus,
                    (int)ApplicationLayer.UseCases.UseCases.UpdateKorisnika,
                    (int)ApplicationLayer.UseCases.UseCases.DeleteKorisnika,
                };

            // Igrac
            return new[]
            {
                (int)ApplicationLayer.UseCases.UseCases.Login,
                (int)ApplicationLayer.UseCases.UseCases.GetKorisnika,
                (int)ApplicationLayer.UseCases.UseCases.GetObjekat,
                (int)ApplicationLayer.UseCases.UseCases.GetObjekte,
                (int)ApplicationLayer.UseCases.UseCases.GetSport,
                (int)ApplicationLayer.UseCases.UseCases.GetSportove,
                (int)ApplicationLayer.UseCases.UseCases.GetTermin,
                (int)ApplicationLayer.UseCases.UseCases.GetTermine,
                (int)ApplicationLayer.UseCases.UseCases.GetRezervaciju,
                (int)ApplicationLayer.UseCases.UseCases.GetRezervacije,
                (int)ApplicationLayer.UseCases.UseCases.CreateRezervaciju,
                (int)ApplicationLayer.UseCases.UseCases.UpdateRezervaciju,
                (int)ApplicationLayer.UseCases.UseCases.DeleteRezervaciju,
                (int)ApplicationLayer.UseCases.UseCases.JoinTermin,
                (int)ApplicationLayer.UseCases.UseCases.LeaveTermin,
                (int)ApplicationLayer.UseCases.UseCases.UpdateIgracStatus,
                (int)ApplicationLayer.UseCases.UseCases.UpdateKorisnika,
                (int)ApplicationLayer.UseCases.UseCases.DeleteKorisnika,
                (int)ApplicationLayer.UseCases.UseCases.CreateOcena,
                (int)ApplicationLayer.UseCases.UseCases.UpdateOcena,
                (int)ApplicationLayer.UseCases.UseCases.DeleteOcena,
                (int)ApplicationLayer.UseCases.UseCases.GetOcene,
                (int)ApplicationLayer.UseCases.UseCases.CreateOcenaIgraca,
                (int)ApplicationLayer.UseCases.UseCases.UpdateOcenaIgraca,
                (int)ApplicationLayer.UseCases.UseCases.GetOceneIgraca
            };
        }
    }
}

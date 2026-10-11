using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using ApplicationLayer;
using Microsoft.IdentityModel.Tokens;

namespace Implementation.Auth
{
    public class JwtTokenProvider : ITokenStorage
    {
        private readonly AppSettings _settings;

        public JwtTokenProvider(AppSettings settings)
        {
            _settings = settings;
        }

        public string Create(IApplicationActor actor)
        {
            var tokenHandler = new JwtSecurityTokenHandler();
            tokenHandler.InboundClaimTypeMap.Clear(); //ovo sprecava remapiranje
            var key = Encoding.ASCII.GetBytes(_settings.JwtSecret);

            var claims = new List<Claim>
            {
                new Claim("id", actor.Id.ToString()),
                new Claim("email", actor.Identity)
            };

            foreach (var useCase in actor.AllowedUseCases)
                claims.Add(new Claim("useCase", useCase.ToString()));

            var tokenDescriptor = new SecurityTokenDescriptor
            {
                Subject = new ClaimsIdentity(claims),
                Expires = DateTime.UtcNow.AddDays(7),
                SigningCredentials = new SigningCredentials(
                    new SymmetricSecurityKey(key),
                    SecurityAlgorithms.HmacSha256Signature)
            };

            var token = tokenHandler.CreateToken(tokenDescriptor);
            return tokenHandler.WriteToken(token);
        }
    }
}

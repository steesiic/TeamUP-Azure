using DataAccessLayer;
using Microsoft.EntityFrameworkCore;
using System.IdentityModel.Tokens.Jwt;

namespace API.Middleware
{
    public class CheckDeletedUserMiddleware
    {
        private readonly RequestDelegate _next;

        public CheckDeletedUserMiddleware(RequestDelegate next)
        {
            _next = next;
        }

        public async Task InvokeAsync(HttpContext context, TeamUpContext db)
        {
            var authHeader = context.Request.Headers["Authorization"].FirstOrDefault();
            if (authHeader != null && authHeader.StartsWith("Bearer "))
            {
                var token = authHeader.Substring(7);
                try
                {
                    var handler = new JwtSecurityTokenHandler();
                    var jwt = handler.ReadJwtToken(token);
                    var idClaim = jwt.Claims.FirstOrDefault(c => c.Type == "id");
                    if (idClaim != null && int.TryParse(idClaim.Value, out int userId))
                    {
                        var postoji = db.Users.Any(u => u.Id == userId && u.DeletedAt == null);
                        if (!postoji)
                        {
                            context.Response.StatusCode = 401;
                            context.Response.ContentType = "application/json";
                            await context.Response.WriteAsync("{\"error\":\"Korisnicki nalog je obrisan.\"}");
                            return;
                        }
                    }
                }
                catch { /* ignorisi nevalidan token */ }
            }

            await _next(context);
        }
    }
}
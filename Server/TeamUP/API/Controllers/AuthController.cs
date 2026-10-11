using ApplicationLayer.DTO;
using ApplicationLayer.UseCases.Queries;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace API.Controllers
{
    [ApiController]
    [Route("api/auth")]
    public class AuthController : ControllerBase
    {
        private readonly ILoginUserQuery _loginQuery;

        public AuthController(ILoginUserQuery loginQuery)
        {
            _loginQuery = loginQuery;
        }

        [HttpPost]
        [AllowAnonymous]
        public IActionResult Login([FromBody] LoginDto dto)
        {
            var token = _loginQuery.Execute(dto);
            return Ok(new { token });
        }
    }
}

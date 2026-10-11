using ApplicationLayer;
using ApplicationLayer.DTO;
using ApplicationLayer.UseCases.Commands;
using ApplicationLayer.UseCases.Queries;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using DataAccessLayer;

namespace API.Controllers
{
    [ApiController]
    [Route("api/users")]
    [Authorize]
    public class UsersController : ControllerBase
    {
        private readonly IGetKorisnikeQuery _getKorisnike;
        private readonly IGetKorisnikaQuery _getKorisnika;
        private readonly IRegisterUserCommand _registerUser;
        private readonly IUpdateUserCommand _updateUser;
        private readonly IDeleteUserCommand _deleteUser;
        private readonly IApplicationActor _actor;
        private readonly TeamUpContext _context;

        public UsersController(
            IGetKorisnikeQuery getKorisnike,
            IGetKorisnikaQuery getKorisnika,
            IRegisterUserCommand registerUser,
            IUpdateUserCommand updateUser,
            IDeleteUserCommand deleteUser,
            IApplicationActor actor,
            TeamUpContext context)
        {
            _getKorisnike = getKorisnike;
            _getKorisnika = getKorisnika;
            _registerUser = registerUser;
            _updateUser = updateUser;
            _deleteUser = deleteUser;
            _actor = actor;
            _context = context;
        }

        [HttpGet]
        public IActionResult GetAll([FromQuery] UserSearch search)
        {
            if (!_actor.AllowedUseCases.Contains((int)ApplicationLayer.UseCases.UseCases.GetKorisnike))
                return Forbid();

            var result = _getKorisnike.Execute(search);
            return Ok(result);
        }

        [HttpGet("{id}")]
        public IActionResult GetOne(int id)
        {
            if (!_actor.AllowedUseCases.Contains((int)ApplicationLayer.UseCases.UseCases.GetKorisnika))
                return Forbid();

            var result = _getKorisnika.Execute(id);
            return Ok(result);
        }

        [HttpGet("check-email")]
        [AllowAnonymous]
        public IActionResult CheckEmail([FromQuery] string email)
        {
            if (string.IsNullOrEmpty(email))
                return BadRequest(new { error = "Email je obavezan." });
            var exists = _context.Users.Any(u => u.Email == email);
            return Ok(new { exists });
        }

        [HttpPost("register")]
        [AllowAnonymous]
        public IActionResult Register([FromBody] CreateUserDto dto)
        {
            _registerUser.Execute(dto);
            return StatusCode(201);
        }

        [HttpPatch("{id}")]
        public IActionResult Update(int id, [FromBody] UpdateUserDto dto)
        {
            if (!_actor.AllowedUseCases.Contains((int)ApplicationLayer.UseCases.UseCases.UpdateKorisnika))
                return Forbid();

            if (_actor.Id != id && !_actor.AllowedUseCases.Contains((int)ApplicationLayer.UseCases.UseCases.GetKorisnike))
                return Forbid();

            dto.Id = id;
            _updateUser.Execute(dto);
            return NoContent();
        }

        [HttpDelete("{id}")]
        public IActionResult Delete(int id)
        {
            if (!_actor.AllowedUseCases.Contains((int)ApplicationLayer.UseCases.UseCases.DeleteKorisnika))
                return Forbid();

            if (_actor.Id != id && !_actor.AllowedUseCases.Contains((int)ApplicationLayer.UseCases.UseCases.GetKorisnike))
                return Forbid();

            _deleteUser.Execute(id);
            return NoContent();
        }
    }
}

using ApplicationLayer;
using ApplicationLayer.DTO;
using ApplicationLayer.UseCases.Commands;
using ApplicationLayer.UseCases.Queries;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace API.Controllers
{
    [ApiController]
    [Route("api/ocene")]
    [Authorize]
    public class OceneController : ControllerBase
    {
        private readonly IGetOceneQuery _getOcene;
        private readonly ICreateOcenaCommand _createOcena;
        private readonly IUpdateOcenaCommand _updateOcena;
        private readonly IDeleteOcenaCommand _deleteOcena;
        private readonly IApplicationActor _actor;

        public OceneController(
            IGetOceneQuery getOcene,
            ICreateOcenaCommand createOcena,
            IUpdateOcenaCommand updateOcena,
            IDeleteOcenaCommand deleteOcena,
            IApplicationActor actor)
        {
            _getOcene = getOcene;
            _createOcena = createOcena;
            _updateOcena = updateOcena;
            _deleteOcena = deleteOcena;
            _actor = actor;
        }

        [HttpGet]
        [AllowAnonymous]
        public IActionResult GetAll([FromQuery] int objekatId)
        {
            var result = _getOcene.Execute(objekatId);
            return Ok(result);
        }

        [HttpPost]
        public IActionResult Create([FromBody] CreateOcenaDto dto)
        {
            if (!_actor.AllowedUseCases.Contains((int)ApplicationLayer.UseCases.UseCases.CreateOcena))
                return Forbid();
            _createOcena.Execute(dto);
            return StatusCode(201);
        }

        [HttpPatch("{id}")]
        public IActionResult Update(int id, [FromBody] UpdateOcenaDto dto)
        {
            if (!_actor.AllowedUseCases.Contains((int)ApplicationLayer.UseCases.UseCases.UpdateOcena))
                return Forbid();
            dto.Id = id;
            _updateOcena.Execute(dto);
            return NoContent();
        }

        [HttpDelete("{id}")]
        public IActionResult Delete(int id)
        {
            if (!_actor.AllowedUseCases.Contains((int)ApplicationLayer.UseCases.UseCases.DeleteOcena))
                return Forbid();
            _deleteOcena.Execute(id);
            return NoContent();
        }
    }
}
using ApplicationLayer;
using ApplicationLayer.DTO;
using ApplicationLayer.UseCases.Commands;
using ApplicationLayer.UseCases.Queries;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace API.Controllers
{
    [ApiController]
    [Route("api/ocene-igraca")]
    [Authorize]
    public class OceneIgracaController : ControllerBase
    {
        private readonly IGetOceneIgracaQuery _getOcene;
        private readonly ICreateOcenaIgracaCommand _createOcena;
        private readonly IUpdateOcenaIgracaCommand _updateOcena;
        private readonly IApplicationActor _actor;

        public OceneIgracaController(
            IGetOceneIgracaQuery getOcene,
            ICreateOcenaIgracaCommand createOcena,
            IUpdateOcenaIgracaCommand updateOcena,
            IApplicationActor actor)
        {
            _getOcene = getOcene;
            _createOcena = createOcena;
            _updateOcena = updateOcena;
            _actor = actor;
        }

        [HttpGet]
        [AllowAnonymous]
        public IActionResult GetAll([FromQuery] int ocenjeniId)
        {
            var result = _getOcene.Execute(ocenjeniId);
            return Ok(result);
        }

        [HttpPost]
        public IActionResult Create([FromBody] CreateOcenaIgracaDto dto)
        {
            if (!_actor.AllowedUseCases.Contains((int)ApplicationLayer.UseCases.UseCases.CreateOcenaIgraca))
                return Forbid();
            _createOcena.Execute(dto);
            return StatusCode(201);
        }

        [HttpPatch("{id}")]
        public IActionResult Update(int id, [FromBody] UpdateOcenaIgracaDto dto)
        {
            if (!_actor.AllowedUseCases.Contains((int)ApplicationLayer.UseCases.UseCases.UpdateOcenaIgraca))
                return Forbid();
            dto.Id = id;
            _updateOcena.Execute(dto);
            return NoContent();
        }
    }
}
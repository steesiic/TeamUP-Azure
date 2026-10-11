using ApplicationLayer.DTO;
using ApplicationLayer.UseCases.Commands;
using ApplicationLayer.UseCases.Queries;
using ApplicationLayer;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace API.Controllers
{
    [ApiController]
    [Route("api/sportovi")]
    [Authorize]
    public class SportoviController : ControllerBase
    {
        private readonly IGetSportoveQuery _getSportove;
        private readonly IGetSportQuery _getSport;
        private readonly ICreateSportCommand _createSport;
        private readonly IDeleteSportCommand _deleteSport;
        private readonly IApplicationActor _actor;

        public SportoviController(
            IGetSportoveQuery getSportove,
            IGetSportQuery getSport,
            ICreateSportCommand createSport,
            IDeleteSportCommand deleteSport,
            IApplicationActor actor)
        {
            _getSportove = getSportove;
            _getSport = getSport;
            _createSport = createSport;
            _deleteSport = deleteSport;
            _actor = actor;
        }

        [HttpGet]
        [AllowAnonymous]
        public IActionResult GetAll([FromQuery] SportSearch search)
        {
            var result = _getSportove.Execute(search);
            return Ok(result);
        }

        [HttpGet("{id}")]
        [AllowAnonymous]
        public IActionResult GetOne(int id)
        {
            var result = _getSport.Execute(id);
            return Ok(result);
        }

        [HttpPost]
        public IActionResult Create([FromBody] CreateSportDto dto)
        {
            if (!_actor.AllowedUseCases.Contains((int)ApplicationLayer.UseCases.UseCases.CreateSport))
                return Forbid();
            _createSport.Execute(dto);
            return StatusCode(201);
        }

        [HttpDelete("{id}")]
        public IActionResult Delete(int id)
        {
            if (!_actor.AllowedUseCases.Contains((int)ApplicationLayer.UseCases.UseCases.DeleteSport))
                return Forbid();
            _deleteSport.Execute(id);
            return NoContent();
        }
    }
}
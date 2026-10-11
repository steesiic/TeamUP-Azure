using ApplicationLayer.UseCases.Commands;
using ApplicationLayer.UseCases.Queries;
using ApplicationLayer;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using ApplicationLayer.DTO;

namespace API.Controllers
{
    [ApiController]
    [Route("api/termini")]
    [Authorize]
    public class TerminiController : ControllerBase
    {
        private readonly IGetTermineQuery _getTermine;
        private readonly IGetTerminQuery _getTermin;
        private readonly ICreateTerminCommand _createTermin;
        private readonly IUpdateTerminCommand _updateTermin;
        private readonly IDeleteTerminCommand _deleteTermin;
        private readonly IApplicationActor _actor;

        public TerminiController(
            IGetTermineQuery getTermine,
            IGetTerminQuery getTermin,
            ICreateTerminCommand createTermin,
            IUpdateTerminCommand updateTermin,
            IDeleteTerminCommand deleteTermin,
            IApplicationActor actor)
        {
            _getTermine = getTermine;
            _getTermin = getTermin;
            _createTermin = createTermin;
            _updateTermin = updateTermin;
            _deleteTermin = deleteTermin;
            _actor = actor;
        }

        [HttpGet]
        [AllowAnonymous]
        public IActionResult GetAll([FromQuery] TerminSearch search)
        {
            var result = _getTermine.Execute(search);
            return Ok(result);
        }

        [HttpGet("{id}")]
        [AllowAnonymous]
        public IActionResult GetOne(int id)
        {
            var result = _getTermin.Execute(id);
            return Ok(result);
        }

        [HttpPost]
        public IActionResult Create([FromBody] CreateTerminDto dto)
        {
            if (!_actor.AllowedUseCases.Contains((int)ApplicationLayer.UseCases.UseCases.CreateTermin))
                return Forbid();
            _createTermin.Execute(dto);
            return StatusCode(201);
        }

        [HttpPatch("{id}")]
        public IActionResult Update(int id, [FromBody] UpdateTerminDto dto)
        {
            if (!_actor.AllowedUseCases.Contains((int)ApplicationLayer.UseCases.UseCases.UpdateTermin))
                return Forbid();
            dto.Id = id;
            _updateTermin.Execute(dto);
            return NoContent();
        }

        [HttpDelete("{id}")]
        public IActionResult Delete(int id)
        {
            if (!_actor.AllowedUseCases.Contains((int)ApplicationLayer.UseCases.UseCases.DeleteTermin))
                return Forbid();
            _deleteTermin.Execute(id);
            return NoContent();
        }
    }
}
using ApplicationLayer.UseCases.Commands;
using ApplicationLayer;
using ApplicationLayer.UseCases.Queries;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using ApplicationLayer.DTO;

namespace API.Controllers
{
    [ApiController]
    [Route("api/objekti")]
    [Authorize]
    public class ObjektiController : ControllerBase
    {
        private readonly IGetObjekteQuery _getObjekte;
        private readonly IGetObjekatQuery _getObjekat;
        private readonly ICreateObjekatCommand _createObjekat;
        private readonly IUpdateObjekatCommand _updateObjekat;
        private readonly IDeleteObjekatCommand _deleteObjekat;
        private readonly IApplicationActor _actor;

        public ObjektiController(
            IGetObjekteQuery getObjekte,
            IGetObjekatQuery getObjekat,
            ICreateObjekatCommand createObjekat,
            IUpdateObjekatCommand updateObjekat,
            IDeleteObjekatCommand deleteObjekat,
            IApplicationActor actor)
        {
            _getObjekte = getObjekte;
            _getObjekat = getObjekat;
            _createObjekat = createObjekat;
            _updateObjekat = updateObjekat;
            _deleteObjekat = deleteObjekat;
            _actor = actor;
        }

        [HttpGet]
        [AllowAnonymous]
        public IActionResult GetAll([FromQuery] ObjekatSearch search)
        {
            var result = _getObjekte.Execute(search);
            return Ok(result);
        }

        [HttpGet("{id}")]
        [AllowAnonymous]
        public IActionResult GetOne(int id)
        {
            var result = _getObjekat.Execute(id);
            return Ok(result);
        }

        [HttpPost]
        public IActionResult Create([FromBody] CreateObjekatDto dto)
        {
            if (!_actor.AllowedUseCases.Contains((int)ApplicationLayer.UseCases.UseCases.CreateObjekat))
                return Forbid();
            var id = _createObjekat.Execute(dto, _actor.Id);
            return StatusCode(201, new { id });
        }

        [HttpPatch("{id}")]
        public IActionResult Update(int id, [FromBody] UpdateObjekatDto dto)
        {
            if (!_actor.AllowedUseCases.Contains((int)ApplicationLayer.UseCases.UseCases.UpdateObjekat))
                return Forbid();
            dto.Id = id;
            _updateObjekat.Execute(dto);
            return NoContent();
        }

        [HttpDelete("{id}")]
        public IActionResult Delete(int id)
        {
            if (!_actor.AllowedUseCases.Contains((int)ApplicationLayer.UseCases.UseCases.DeleteObjekat))
                return Forbid();
            _deleteObjekat.Execute(id);
            return NoContent();
        }
    }
}
using ApplicationLayer.DTO;
using ApplicationLayer.UseCases.Commands;
using ApplicationLayer.UseCases.Queries;
using ApplicationLayer;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace API.Controllers
{
    [ApiController]
    [Route("api/rezervacije")]
    [Authorize]
    public class RezervacijeController : ControllerBase
    {
        private readonly IGetRezervacijeQuery _getRezervacije;
        private readonly IGetRezervacijuQuery _getRezervaciju;
        private readonly ICreateRezervacijuCommand _createRezervaciju;
        private readonly IUpdateRezervacijuCommand _updateRezervaciju;
        private readonly IDeleteRezervacijuCommand _deleteRezervaciju;
        private readonly IJoinTerminCommand _joinTermin;
        private readonly ILeaveTerminCommand _leaveTermin;
        private readonly IUpdateIgracStatusCommand _updateIgracStatus;
        private readonly IApplicationActor _actor;

        public RezervacijeController(
            IGetRezervacijeQuery getRezervacije,
            IGetRezervacijuQuery getRezervaciju,
            ICreateRezervacijuCommand createRezervaciju,
            IUpdateRezervacijuCommand updateRezervaciju,
            IDeleteRezervacijuCommand deleteRezervaciju,
            IJoinTerminCommand joinTermin,
            ILeaveTerminCommand leaveTermin,
            IUpdateIgracStatusCommand updateIgracStatus,
            IApplicationActor actor)
        {
            _getRezervacije = getRezervacije;
            _getRezervaciju = getRezervaciju;
            _createRezervaciju = createRezervaciju;
            _updateRezervaciju = updateRezervaciju;
            _deleteRezervaciju = deleteRezervaciju;
            _joinTermin = joinTermin;
            _leaveTermin = leaveTermin;
            _updateIgracStatus = updateIgracStatus;
            _actor = actor;
        }

        [HttpGet]
        [AllowAnonymous]
        public IActionResult GetAll([FromQuery] RezervacijaSearch search)
        {
            var result = _getRezervacije.Execute(search);
            return Ok(result);
        }

        [HttpGet("{id}")]
        [AllowAnonymous]
        public IActionResult GetOne(int id)
        {
            var result = _getRezervaciju.Execute(id);
            return Ok(result);
        }

        [HttpPost]
        public IActionResult Create([FromBody] CreateRezervacijuDto dto)
        {
            if (!_actor.AllowedUseCases.Contains((int)ApplicationLayer.UseCases.UseCases.CreateRezervaciju))
                return Forbid();
            try
            {
                _createRezervaciju.Execute(dto);
                return StatusCode(201);
            }
            catch (InvalidOperationException ex)
            {
                return Conflict(new { message = ex.Message });
            }
        }

        [HttpPatch("{id}")]
        public IActionResult Update(int id, [FromBody] UpdateRezervacijuDto dto)
        {
            if (!_actor.AllowedUseCases.Contains((int)ApplicationLayer.UseCases.UseCases.UpdateRezervaciju))
                return Forbid();
            dto.Id = id;
            _updateRezervaciju.Execute(dto);
            return NoContent();
        }

        [HttpDelete("{id}")]
        public IActionResult Delete(int id)
        {
            if (!_actor.AllowedUseCases.Contains((int)ApplicationLayer.UseCases.UseCases.DeleteRezervaciju))
                return Forbid();
            _deleteRezervaciju.Execute(id);
            return NoContent();
        }

        [HttpPost("{id}/join")]
        public IActionResult Join(int id, [FromQuery] int igracId)
        {
            if (!_actor.AllowedUseCases.Contains((int)ApplicationLayer.UseCases.UseCases.JoinTermin))
                return Forbid();
            try
            {
                _joinTermin.Execute(new JoinTerminDto { RezervacijaId = id, IgracId = igracId });
                return StatusCode(201);
            }
            catch (InvalidOperationException ex)
            {
                return Conflict(new { message = ex.Message });
            }
        }

        [HttpDelete("{id}/leave")]
        public IActionResult Leave(int id, [FromQuery] int igracId)
        {
            if (!_actor.AllowedUseCases.Contains((int)ApplicationLayer.UseCases.UseCases.LeaveTermin))
                return Forbid();
            _leaveTermin.Execute(new LeaveTerminDto { RezervacijaId = id, IgracId = igracId });
            return NoContent();
        }

        [HttpPatch("{id}/igraci/{igracId}")]
        public IActionResult UpdateIgracStatus(int id, int igracId, [FromBody] string status)
        {
            if (!_actor.AllowedUseCases.Contains((int)ApplicationLayer.UseCases.UseCases.UpdateIgracStatus))
                return Forbid();
            _updateIgracStatus.Execute(new UpdateIgracStatusDto { RezervacijaId = id, IgracId = igracId, Status = status });
            return NoContent();
        }
    }
}
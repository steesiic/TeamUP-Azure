using ApplicationLayer;
using ApplicationLayer.DTO;
using ApplicationLayer.UseCases.Commands;
using DataAccessLayer;

namespace Implementation.Commands
{
    public class UpdateOcenaIgracaCommand : IUpdateOcenaIgracaCommand
    {
        private readonly TeamUpContext _context;
        private readonly IApplicationActor _actor;

        public UpdateOcenaIgracaCommand(TeamUpContext context, IApplicationActor actor)
        {
            _context = context;
            _actor = actor;
        }

        public void Execute(UpdateOcenaIgracaDto dto)
        {
            var ocena = _context.OceneIgraca.Find(dto.Id);
            if (ocena == null)
                throw new KeyNotFoundException($"Ocena sa ID-em {dto.Id} nije pronađena.");

            if (ocena.OcenioId != _actor.Id)
                throw new UnauthorizedAccessException("Možete menjati samo svoje ocene.");

            if (dto.Vrednost < 1 || dto.Vrednost > 5)
                throw new ArgumentException("Ocena mora biti između 1 i 5.");

            ocena.Vrednost = dto.Vrednost;
            ocena.Komentar = dto.Komentar;
            ocena.DatumOcene = DateTime.UtcNow;
            _context.SaveChanges();
        }
    }
}
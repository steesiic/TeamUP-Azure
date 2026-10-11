using ApplicationLayer;
using ApplicationLayer.UseCases.Commands;
using DataAccessLayer;

namespace Implementation.Commands
{
    public class DeleteOcenaCommand : IDeleteOcenaCommand
    {
        private readonly TeamUpContext _context;
        private readonly IApplicationActor _actor;

        public DeleteOcenaCommand(TeamUpContext context, IApplicationActor actor)
        {
            _context = context;
            _actor = actor;
        }

        public void Execute(int id)
        {
            var ocena = _context.Ocene.Find(id);
            if (ocena == null)
                throw new KeyNotFoundException($"Ocena sa ID-em {id} nije pronađena.");

            if (ocena.IgracId != _actor.Id)
                throw new UnauthorizedAccessException("Možete brisati samo svoje ocene.");

            _context.Ocene.Remove(ocena);
            _context.SaveChanges();
        }
    }
}
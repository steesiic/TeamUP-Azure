using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using ApplicationLayer.UseCases.Commands;
using DataAccessLayer;

namespace Implementation.Commands
{
    public class DeleteTerminCommand : IDeleteTerminCommand
    {
        private readonly TeamUpContext _context;

        public DeleteTerminCommand(TeamUpContext context)
        {
            _context = context;
        }

        public void Execute(int id)
        {
            var termin = _context.Termini.Find(id);

            if (termin == null)
                throw new KeyNotFoundException($"Termin sa ID-em {id} nije pronadjen.");

            if (termin.Status != DomainLayer.Entities.TerminStatus.Slobodan)
                throw new InvalidOperationException("Nije moguće obrisati termin koji nije slobodan.");

            _context.Termini.Remove(termin);
            _context.SaveChanges();
        }
    }
}

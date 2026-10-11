using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using ApplicationLayer.UseCases.Commands;
using DataAccessLayer;

namespace Implementation.Commands
{
    public class DeleteSportCommand : IDeleteSportCommand
    {
        private readonly TeamUpContext _context;

        public DeleteSportCommand(TeamUpContext context)
        {
            _context = context;
        }

        public void Execute(int id)
        {
            var sport = _context.Sportovi.Find(id);

            if (sport == null)
                throw new KeyNotFoundException($"Sport sa ID-em {id} nije pronadjen.");

            _context.Sportovi.Remove(sport);
            _context.SaveChanges();
        }
    }
}

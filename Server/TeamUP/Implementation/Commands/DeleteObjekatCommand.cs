using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using ApplicationLayer.UseCases.Commands;
using DataAccessLayer;
using DomainLayer.Entities;
using Microsoft.EntityFrameworkCore;

namespace Implementation.Commands
{
    public class DeleteObjekatCommand : IDeleteObjekatCommand
    {
        private readonly TeamUpContext _context;

        public DeleteObjekatCommand(TeamUpContext context)
        {
            _context = context;
        }

        public void Execute(int id)
        {
            var objekat = _context.Objekti
                .Include(o => o.Termini)
                .FirstOrDefault(o => o.Id == id);
            if (objekat == null)
                throw new KeyNotFoundException($"Objekat sa ID-em {id} nije pronadjen.");

            var terminiIds = objekat.Termini.Select(t => t.Id).ToList();

            var rezervacije = _context.Rezervacije
                .Where(r => terminiIds.Contains(r.TerminId)
                         && (r.Status == RezervacijaStatus.Aktivna))
                .ToList();

            foreach (var r in rezervacije)
                r.Status = RezervacijaStatus.Otkazana;

            foreach (var t in objekat.Termini)
                t.DeletedAt = DateTime.UtcNow;

            objekat.DeletedAt = DateTime.UtcNow;
            _context.SaveChanges();
        }
    }
}

using ApplicationLayer.UseCases.Commands;
using DataAccessLayer;
using DomainLayer.Entities;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Implementation.Commands
{
    public class DeleteRezervacijuCommand : IDeleteRezervacijuCommand
    {
        private readonly TeamUpContext _context;

        public DeleteRezervacijuCommand(TeamUpContext context)
        {
            _context = context;
        }

        public void Execute(int id)
        {
            var rezervacija = _context.Rezervacije
                .Include(r => r.RezervacijaIgraci)
                .FirstOrDefault(r => r.Id == id);
            if (rezervacija == null)
                throw new KeyNotFoundException($"Rezervacija sa ID-em {id} nije pronadjena.");

            var termin = _context.Termini.Find(rezervacija.TerminId);
            if (termin != null)
                termin.Status = TerminStatus.Slobodan;

            rezervacija.Status = RezervacijaStatus.Otkazana;
            //rezervacija.DeletedAt = DateTime.UtcNow;

            _context.SaveChanges();
        }
    }
}

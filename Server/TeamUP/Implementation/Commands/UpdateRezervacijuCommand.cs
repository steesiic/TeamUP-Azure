using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using ApplicationLayer.DTO;
using ApplicationLayer.UseCases.Commands;
using DataAccessLayer;
using DomainLayer.Entities;

namespace Implementation.Commands
{
    public class UpdateRezervacijuCommand : IUpdateRezervacijuCommand
    {
        private readonly TeamUpContext _context;

        public UpdateRezervacijuCommand(TeamUpContext context)
        {
            _context = context;
        }

        public void Execute(UpdateRezervacijuDto dto)
        {
            var rezervacija = _context.Rezervacije.Find(dto.Id);

            if (rezervacija == null)
                throw new KeyNotFoundException($"Rezervacija sa ID-em {dto.Id} nije pronadjena.");

            if (!Enum.TryParse<RezervacijaStatus>(dto.Status, out var noviStatus))
                throw new InvalidOperationException($"Status '{dto.Status}' nije validan.");

            if (noviStatus == RezervacijaStatus.Otkazana)
            {
                var termin = _context.Termini.Find(rezervacija.TerminId);
                if (termin != null)
                    termin.Status = TerminStatus.Slobodan;
            }

            rezervacija.Status = noviStatus;
            _context.SaveChanges();
        }
    }
}

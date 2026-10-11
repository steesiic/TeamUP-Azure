using ApplicationLayer.DTO;
using ApplicationLayer.UseCases.Commands;
using DataAccessLayer;
using DomainLayer.Entities;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;

namespace Implementation.Commands
{
    public class LeaveTerminCommand : ILeaveTerminCommand
    {
        private readonly TeamUpContext _context;

        public LeaveTerminCommand(TeamUpContext context)
        {
            _context = context;
        }

        public void Execute(LeaveTerminDto dto)
        {
            var rezervacija = _context.Rezervacije
                .Include(r => r.RezervacijaIgraci)
                .Include(r => r.Termin)
                .FirstOrDefault(r => r.Id == dto.RezervacijaId);

            if (rezervacija == null)
                throw new KeyNotFoundException($"Rezervacija sa ID-em {dto.RezervacijaId} nije pronadjena.");

            var igracRezervacija = rezervacija.RezervacijaIgraci
                .FirstOrDefault(ri => ri.IgracId == dto.IgracId);

            if (igracRezervacija == null)
                throw new KeyNotFoundException("Igrac nije pridruzen ovoj rezervaciji.");

            bool jeBioGlavni = rezervacija.GlavniIgracId == dto.IgracId;

            _context.RezervacijaIgraci.Remove(igracRezervacija);

            if (jeBioGlavni)
            {
                var sledeci = rezervacija.RezervacijaIgraci
                    .Where(ri => ri.IgracId != dto.IgracId && ri.Status == IgracStatus.Prihvacen)
                    .OrderBy(ri => ri.CreatedAt)
                    .FirstOrDefault();

                if (sledeci != null)
                {
                    rezervacija.GlavniIgracId = sledeci.IgracId;
                }
                else
                {
                    rezervacija.Status = RezervacijaStatus.Otkazana;
                    if (rezervacija.Termin != null)
                        rezervacija.Termin.Status = TerminStatus.Slobodan;
                }
            }

            _context.SaveChanges();
        }
    }
}
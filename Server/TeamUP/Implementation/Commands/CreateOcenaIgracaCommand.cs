using System;
using System.Collections.Generic;
using System.Linq;
using ApplicationLayer.DTO;
using ApplicationLayer.UseCases.Commands;
using DataAccessLayer;
using DomainLayer.Entities;
using Microsoft.EntityFrameworkCore;
namespace Implementation.Commands
{
    public class CreateOcenaIgracaCommand : ICreateOcenaIgracaCommand
    {
        private readonly TeamUpContext _context;
        public CreateOcenaIgracaCommand(TeamUpContext context)
        {
            _context = context;
        }
        public void Execute(CreateOcenaIgracaDto dto)
        {
            if (dto.OcenjeniId == dto.OcenioId)
                throw new InvalidOperationException("Ne možete oceniti sami sebe.");

            if (dto.Vrednost < 1 || dto.Vrednost > 5)
                throw new ArgumentException("Ocena mora biti između 1 i 5.");

            var postojeca = _context.OceneIgraca
                .FirstOrDefault(o => o.OcenjeniId == dto.OcenjeniId && o.OcenioId == dto.OcenioId);
            if (postojeca != null)
                throw new InvalidOperationException("Već ste ocenili ovog igrača.");

            var zavrseneRezervacije = _context.Rezervacije
                .Include(r => r.RezervacijaIgraci)
                .Where(r => r.Status == RezervacijaStatus.Zavrsena)
                .ToList();

            bool igraliZajedno = zavrseneRezervacije.Any(r =>
            {
                var ucesnici = r.RezervacijaIgraci
                    .Where(ri => ri.Status == IgracStatus.Prihvacen)
                    .Select(ri => ri.IgracId)
                    .Append(r.GlavniIgracId)
                    .ToHashSet();

                return ucesnici.Contains(dto.OcenioId) && ucesnici.Contains(dto.OcenjeniId);
            });

            if (!igraliZajedno)
                throw new InvalidOperationException("Možete oceniti samo igrače sa kojima ste igrali.");

            var ocena = new OcenaIgraca
            {
                OcenjeniId = dto.OcenjeniId,
                OcenioId = dto.OcenioId,
                Vrednost = dto.Vrednost,
                Komentar = dto.Komentar,
                DatumOcene = DateTime.UtcNow
            };
            _context.OceneIgraca.Add(ocena);
            _context.SaveChanges();
        }
    }
}
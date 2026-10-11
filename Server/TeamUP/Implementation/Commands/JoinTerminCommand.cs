using ApplicationLayer.DTO;
using ApplicationLayer.UseCases.Commands;
using DataAccessLayer;
using DomainLayer.Entities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Implementation.Commands
{
    public class JoinTerminCommand : IJoinTerminCommand
    {
        private readonly TeamUpContext _context;

        public JoinTerminCommand(TeamUpContext context)
        {
            _context = context;
        }

        public void Execute(JoinTerminDto dto)
        {
            var igrac = _context.Users.Find(dto.IgracId);
            if (igrac == null)
                throw new KeyNotFoundException($"Igrac sa ID-em {dto.IgracId} nije pronadjen.");

            var rezervacija = _context.Rezervacije.FirstOrDefault(r => r.Id == dto.RezervacijaId && r.DeletedAt == null);

            if (rezervacija == null)
                throw new KeyNotFoundException($"rezervacija sa ID-em {dto.RezervacijaId} nije pronadjena");

            if (rezervacija.Status != RezervacijaStatus.Aktivna)
                throw new InvalidOperationException("nije moguce pridruzi se neaktivnoj rezervaciji");

            var brojIgraca = _context.RezervacijaIgraci.Count(ri => ri.RezervacijaId == dto.RezervacijaId);

            if (brojIgraca >= rezervacija.MaxIgraca)
                throw new InvalidOperationException("termin je popunjen");

            var vecPridruzen = _context.RezervacijaIgraci
                .Any(ri => ri.RezervacijaId == dto.RezervacijaId && ri.IgracId == dto.IgracId);

            if (vecPridruzen)
                throw new InvalidOperationException("igrac je vec pridruzen ovoj rezervaciji");

            var igracRezervacija = new RezervacijaIgrac
            {
                RezervacijaId = dto.RezervacijaId,
                IgracId = dto.IgracId,
                Status = IgracStatus.CekaPotvrdu
            };

            _context.RezervacijaIgraci.Add(igracRezervacija);
            _context.SaveChanges();
        }
    }
}

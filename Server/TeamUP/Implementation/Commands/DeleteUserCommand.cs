using ApplicationLayer.UseCases.Commands;
using DataAccessLayer;
using DomainLayer.Entities;
using Microsoft.EntityFrameworkCore;
using System;
using System.Linq;

namespace Implementation.Commands
{
    public class DeleteUserCommand : IDeleteUserCommand
    {
        private readonly TeamUpContext _context;
        public DeleteUserCommand(TeamUpContext context)
        {
            _context = context;
        }

        public void Execute(int id)
        {
            var user = _context.Users.Find(id);
            if (user == null)
                throw new KeyNotFoundException($"Korisnik sa ID-em {id} nije pronadjen");

            var rezervacijeKaoGlavni = _context.Rezervacije
                .Include(r => r.RezervacijaIgraci)
                .Include(r => r.Termin)
                .Where(r => r.GlavniIgracId == id && r.Status == RezervacijaStatus.Aktivna)
                .ToList();

            foreach (var r in rezervacijeKaoGlavni)
            {
                var ostaliPrihvaceni = r.RezervacijaIgraci
                    .Where(ri => ri.IgracId != id && ri.Status == IgracStatus.Prihvacen)
                    .OrderBy(ri => ri.CreatedAt)
                    .ToList();

                if (ostaliPrihvaceni.Any())
                {
                    r.GlavniIgracId = ostaliPrihvaceni.First().IgracId;
                }
                else
                {
                    r.Status = RezervacijaStatus.Otkazana;
                    if (r.Termin != null)
                        r.Termin.Status = TerminStatus.Slobodan;
                }
            }

            var kaoPridruzen = _context.RezervacijaIgraci
                .Include(ri => ri.Rezervacija)
                    .ThenInclude(r => r.RezervacijaIgraci)
                .Include(ri => ri.Rezervacija)
                    .ThenInclude(r => r.Termin)
                .Where(ri => ri.IgracId == id &&
                             ri.Status != IgracStatus.Otkazao &&
                             ri.Rezervacija.Status == RezervacijaStatus.Aktivna)
                .ToList();

            foreach (var ri in kaoPridruzen)
            {
                ri.Status = IgracStatus.Otkazao;

                // proveri da li ima jos prihvacenih igraca
                var ostaliPrihvaceni = ri.Rezervacija.RezervacijaIgraci
                    .Count(x => x.IgracId != id && x.Status == IgracStatus.Prihvacen);

                var glavniJeAktivan = ri.Rezervacija.GlavniIgracId != id;

                if (ostaliPrihvaceni == 0 && glavniJeAktivan)
                {
                    // samo glavni igrac ostao — rezervacija ostaje aktivna, termin rezervisan
                }
                else if (ostaliPrihvaceni == 0 && !glavniJeAktivan)
                {
                    ri.Rezervacija.Status = RezervacijaStatus.Otkazana;
                    if (ri.Rezervacija.Termin != null)
                        ri.Rezervacija.Termin.Status = TerminStatus.Slobodan;
                }
            }
            //brisi sve objekte vlasnika (cascade: termini i rezervacije)
            var objekti = _context.Objekti
                .Include(o => o.Termini)
                .Where(o => o.VlasnikId == id && o.DeletedAt == null)
                .ToList();

            foreach (var o in objekti)
            {
                var terminiIds = o.Termini.Select(t => t.Id).ToList();

                var rezervacije = _context.Rezervacije
                    .Where(r => terminiIds.Contains(r.TerminId) && r.Status == RezervacijaStatus.Aktivna)
                    .ToList();

                foreach (var r in rezervacije)
                    r.Status = RezervacijaStatus.Otkazana;

                foreach (var t in o.Termini)
                    t.DeletedAt = DateTime.UtcNow;

                o.DeletedAt = DateTime.UtcNow;
            }

            user.DeletedAt = DateTime.UtcNow;
            _context.SaveChanges();
        }
    }
}
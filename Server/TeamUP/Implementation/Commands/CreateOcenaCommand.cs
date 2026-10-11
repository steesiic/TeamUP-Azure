using ApplicationLayer;
using ApplicationLayer.DTO;
using ApplicationLayer.UseCases.Commands;
using DataAccessLayer;
using DomainLayer.Entities;
using Microsoft.EntityFrameworkCore;

namespace Implementation.Commands
{
    public class CreateOcenaCommand : ICreateOcenaCommand
    {
        private readonly TeamUpContext _context;
        private readonly IApplicationActor _actor;

        public CreateOcenaCommand(TeamUpContext context, IApplicationActor actor)
        {
            _context = context;
            _actor = actor;
        }

        public void Execute(CreateOcenaDto dto)
        {
            //Vlasnik ne sme da ocenjuje objekte
            var actor = _context.Users
                .Include(u => u.Role)
                .FirstOrDefault(u => u.Id == _actor.Id && u.DeletedAt == null);

            if (actor == null)
                throw new UnauthorizedAccessException("Korisnik nije pronađen.");

            if (actor.Role.Naziv == "Vlasnik")
                throw new InvalidOperationException("Vlasnici ne mogu ocenjivati objekte.");

            //Igrac mora imati zavrsen termin na ovom objektu
            var imaZavrsenTermin = _context.Rezervacije
                .Include(r => r.Termin)
                .Include(r => r.RezervacijaIgraci)
                .Where(r =>
                    r.Termin.ObjekatId == dto.ObjekatId &&
                    r.Status == RezervacijaStatus.Zavrsena)
                .AsEnumerable()
                .Any(r =>
                {
                    var ucesnici = r.RezervacijaIgraci
                        .Where(ri => ri.Status == IgracStatus.Prihvacen)
                        .Select(ri => ri.IgracId)
                        .Append(r.GlavniIgracId)
                        .ToHashSet();
                    return ucesnici.Contains(dto.IgracId);
                });

            if (!imaZavrsenTermin)
                throw new InvalidOperationException(
                    "Možete oceniti samo objekte na kojima ste odigrali završen termin.");

            //provera duplikata
            var postojeca = _context.Ocene
                .FirstOrDefault(o => o.ObjekatId == dto.ObjekatId && o.IgracId == dto.IgracId);

            if (postojeca != null)
                throw new InvalidOperationException("Već ste ocenili ovaj objekat.");

            if (dto.Vrednost < 1 || dto.Vrednost > 5)
                throw new ArgumentException("Ocena mora biti između 1 i 5.");

            var ocena = new Ocena
            {
                ObjekatId = dto.ObjekatId,
                IgracId = dto.IgracId,
                Vrednost = dto.Vrednost,
                Komentar = dto.Komentar,
                DatumOcene = DateTime.UtcNow
            };

            _context.Ocene.Add(ocena);
            _context.SaveChanges();
        }
    }
}
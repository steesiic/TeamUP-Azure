using ApplicationLayer.DTO;
using ApplicationLayer.UseCases.Commands;
using DataAccessLayer;
using DomainLayer.Entities;
using Microsoft.EntityFrameworkCore;
using System.Data;

namespace Implementation.Commands
{
    public class CreateRezervacijuCommand : ICreateRezervacijuCommand
    {
        private readonly TeamUpContext _context;

        public CreateRezervacijuCommand(TeamUpContext context)
        {
            _context = context;
        }

        public void Execute(CreateRezervacijuDto dto)
        {
            using var transaction = _context.Database.BeginTransaction(IsolationLevel.Serializable);
            try
            {
                var termin = _context.Termini.Find(dto.TerminId);
                if (termin == null)
                    throw new KeyNotFoundException($"Termin sa ID-em {dto.TerminId} nije pronadjen.");

                if (termin.Status != TerminStatus.Slobodan)
                    throw new InvalidOperationException("Termin nije slobodan za rezervaciju.");

                var preklapanje = _context.Rezervacije
                    .Include(r => r.Termin)
                    .Any(r => r.GlavniIgracId == dto.GlavniIgracId
                        && r.Status == RezervacijaStatus.Aktivna
                        && r.Termin.Datum.Date == termin.Datum.Date
                        && r.Termin.VremeOd < termin.VremeDo
                        && r.Termin.VremeDo > termin.VremeOd);

                if (preklapanje)
                    throw new InvalidOperationException("Već imate rezervaciju koja se preklapa sa ovim terminom.");

                var rezervacija = new Rezervacija
                {
                    TerminId = dto.TerminId,
                    GlavniIgracId = dto.GlavniIgracId,
                    DatumRezervacije = DateTime.UtcNow,
                    MinIgraca = dto.MinIgraca,
                    MaxIgraca = dto.MaxIgraca,
                    Status = RezervacijaStatus.Aktivna,
                    SportId = dto.SportId,
                };

                termin.Status = TerminStatus.Rezervisan;
                _context.Rezervacije.Add(rezervacija);
                _context.SaveChanges();

                _context.RezervacijaIgraci.Add(new RezervacijaIgrac
                {
                    RezervacijaId = rezervacija.Id,
                    IgracId = dto.GlavniIgracId,
                    Status = IgracStatus.Prihvacen
                });
                _context.SaveChanges();

                transaction.Commit();
            }
            catch
            {
                transaction.Rollback();
                throw;
            }
        }
    }
}
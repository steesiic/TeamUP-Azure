using ApplicationLayer.DTO;
using ApplicationLayer.UseCases.Queries;
using DataAccessLayer;
using DomainLayer.Entities;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Implementation.Queries
{
    public class GetRezervacijuQuery : IGetRezervacijuQuery
    {
        private readonly TeamUpContext _context;

        public GetRezervacijuQuery(TeamUpContext context)
        {
            _context = context;
        }

        public RezervacijaDto Execute(int id)
        {
            var r = _context.Rezervacije
                .Include(r => r.GlavniIgrac)
                .Include(r => r.Sport)
                .Include(r => r.Termin).ThenInclude(t => t.Objekat)
                .Include(r => r.Termin).ThenInclude(t => t.Sport)
                .Include(r => r.RezervacijaIgraci).ThenInclude(ri => ri.Igrac)
                .FirstOrDefault(r => r.Id == id && r.DeletedAt == null);

            if (r == null)
                throw new KeyNotFoundException($"Rezervacija sa ID-em {id} nije pronadjena.");

            if (r.Termin != null && r.Status == RezervacijaStatus.Aktivna)
            {
                var sada = DateTime.Now;
                var krajTermina = r.Termin.Datum.Date.Add(r.Termin.VremeDo.ToTimeSpan());
                if (krajTermina < sada)
                {
                    r.Status = RezervacijaStatus.Zavrsena;
                    _context.SaveChanges();
                }
            }

            return new RezervacijaDto
            {
                Id = r.Id,
                GlavniIgracId = r.GlavniIgracId,
                GlavniIgracIme = r.GlavniIgrac?.Ime,
                GlavniIgracPrezime = r.GlavniIgrac?.Prezime,
                SportId = r.SportId,
                SportNaziv = r.Sport != null ? r.Sport.Naziv : null,
                DatumRezervacije = r.DatumRezervacije,
                MinIgraca = r.MinIgraca,
                MaxIgraca = r.MaxIgraca,
                Status = r.Status.ToString(),
                Termin = r.Termin == null ? null : new TerminDto
                {
                    Id = r.Termin.Id,
                    ObjekatNaziv = r.Termin.Objekat?.Naziv,
                    SportNaziv = r.Termin.Sport?.Naziv,
                    Datum = r.Termin.Datum,
                    VremeOd = r.Termin.VremeOd,
                    VremeDo = r.Termin.VremeDo,
                    Cena = r.Termin.Cena,
                    Status = r.Termin.Status.ToString()
                },
                Igraci = r.RezervacijaIgraci.Select(ri => new RezervacijaIgracDto
                {
                    Id = ri.Id,
                    IgracId = ri.IgracId,
                    IgracIme = ri.Igrac?.Ime,
                    IgracPrezime = ri.Igrac?.Prezime,
                    Status = ri.Status.ToString()
                }).ToList()
            };
        }
    }
}
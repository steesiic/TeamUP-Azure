using ApplicationLayer;
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
    public class GetRezervacijeQuery : IGetRezervacijeQuery
    {
        private readonly TeamUpContext _context;

        public GetRezervacijeQuery(TeamUpContext context)
        {
            _context = context;
        }

        public PagedResult<RezervacijaDto> Execute(RezervacijaSearch search)
        {
            var query = _context.Rezervacije
                .Include(r => r.GlavniIgrac)
                .Include(r => r.Termin).ThenInclude(t => t.Objekat)
                .Include(r => r.Termin).ThenInclude(t => t.Sport)
                .Include(r => r.RezervacijaIgraci).ThenInclude(ri => ri.Igrac)
                .Include(r => r.Sport)
                .Where(r => r.DeletedAt == null)
                .AsQueryable();

            if (search.GlavniIgracId.HasValue)
                query = query.Where(r => r.GlavniIgracId == search.GlavniIgracId);
            if (search.TerminId.HasValue)
                query = query.Where(r => r.TerminId == search.TerminId);
            if (!string.IsNullOrEmpty(search.Status))
                query = query.Where(r => r.Status.ToString() == search.Status);
            if (search.IgracId.HasValue)
                query = query.Where(r => r.RezervacijaIgraci
                    .Any(ri => ri.IgracId == search.IgracId && ri.Status != IgracStatus.Otkazao));

            var totalCount = query.Count();

            var entiteti = query
                .Skip((search.Page - 1) * search.PerPage)
                .Take(search.PerPage)
                .ToList();

            var sada = DateTime.Now;
            bool izmenjeno = false;
            foreach (var r in entiteti)
            {
                if (r.Termin == null) continue;
                if (r.Status == RezervacijaStatus.Aktivna
                    && r.Termin.Datum.Date.Add(r.Termin.VremeDo.ToTimeSpan()) < sada)
                {
                    r.Status = RezervacijaStatus.Zavrsena;
                    izmenjeno = true;
                }
            }
            if (izmenjeno)
                _context.SaveChanges();

            var data = entiteti.Select(r => new RezervacijaDto
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
            }).ToList();

            return new PagedResult<RezervacijaDto>
            {
                Data = data,
                CurrentPage = search.Page,
                PerPage = search.PerPage,
                TotalCount = totalCount
            };
        }
    }
}
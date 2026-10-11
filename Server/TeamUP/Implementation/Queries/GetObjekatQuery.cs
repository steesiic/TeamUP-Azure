using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using ApplicationLayer.DTO;
using ApplicationLayer.UseCases.Queries;
using DataAccessLayer;
using Microsoft.EntityFrameworkCore;

namespace Implementation.Queries
{
    public class GetObjekatQuery : IGetObjekatQuery
    {
        private readonly TeamUpContext _context;

        public GetObjekatQuery(TeamUpContext context)
        {
            _context = context;
        }

        public ObjekatDto Execute(int id)
        {
            var objekat = _context.Objekti
                .Include(o => o.Vlasnik)
                .Include(o => o.ObjekatSportovi)
                    .ThenInclude(os => os.Sport)
                .FirstOrDefault(o => o.Id == id && o.DeletedAt == null);

            if (objekat == null)
                throw new KeyNotFoundException($"Objekat sa ID-em {id} nije pronadjen.");

            return new ObjekatDto
            {
                Id = objekat.Id,
                Naziv = objekat.Naziv,
                Adresa = objekat.Adresa,
                Opis = objekat.Opis,
                SlikaUrl = objekat.SlikaUrl,
                VlasnikId = objekat.VlasnikId,
                VlasnikIme = objekat.Vlasnik.Ime,
                VlasnikPrezime = objekat.Vlasnik.Prezime,
                Sportovi = objekat.ObjekatSportovi.Select(os => os.Sport.Naziv).ToList(),
                ProsecnaCena = (decimal?)_context.Termini
                    .Where(t => t.ObjekatId == objekat.Id && t.DeletedAt == null)
                    .Average(t => (double?)t.Cena),
                ProsecnaOcena = (double?)_context.Ocene
                    .Where(oc => oc.ObjekatId == objekat.Id)
                    .Average(oc => (double?)oc.Vrednost)
            };
        }
    }
}

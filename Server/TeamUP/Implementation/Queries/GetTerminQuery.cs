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
    public class GetTerminQuery : IGetTerminQuery
    {
        private readonly TeamUpContext _context;

        public GetTerminQuery(TeamUpContext context)
        {
            _context = context;
        }

        public TerminDto Execute(int id)
        {
            var termin = _context.Termini
                .Include(t => t.Objekat)
                .Include(t => t.Sport)
                .FirstOrDefault(t => t.Id == id);

            if (termin == null)
                throw new KeyNotFoundException($"Termin sa ID-em {id} nije pronadjen.");

            return new TerminDto
            {
                Id = termin.Id,
                ObjekatNaziv = termin.Objekat.Naziv,
                SportNaziv = termin.Sport.Naziv,
                Datum = termin.Datum,
                VremeOd = termin.VremeOd,
                VremeDo = termin.VremeDo,
                Cena = termin.Cena,
                Status = termin.Status.ToString()
            };
        }
    }
}
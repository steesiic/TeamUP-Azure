using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using ApplicationLayer.DTO;
using ApplicationLayer.UseCases.Commands;
using DataAccessLayer;
using DomainLayer.Entities;

namespace Implementation.Commands
{
    public class CreateTerminCommand : ICreateTerminCommand
    {
        private readonly TeamUpContext _context;

        public CreateTerminCommand(TeamUpContext context)
        {
            _context = context;
        }

        public void Execute(CreateTerminDto dto)
        {
            var datumDeo = dto.Datum.Date;
            var pocetakTermina = datumDeo.Add(dto.VremeOd.ToTimeSpan());

            if (pocetakTermina < DateTime.UtcNow)
                throw new InvalidOperationException("Ne možete kreirati termin u prošlosti.");

            var termin = new Termin
            {
                ObjekatId = dto.ObjekatId,
                SportId = dto.SportId,
                Datum = dto.Datum,
                VremeOd = dto.VremeOd,
                VremeDo = dto.VremeDo,
                Cena = dto.Cena,
                Status = TerminStatus.Slobodan
            };

            _context.Termini.Add(termin);
            _context.SaveChanges();
        }
    }
}
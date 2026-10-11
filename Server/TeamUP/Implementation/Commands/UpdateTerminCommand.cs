using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using ApplicationLayer.DTO;
using ApplicationLayer.UseCases.Commands;
using DataAccessLayer;

namespace Implementation.Commands
{
    public class UpdateTerminCommand : IUpdateTerminCommand
    {
        private readonly TeamUpContext _context;

        public UpdateTerminCommand(TeamUpContext context)
        {
            _context = context;
        }

        public void Execute(UpdateTerminDto dto)
        {
            var termin = _context.Termini.Find(dto.Id);

            if (termin == null)
                throw new KeyNotFoundException($"Termin sa ID-em {dto.Id} nije pronadjen.");

            if (termin.Status != DomainLayer.Entities.TerminStatus.Slobodan)
                throw new InvalidOperationException("Nije moguće izmeniti termin koji nije slobodan.");

            if (dto.Datum != null)
                termin.Datum = dto.Datum.Value;

            if (dto.VremeOd != null)
                termin.VremeOd = TimeOnly.Parse(dto.VremeOd);
            if (dto.VremeDo != null)
                termin.VremeDo = TimeOnly.Parse(dto.VremeDo);

            if (dto.Cena != null)
                termin.Cena = dto.Cena.Value;

            _context.SaveChanges();
        }
    }
}

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
    public class UpdateIgracStatusCommand : IUpdateIgracStatusCommand
    {
        private readonly TeamUpContext _context;

        public UpdateIgracStatusCommand(TeamUpContext context)
        {
            _context = context;
        }

        public void Execute(UpdateIgracStatusDto dto)
        {
            var igracRezervacija = _context.RezervacijaIgraci
                .FirstOrDefault(ri => ri.RezervacijaId == dto.RezervacijaId
                                   && ri.IgracId == dto.IgracId);

            if (igracRezervacija == null)
                throw new KeyNotFoundException("igrac nije pridruzen ovoj rezervaciji");

            if (!Enum.TryParse<IgracStatus>(dto.Status, out var noviStatus))
                throw new InvalidOperationException($"status '{dto.Status}' nije validan");

            igracRezervacija.Status = noviStatus;
            _context.SaveChanges();
        }
    }
}

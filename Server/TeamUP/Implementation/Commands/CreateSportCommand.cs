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
    public class CreateSportCommand : ICreateSportCommand
    {
        private readonly TeamUpContext _context;

        public CreateSportCommand(TeamUpContext context)
        {
            _context = context;
        }

        public void Execute(CreateSportDto dto)
        {
            if (_context.Sportovi.Any(s => s.Naziv == dto.Naziv))
                throw new InvalidOperationException($"Sport '{dto.Naziv}' već postoji.");

            var sport = new Sport
            {
                Naziv = dto.Naziv
            };

            _context.Sportovi.Add(sport);
            _context.SaveChanges();
        }
    }
}
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
    public class CreateObjekatCommand : ICreateObjekatCommand
    {
        private readonly TeamUpContext _context;

        public CreateObjekatCommand(TeamUpContext context)
        {
            _context = context;
        }

        public int Execute(CreateObjekatDto dto, int vlasnikId)
        {
            var postoji = _context.Objekti
                .Any(o => o.VlasnikId == vlasnikId
                       && o.Naziv.ToLower() == dto.Naziv.ToLower()
                       && o.DeletedAt == null);
            if (postoji)
                throw new InvalidOperationException("Vec imate objekat sa ovim nazivom!");

            var objekat = new Objekat
            {
                Naziv = dto.Naziv,
                Adresa = dto.Adresa,
                Opis = dto.Opis,
                SlikaUrl = dto.SlikaUrl,
                VlasnikId = vlasnikId
            };
            foreach (var sportId in dto.SportIds)
                objekat.ObjekatSportovi.Add(new ObjekatSport { SportId = sportId });
            _context.Objekti.Add(objekat);
            _context.SaveChanges();
            return objekat.Id;
        }
    }
}

using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using ApplicationLayer.DTO;
using ApplicationLayer.UseCases.Commands;
using DataAccessLayer;
using DomainLayer.Entities;
using Microsoft.EntityFrameworkCore;

namespace Implementation.Commands
{
    public class UpdateObjekatCommand : IUpdateObjekatCommand
    {
        private readonly TeamUpContext _context;

        public UpdateObjekatCommand(TeamUpContext context)
        {
            _context = context;
        }

        public void Execute(UpdateObjekatDto dto)
        {
            var objekat = _context.Objekti
                .Include(o => o.ObjekatSportovi)
                .FirstOrDefault(o => o.Id == dto.Id);
            if (objekat == null)
                throw new KeyNotFoundException($"Objekat sa ID-em {dto.Id} nije pronadjen.");

            if (dto.Naziv != null)
            {
                var postoji = _context.Objekti
                    .Any(o => o.Id != dto.Id
                           && o.VlasnikId == objekat.VlasnikId
                           && o.Naziv.ToLower() == dto.Naziv.ToLower()
                           && o.DeletedAt == null);
                if (postoji)
                    throw new InvalidOperationException("Vec imate objekat sa ovim nazivom!");

                objekat.Naziv = dto.Naziv;
            }

            if (dto.Adresa != null)
                objekat.Adresa = dto.Adresa;
            if (dto.Opis != null)
                objekat.Opis = dto.Opis;
            if (dto.SlikaUrl != null)
                objekat.SlikaUrl = dto.SlikaUrl;
            if (dto.SportIds != null)
            {
                objekat.ObjekatSportovi.Clear();
                foreach (var sportId in dto.SportIds)
                {
                    objekat.ObjekatSportovi.Add(new ObjekatSport
                    {
                        ObjekatId = objekat.Id,
                        SportId = sportId
                    });
                }
            }
            _context.SaveChanges();
        }
    }
}
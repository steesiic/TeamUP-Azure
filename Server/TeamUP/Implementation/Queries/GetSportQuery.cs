using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using ApplicationLayer.DTO;
using ApplicationLayer.UseCases.Queries;
using DataAccessLayer;

namespace Implementation.Queries
{
    public class GetSportQuery : IGetSportQuery
    {
        private readonly TeamUpContext _context;

        public GetSportQuery(TeamUpContext context)
        {
            _context = context;
        }

        public SportDto Execute(int id)
        {
            var sport = _context.Sportovi.Find(id);

            if (sport == null)
                throw new KeyNotFoundException($"Sport sa ID-em {id} nije pronadjen.");

            return new SportDto
            {
                Id = sport.Id,
                Naziv = sport.Naziv
            };
        }
    }
}

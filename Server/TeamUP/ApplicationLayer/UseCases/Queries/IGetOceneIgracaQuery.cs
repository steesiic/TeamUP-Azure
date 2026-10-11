using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using ApplicationLayer.DTO;

namespace ApplicationLayer.UseCases.Queries
{
    public interface IGetOceneIgracaQuery
    {
        List<OcenaIgracaDto> Execute(int ocenjeniId);
    }
}

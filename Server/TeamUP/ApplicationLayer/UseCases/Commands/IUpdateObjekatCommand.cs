using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using ApplicationLayer.DTO;

namespace ApplicationLayer.UseCases.Commands
{
    public interface IUpdateObjekatCommand : ICommandHandler<UpdateObjekatDto> { }
}

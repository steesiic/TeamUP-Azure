using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace ApplicationLayer.UseCases.Commands
{
    public interface IDeleteRezervacijuCommand : ICommandHandler<int> { }
}

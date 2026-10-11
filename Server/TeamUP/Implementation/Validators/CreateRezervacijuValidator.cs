using ApplicationLayer.DTO;
using FluentValidation;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Implementation.Validators
{
    public class CreateRezervacijuValidator : AbstractValidator<CreateRezervacijuDto>
    {
        public CreateRezervacijuValidator()
        {
            RuleFor(x => x.TerminId)
                .GreaterThan(0).WithMessage("TerminId mora biti validan.");

            RuleFor(x => x.GlavniIgracId)
                .GreaterThan(0).WithMessage("GlavniIgracId mora biti validan.");

            RuleFor(x => x.MinIgraca)
                .GreaterThan(0).WithMessage("Minimalan broj igraca mora biti veci od 0.")
                .LessThanOrEqualTo(x => x.MaxIgraca).WithMessage("Minimalan broj igraca ne sme biti veci od maksimalnog.");

            RuleFor(x => x.MaxIgraca)
                .GreaterThan(0).WithMessage("Maksimalan broj igraca mora biti veci od 0.")
                .LessThanOrEqualTo(22).WithMessage("Maksimalan broj igraca ne sme biti veci od 22.");
        }
    }
}

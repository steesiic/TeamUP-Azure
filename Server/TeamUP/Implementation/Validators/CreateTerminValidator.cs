using ApplicationLayer.DTO;
using FluentValidation;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Implementation.Validators
{
    public class CreateTerminValidator : AbstractValidator<CreateTerminDto>
    {
        public CreateTerminValidator()
        {
            RuleFor(x => x.ObjekatId)
                .GreaterThan(0).WithMessage("ObjekatId mora biti validan.");

            RuleFor(x => x.SportId)
                .GreaterThan(0).WithMessage("SportId mora biti validan.");

            RuleFor(x => x.Datum)
            .GreaterThanOrEqualTo(DateTime.UtcNow.Date).WithMessage("Datum termina mora biti danas ili u buducnosti.");

            RuleFor(x => x.VremeOd)
                .NotEmpty().WithMessage("Vreme pocetka je obavezno.");

            RuleFor(x => x.VremeDo)
                .NotEmpty().WithMessage("Vreme zavrsetka je obavezno.")
                .GreaterThan(x => x.VremeOd).WithMessage("Vreme zavrsetka mora biti posle vremena pocetka.");

            RuleFor(x => x.Cena)
                .GreaterThan(0).WithMessage("Cena mora biti veca od 0.");
        }
    }
}

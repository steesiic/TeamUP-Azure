using ApplicationLayer.DTO;
using FluentValidation;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Implementation.Validators
{
    public class UpdateTerminValidator : AbstractValidator<UpdateTerminDto>
    {
        public UpdateTerminValidator()
        {
            RuleFor(x => x.Datum)
                .GreaterThanOrEqualTo(DateTime.UtcNow.Date)
                .WithMessage("Datum termina mora biti u buducnosti.")
                .When(x => x.Datum != null);

            RuleFor(x => x.VremeDo)
                .Must((dto, vremeDo) => string.Compare(vremeDo, dto.VremeOd, StringComparison.Ordinal) > 0)
                .WithMessage("Vreme zavrsetka mora biti posle vremena pocetka.")
                .When(x => x.VremeOd != null && x.VremeDo != null);

            RuleFor(x => x.Cena)
                .GreaterThan(0).WithMessage("Cena mora biti veca od 0.")
                .When(x => x.Cena != null);
        }
    }
}

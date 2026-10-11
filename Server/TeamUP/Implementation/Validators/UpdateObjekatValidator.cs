using ApplicationLayer.DTO;
using FluentValidation;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Implementation.Validators
{
    public class UpdateObjekatValidator : AbstractValidator<UpdateObjekatDto>
    {
        public UpdateObjekatValidator()
        {
            RuleFor(x => x.Naziv)
                .MaximumLength(200).WithMessage("Naziv ne sme biti duzi od 200 karaktera.")
                .When(x => x.Naziv != null);

            RuleFor(x => x.Adresa)
                .MaximumLength(300).WithMessage("Adresa ne sme biti duza od 300 karaktera.")
                .When(x => x.Adresa != null);

            RuleFor(x => x.Opis)
                .MaximumLength(1000).WithMessage("Opis ne sme biti duzi od 1000 karaktera.")
                .When(x => x.Opis != null);

            RuleFor(x => x.SportIds)
                .Must(ids => ids.All(id => id > 0)).WithMessage("Svi SportId-evi moraju biti validni.")
                .When(x => x.SportIds != null && x.SportIds.Any());
        }
    }
}

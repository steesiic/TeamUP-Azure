using ApplicationLayer.DTO;
using DataAccessLayer;
using FluentValidation;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Implementation.Validators
{
    public class CreateObjekatValidator : AbstractValidator<CreateObjekatDto>
    {
        public CreateObjekatValidator(TeamUpContext context)
        {
            RuleFor(x => x.Naziv)
                .NotEmpty().WithMessage("Naziv je obavezan.")
                .MaximumLength(200).WithMessage("Naziv ne sme biti duzi od 200 karaktera.");

            RuleFor(x => x.Adresa)
                .NotEmpty().WithMessage("Adresa je obavezna.")
                .MaximumLength(300).WithMessage("Adresa ne sme biti duza od 300 karaktera.");

            RuleFor(x => x.Opis)
                .MaximumLength(1000).WithMessage("Opis ne sme biti duzi od 1000 karaktera.");

            RuleFor(x => x.SportIds)
                .NotEmpty().WithMessage("Morate izabrati bar jedan sport.")
                .Must(ids => ids.All(id => id > 0)).WithMessage("Svi SportId-evi moraju biti validni.")
                .Must(ids => ids.All(id => context.Sportovi.Any(s => s.Id == id)))
                .WithMessage("Jedan ili vise sportova ne postoji u bazi.");
        }
    }
}

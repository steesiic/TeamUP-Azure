using ApplicationLayer.DTO;
using FluentValidation;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Implementation.Validators
{
    public class UpdateUserValidator : AbstractValidator<UpdateUserDto>
    {
        public UpdateUserValidator()
        {
            RuleFor(x => x.Ime)
                .MaximumLength(100).WithMessage("Ime ne sme biti duze od 100 karaktera.")
                .When(x => x.Ime != null);

            RuleFor(x => x.Prezime)
                .MaximumLength(100).WithMessage("Prezime ne sme biti duze od 100 karaktera.")
                .When(x => x.Prezime != null);

            RuleFor(x => x.Pol)
                .Must(p => p == 'M' || p == 'Z').WithMessage("Pol mora biti 'M' ili 'Z'.")
                .When(x => x.Pol != null);

            RuleFor(x => x.NovaLozinka)
               .MinimumLength(8).WithMessage("Nova lozinka mora imati najmanje 8 karaktera.")
               .When(x => x.NovaLozinka != null);
        }
    }
}

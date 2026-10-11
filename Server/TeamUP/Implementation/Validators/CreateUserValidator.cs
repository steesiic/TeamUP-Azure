using ApplicationLayer.DTO;
using FluentValidation;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Implementation.Validators
{
    public class CreateUserValidator : AbstractValidator<CreateUserDto>
    {
        public CreateUserValidator()
        {
            RuleFor(x => x.Ime)
                .NotEmpty().WithMessage("Ime je obavezno.")
                .MaximumLength(100).WithMessage("Ime ne sme biti duze od 100 karaktera.");

            RuleFor(x => x.Prezime)
                .NotEmpty().WithMessage("Prezime je obavezno.")
                .MaximumLength(100).WithMessage("Prezime ne sme biti duze od 100 karaktera.");

            RuleFor(x => x.Email)
                .NotEmpty().WithMessage("Email je obavezan.")
                .EmailAddress().WithMessage("Email nije validan.")
                .MaximumLength(200).WithMessage("Email ne sme biti duzi od 200 karaktera.");

            RuleFor(x => x.Password)
                .NotEmpty().WithMessage("Lozinka je obavezna.")
                .MinimumLength(6).WithMessage("Lozinka mora imati najmanje 6 karaktera.");

            RuleFor(x => x.Pol)
                .Must(p => p == 'M' || p == 'Z').WithMessage("Pol mora biti 'M' ili 'Z'.");

            RuleFor(x => x.RoleId)
                .GreaterThan(0).WithMessage("RoleId mora biti validan.");
        }
    }
}

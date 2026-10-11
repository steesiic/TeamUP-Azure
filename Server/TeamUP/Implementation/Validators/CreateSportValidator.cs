using ApplicationLayer.DTO;
using FluentValidation;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Implementation.Validators
{
    public class CreateSportValidator : AbstractValidator<CreateSportDto>
    {
        public CreateSportValidator()
        {
            RuleFor(x => x.Naziv)
                .NotEmpty().WithMessage("Naziv sporta je obavezan.")
                .MaximumLength(100).WithMessage("Naziv ne sme biti duzi od 100 karaktera.");
        }
    }
}

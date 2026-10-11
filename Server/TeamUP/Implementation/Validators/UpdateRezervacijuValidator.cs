using ApplicationLayer.DTO;
using FluentValidation;
using DomainLayer.Entities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Implementation.Validators
{
    public class UpdateRezervacijuValidator : AbstractValidator<UpdateRezervacijuDto>
    {
        public UpdateRezervacijuValidator()
        {
            RuleFor(x => x.Status)
                .NotEmpty().WithMessage("Status je obavezan.")
                .Must(s => Enum.TryParse<RezervacijaStatus>(s, out _))
                .WithMessage("Status mora biti: Aktivna, Zavrsena ili Otkazana.");
        }
    }
}

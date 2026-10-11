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
    public class UpdateIgracStatusValidator : AbstractValidator<UpdateIgracStatusDto>
    {
        public UpdateIgracStatusValidator()
        {
            RuleFor(x => x.IgracId)
                .GreaterThan(0).WithMessage("IgracId mora biti validan.");

            RuleFor(x => x.Status)
                .NotEmpty().WithMessage("Status je obavezan.")
                .Must(s => Enum.TryParse<IgracStatus>(s, out _))
                .WithMessage("Status mora biti: CekaPotvrdu, Prihvacen ili Otkazao.");
        }
    }
}

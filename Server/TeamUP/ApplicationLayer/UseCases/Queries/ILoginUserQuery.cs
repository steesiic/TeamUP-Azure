using ApplicationLayer.DTO;

namespace ApplicationLayer.UseCases.Queries
{
    public interface ILoginUserQuery : IQueryHandler<LoginDto, string> { }
}

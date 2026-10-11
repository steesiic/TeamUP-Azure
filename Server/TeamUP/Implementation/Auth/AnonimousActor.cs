using ApplicationLayer;
using ApplicationLayer.UseCases;

namespace Implementation.Auth
{
    public class AnonimousActor : IApplicationActor
    {
        public int Id => 0;
        public string Identity => "Anonymous";
        public IEnumerable<int> AllowedUseCases => new[] { (int)UseCases.Login };
    }
}

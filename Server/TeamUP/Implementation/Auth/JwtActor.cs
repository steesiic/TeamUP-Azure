using ApplicationLayer;

namespace Implementation.Auth
{
    public class JwtActor : IApplicationActor
    {
        public int Id { get; set; }
        public string Identity { get; set; } = string.Empty;
        public IEnumerable<int> AllowedUseCases { get; set; } = Enumerable.Empty<int>();
    }
}

namespace ApplicationLayer
{
    public interface ITokenStorage
    {
        string Create(IApplicationActor actor);
    }
}

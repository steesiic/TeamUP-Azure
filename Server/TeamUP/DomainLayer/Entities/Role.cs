using System.Collections.Generic;
namespace DomainLayer.Entities
{
    public class Role : Entity
    {
        public string Naziv { get; set; }

        public ICollection<User> Users { get; set; } = new HashSet<User>();
    }
}
using DomainLayer.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace DataAccessLayer.Configurations
{
    public class RoleConfiguration : IEntityTypeConfiguration<Role>
    {
        public void Configure(EntityTypeBuilder<Role> builder)
        {
            builder.HasKey(r => r.Id);

            builder.Property(r => r.Naziv)
                .IsRequired()
                .HasMaxLength(50);

            //seed podaci - role moraju da postoje unapred
            builder.HasData(
                new Role { Id = 1, Naziv = "Admin" },
                new Role { Id = 2, Naziv = "Igrac" },
                new Role { Id = 3, Naziv = "Vlasnik" }
            );
        }
    }
}
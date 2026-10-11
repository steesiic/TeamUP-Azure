using DomainLayer.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace DataAccessLayer.Configurations
{
    public class UserConfiguration : IEntityTypeConfiguration<User>
    {
        public void Configure(EntityTypeBuilder<User> builder)
        {
            builder.HasKey(u => u.Id);

            builder.Property(u => u.Ime).IsRequired().HasMaxLength(100);
            builder.Property(u => u.Prezime).IsRequired().HasMaxLength(100);
            builder.Property(u => u.Email).IsRequired().HasMaxLength(200);
            builder.Property(u => u.PasswordHash).IsRequired();
            builder.Property(u => u.Telefon).HasMaxLength(20);
            builder.Property(u => u.Pol).IsRequired(); //'M'/'Z'
            builder.Property(u => u.SlikaUrl).HasMaxLength(500);

            //email mora biti jedinstven
            builder.HasIndex(u => u.Email).IsUnique();

            //veza sa Role (jedan Role -> vise Users)
            builder.HasOne(u => u.Role)
                .WithMany(r => r.Users)
                .HasForeignKey(u => u.RoleId)
                .OnDelete(DeleteBehavior.Restrict); //ne brisi Role ako ima Users
        }
    }
}
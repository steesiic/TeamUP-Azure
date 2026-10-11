using DomainLayer.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace DataAccessLayer.Configurations
{
    public class ObjekatConfiguration : IEntityTypeConfiguration<Objekat>
    {
        public void Configure(EntityTypeBuilder<Objekat> builder)
        {
            builder.HasKey(o => o.Id);

            builder.Property(o => o.Naziv).IsRequired().HasMaxLength(200);
            builder.Property(o => o.Adresa).IsRequired().HasMaxLength(300);
            builder.Property(o => o.Opis).HasMaxLength(1000);

            //veza sa Vlasnikom(User)
            builder.HasOne(o => o.Vlasnik)
                .WithMany(u => u.Objekti)
                .HasForeignKey(o => o.VlasnikId)
                .OnDelete(DeleteBehavior.Restrict);
        }
    }
}
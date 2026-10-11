using DomainLayer.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace DataAccessLayer.Configurations
{
    public class RezervacijaIgracConfiguration : IEntityTypeConfiguration<RezervacijaIgrac>
    {
        public void Configure(EntityTypeBuilder<RezervacijaIgrac> builder)
        {
            builder.HasKey(ri => ri.Id);

            builder.Property(ri => ri.Status)
                .HasConversion<string>()
                .IsRequired();

            builder.HasOne(ri => ri.Rezervacija)
                .WithMany(r => r.RezervacijaIgraci)
                .HasForeignKey(ri => ri.RezervacijaId)
                .OnDelete(DeleteBehavior.Cascade);

            //Restrict jer SQLite ne voli vise cascade puteva ka istoj tabeli
            builder.HasOne(ri => ri.Igrac)
                .WithMany(u => u.RezervacijeIgraci)
                .HasForeignKey(ri => ri.IgracId)
                .OnDelete(DeleteBehavior.Restrict);
        }
    }
}
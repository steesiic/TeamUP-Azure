using DomainLayer.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace DataAccessLayer.Configurations
{
    public class RezervacijaConfiguration : IEntityTypeConfiguration<Rezervacija>
    {
        public void Configure(EntityTypeBuilder<Rezervacija> builder)
        {
            builder.HasKey(r => r.Id);

            builder.Property(r => r.Status)
                .HasConversion<string>()
                .IsRequired();

            //1 termin -> 1 rezervacija (one-to-one)
            builder.HasOne(r => r.Termin)
                .WithOne(t => t.Rezervacija)
                .HasForeignKey<Rezervacija>(r => r.TerminId)
                .OnDelete(DeleteBehavior.Cascade);

            //GlavniIgrac - mora biti Restrict jer EF ne moze vise cascade puteva ka User
            builder.HasOne(r => r.GlavniIgrac)
                .WithMany(u => u.Rezervacije)
                .HasForeignKey(r => r.GlavniIgracId)
                .OnDelete(DeleteBehavior.Restrict);
        }
    }
}
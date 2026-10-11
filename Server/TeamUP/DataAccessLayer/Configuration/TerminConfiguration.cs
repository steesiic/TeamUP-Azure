using DomainLayer.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace DataAccessLayer.Configurations
{
    public class TerminConfiguration : IEntityTypeConfiguration<Termin>
    {
        public void Configure(EntityTypeBuilder<Termin> builder)
        {
            builder.HasKey(t => t.Id);

            builder.Property(t => t.Cena).HasPrecision(10, 2);
            builder.Property(t => t.Status)
                .HasConversion<string>() //u bazi cuva "Slobodan","Rezervisan"...
                .IsRequired();

            builder.HasOne(t => t.Objekat)
                .WithMany(o => o.Termini)
                .HasForeignKey(t => t.ObjekatId)
                .OnDelete(DeleteBehavior.Cascade);

            builder.HasOne(t => t.Sport)
                .WithMany(s => s.Termini)
                .HasForeignKey(t => t.SportId)
                .OnDelete(DeleteBehavior.Restrict);
        }
    }
}
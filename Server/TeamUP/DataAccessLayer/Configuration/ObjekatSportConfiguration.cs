using DomainLayer.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace DataAccessLayer.Configurations
{
    public class ObjekatSportConfiguration : IEntityTypeConfiguration<ObjekatSport>
    {
        public void Configure(EntityTypeBuilder<ObjekatSport> builder)
        {
            //composite PK - nema poseban ID
            builder.HasKey(os => new { os.ObjekatId, os.SportId });

            builder.HasOne(os => os.Objekat)
                .WithMany(o => o.ObjekatSportovi)
                .HasForeignKey(os => os.ObjekatId)
                .OnDelete(DeleteBehavior.Cascade);

            builder.HasOne(os => os.Sport)
                .WithMany(s => s.ObjekatSportovi)
                .HasForeignKey(os => os.SportId)
                .OnDelete(DeleteBehavior.Cascade);
        }
    }
}
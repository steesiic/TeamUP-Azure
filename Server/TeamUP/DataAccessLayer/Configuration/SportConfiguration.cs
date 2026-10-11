using DomainLayer.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace DataAccessLayer.Configurations
{
    public class SportConfiguration : IEntityTypeConfiguration<Sport>
    {
        public void Configure(EntityTypeBuilder<Sport> builder)
        {
            builder.HasKey(s => s.Id);

            builder.Property(s => s.Naziv).IsRequired().HasMaxLength(100);

            builder.HasIndex(s => s.Naziv).IsUnique();
        }
    }
}
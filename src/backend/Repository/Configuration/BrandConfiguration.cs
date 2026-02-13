using Entities.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Repository.Configuration;

public class BrandConfiguration : IEntityTypeConfiguration<Brand>
{
    public void Configure(EntityTypeBuilder<Brand> builder)
    {
        builder.HasIndex(b => b.Slug).IsUnique();
        
        builder.HasData
        (
            new Brand
            {
                Id = Guid.Parse("a0c1d2e3-f4a5-4b6c-8d7e-9f0a1b2c3d4e"),
                Name = "Luxe Mane",
                Description = "A sleek, premium brand for high-end hair care, featuring elegant formulas for the modern gentleman.",
                LogoUrl = "/uploads/brands/luxe-mane.png",
                CreatedAt = new DateTime(2026, 2, 7, 18, 0, 0, DateTimeKind.Utc)
            },
            new Brand
            {
                Id = Guid.Parse("b1d2e3f4-a5b6-4c7d-8e9f-0a1b2c3d4e5f"),
                Name = "Iron Beard",
                Description = "Rugged, masculine grooming essentials designed for the perfectly maintained beard.",
                LogoUrl = "/uploads/brands/iron-beard.png",
                CreatedAt = new DateTime(2026, 2, 7, 18, 0, 0, DateTimeKind.Utc)
            }
        );
    }
}
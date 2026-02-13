using Entities.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Repository.Configuration;

public class CategoryConfiguration : IEntityTypeConfiguration<Category>
{
    public void Configure(EntityTypeBuilder<Category> builder)
    {
        builder.HasIndex(c => c.Slug).IsUnique();

        builder.HasData(
            new Category
            {
                Id = Guid.Parse("c2e3f4a5-b6c7-4d8e-9f0a-1b2c3d4e5f6a"),
                Name = "Hair Stylers",
                Description = "High-quality professional hair styling tools and equipment.",
                PictureUrl = "/uploads/categories/hair-stylers.png",
                CreatedAt = new DateTime(2026, 2, 7, 18, 0, 0, DateTimeKind.Utc),
                UpdatedAt = DateTime.MinValue
            },
            new Category
            {
                Id = Guid.Parse("d3f4a5b6-c7d8-4e9f-0a1b-2c3d4e5f6a7b"),
                Name = "Beard Oils",
                Description = "Premium nourishing oils and balms for the absolute best beard care.",
                PictureUrl = "/uploads/categories/beard-oils.png",
                CreatedAt = new DateTime(2026, 2, 7, 18, 0, 0, DateTimeKind.Utc),
                UpdatedAt = DateTime.MinValue
            },
            new Category
            {
                Id = Guid.Parse("e4a5b6c7-d8e9-4f0a-1b2c-3d4e5f6a7b8c"),
                Name = "Barber Accessories",
                Description = "Essential classic accessories and tools for traditional grooming rituals.",
                PictureUrl = "/uploads/categories/barber-accessories.png",
                CreatedAt = new DateTime(2026, 2, 7, 18, 0, 0, DateTimeKind.Utc),
                UpdatedAt = DateTime.MinValue
            }
        );
    }
}

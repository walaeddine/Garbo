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
                Id = Guid.Parse("5c60f693-befd-460e-8d59-39322f43732c"),
                Name = "Hair Care",
                Description = "Products for maintaining and styling hair.",
                CreatedAt = new DateTime(2026, 2, 4, 12, 0, 0, DateTimeKind.Utc),
                UpdatedAt = DateTime.MinValue
            },
            new Category
            {
                Id = Guid.Parse("d28888e9-2ba9-473a-a40f-e38cb54f9b35"),
                Name = "Skin Care",
                Description = "Products for skin health and beauty.",
                CreatedAt = new DateTime(2026, 2, 4, 12, 0, 0, DateTimeKind.Utc),
                UpdatedAt = DateTime.MinValue
            },
            new Category
            {
                Id = Guid.Parse("1d9e902b-270c-4389-b8a1-d4567890abcd"),
                Name = "Beard Care",
                Description = "Products for beard grooming and maintenance.",
                CreatedAt = new DateTime(2026, 2, 4, 12, 0, 0, DateTimeKind.Utc),
                UpdatedAt = DateTime.MinValue
            }
        );
    }
}

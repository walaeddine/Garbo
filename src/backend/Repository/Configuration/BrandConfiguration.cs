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
                Id = Guid.Parse("7a2c7e41-6782-4f91-8d2a-190f03225c5a"),
                Name = "Lumina Aesthetics",
                Description = "Science-backed skincare designed to enhance your natural glow with vegan formulas.",
                LogoUrl = "https://placehold.co/400x400?text=Lumina+Aesthetics",
                CreatedAt = new DateTime(2026, 2, 1, 18, 17, 14, 608, DateTimeKind.Utc).AddTicks(2350)
            },
            new Brand
            {
                Id = Guid.Parse("3d9f1028-e522-4a7b-bba1-ec6829731d14"),
                Name = "Velocity Gear",
                Description = "High-performance athletic apparel specializing in moisture-wicking fabrics for runners.",
                LogoUrl = "https://placehold.co/400x400?text=Velocity+Gear",
                CreatedAt = new DateTime(2026, 2, 1, 18, 17, 14, 608, DateTimeKind.Utc).AddTicks(2920)
            },
            new Brand
            {
                Id = Guid.Parse("c94b3a12-88ef-4c8d-905e-f7893122709e"),
                Name = "Hearth & Bean",
                Description = "Artisanal coffee roastery sourcing organic, fair-trade beans from around the globe.",
                LogoUrl = "https://placehold.co/400x400?text=Hearth+%26+Bean",
                CreatedAt = new DateTime(2026, 2, 1, 18, 17, 14, 608, DateTimeKind.Utc).AddTicks(2930)
            },
            new Brand
            {
                Id = Guid.Parse("e1b7c2d3-a4e5-4f67-8901-23456789ab01"),
                Name = "AquaVital",
                Description = "Modern, minimalist water brand committed to purity and sustainable hydration.",
                LogoUrl = "/images/brands/aquavital.png",
                CreatedAt = new DateTime(2026, 2, 3, 22, 1, 0, DateTimeKind.Utc)
            },
            new Brand
            {
                Id = Guid.Parse("e1b7c2d3-a4e5-4f67-8901-23456789ab02"),
                Name = "Zenith Electronics",
                Description = "Futuristic electronics brand pushing the boundaries of technical innovation.",
                LogoUrl = "/images/brands/zenith_electronics.png",
                CreatedAt = new DateTime(2026, 2, 3, 22, 1, 0, DateTimeKind.Utc)
            },
            new Brand
            {
                Id = Guid.Parse("e1b7c2d3-a4e5-4f67-8901-23456789ab03"),
                Name = "Terra Foods",
                Description = "Organic, earthy food products sourced from natural and wholesome origins.",
                LogoUrl = "/images/brands/terra_foods.png",
                CreatedAt = new DateTime(2026, 2, 3, 22, 1, 0, DateTimeKind.Utc)
            },
            new Brand
            {
                Id = Guid.Parse("e1b7c2d3-a4e5-4f67-8901-23456789ab04"),
                Name = "Nova Fashion",
                Description = "Elegant and chic fashion brand featuring contemporary luxury apparel.",
                LogoUrl = "/images/brands/nova_fashion.png",
                CreatedAt = new DateTime(2026, 2, 3, 22, 1, 0, DateTimeKind.Utc)
            },
            new Brand
            {
                Id = Guid.Parse("e1b7c2d3-a4e5-4f67-8901-23456789ab05"),
                Name = "Pulse Fitness",
                Description = "Dynamic fitness brand providing energizing and powerful athletic gear.",
                LogoUrl = "/images/brands/pulse_fitness.png",
                CreatedAt = new DateTime(2026, 2, 3, 22, 1, 0, DateTimeKind.Utc)
            },
            new Brand
            {
                Id = Guid.Parse("e1b7c2d3-a4e5-4f67-8901-23456789ab06"),
                Name = "Echo Home",
                Description = "Cozy and modern home goods designed for contemporary living spaces.",
                LogoUrl = "/images/brands/echo_home.png",
                CreatedAt = new DateTime(2026, 2, 3, 22, 1, 0, DateTimeKind.Utc)
            },
            new Brand
            {
                Id = Guid.Parse("e1b7c2d3-a4e5-4f67-8901-23456789ab07"),
                Name = "Prism Optics",
                Description = "Sharp and technical eyewear brand focused on precision and modern style.",
                LogoUrl = "/images/brands/prism_optics.png",
                CreatedAt = new DateTime(2026, 2, 3, 22, 1, 0, DateTimeKind.Utc)
            },
            new Brand
            {
                Id = Guid.Parse("e1b7c2d3-a4e5-4f67-8901-23456789ab08"),
                Name = "Sage Wellness",
                Description = "Calming health and wellness products inspired by natural zen and tranquility.",
                LogoUrl = "/images/brands/sage_wellness.png",
                CreatedAt = new DateTime(2026, 2, 3, 22, 1, 0, DateTimeKind.Utc)
            },
            new Brand
            {
                Id = Guid.Parse("e1b7c2d3-a4e5-4f67-8901-23456789ab09"),
                Name = "Volt Motors",
                Description = "High-tech electric vehicle brand leading the way in sustainable innovation.",
                LogoUrl = "/images/brands/volt_motors.png",
                CreatedAt = new DateTime(2026, 2, 3, 22, 1, 0, DateTimeKind.Utc)
            },
            new Brand
            {
                Id = Guid.Parse("e1b7c2d3-a4e5-4f67-8901-23456789ab10"),
                Name = "Orion Tech",
                Description = "Sophisticated software company delivering reliable and advanced technological solutions.",
                LogoUrl = "/images/brands/orion_tech.png",
                CreatedAt = new DateTime(2026, 2, 3, 22, 1, 0, DateTimeKind.Utc)
            }
        );
    }
}
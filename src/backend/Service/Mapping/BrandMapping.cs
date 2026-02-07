using Entities.Models;
using Shared.DataTransferObjects;

namespace Service.Mapping;

public static class BrandMapping
{
    public static BrandDto AsDto(this Brand brand)
    {
        return new BrandDto
        {
            Id = brand.Id,
            Name = brand.Name,
            Slug = brand.Slug,
            Description = brand.Description,
            LogoUrl = brand.LogoUrl,
            CreatedAt = brand.CreatedAt,
            UpdatedAt = brand.UpdatedAt
        };
    }

    public static Brand ToEntity(this BrandForCreationDto dto)
    {
        return new Brand
        {
            Name = dto.Name,
            Description = dto.Description,
            LogoUrl = dto.LogoUrl,
        };
    }

    public static void Set(this Brand brand, BrandForUpdateDto dto)
    {
        brand.Name = dto.Name;
        brand.Description = dto.Description;
        brand.LogoUrl = dto.LogoUrl;
        brand.UpdatedAt = DateTime.UtcNow;
    }

}

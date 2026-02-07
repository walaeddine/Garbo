using Entities.Models;
using Shared.DataTransferObjects;

namespace Service.Mapping;

public static class CategoryMapping
{
    public static CategoryDto AsDto(this Category category)
    {
        return new CategoryDto(
            category.Id,
            category.Name,
            category.Slug,
            category.Description,
            category.PictureUrl,
            category.CreatedAt,
            category.UpdatedAt
        );
    }

    public static Category ToEntity(this CategoryForCreationDto dto)
    {
        return new Category
        {
            Name = dto.Name!,
            Description = dto.Description,
            PictureUrl = dto.PictureUrl
        };
    }

    public static void Set(this Category category, CategoryForUpdateDto dto)
    {
        category.Name = dto.Name!;
        category.Description = dto.Description;
        category.PictureUrl = dto.PictureUrl;
        category.UpdatedAt = DateTime.UtcNow;
    }
}

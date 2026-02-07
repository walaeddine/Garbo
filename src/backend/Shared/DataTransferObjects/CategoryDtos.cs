using System.ComponentModel.DataAnnotations;

namespace Shared.DataTransferObjects;

public record CategoryDto(Guid Id, string Name, string Slug, string? Description, string? PictureUrl, DateTime CreatedAt, DateTime UpdatedAt);

public record CategoryForCreationDto
{
    [Required(ErrorMessage = "Category name is a required field.")]
    [MaxLength(60, ErrorMessage = "Maximum length for the Name is 60 characters.")]
    public string? Name { get; init; }

    public string? Description { get; init; }

    public string? PictureUrl { get; init; }
}

public record CategoryForUpdateDto
{
    [Required(ErrorMessage = "Category name is a required field.")]
    [MaxLength(60, ErrorMessage = "Maximum length for the Name is 60 characters.")]
    public string? Name { get; init; }

    public string? Description { get; init; }

    public string? PictureUrl { get; init; }
}

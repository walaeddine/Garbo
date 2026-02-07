using Entities.Helpers;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Entities.Models;

public class Category
{
    [Column("CategoryId")]
    public Guid Id { get; set; }

    private string _name = string.Empty;

    [Required(ErrorMessage = "Category name is a required field.")]
    [MaxLength(60, ErrorMessage = "Maximum length for the Name is 60 characters.")]
    public string Name
    {
        get => _name;
        set
        {
            _name = value;
            Slug = SlugGenerator.GenerateSlug(value);
        }
    }

    public string Slug { get; private set; } = string.Empty;

    public string? Description { get; set; }

    public string? PictureUrl { get; set; }

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public DateTime UpdatedAt { get; set; }

    public bool IsDeleted { get; set; }
    public DateTime? DeletedAt { get; set; }
}

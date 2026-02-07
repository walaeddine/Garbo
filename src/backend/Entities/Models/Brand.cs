using Entities.Helpers;

namespace Entities.Models;

[Microsoft.EntityFrameworkCore.Index(nameof(Name))]
[Microsoft.EntityFrameworkCore.Index(nameof(Slug), IsUnique = true)]
public class Brand
{
    public Guid Id { get; set; }
    private string _name = string.Empty;
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
    public string? LogoUrl { get; set; }

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; }

    public bool IsDeleted { get; set; }
    public DateTime? DeletedAt { get; set; }
}

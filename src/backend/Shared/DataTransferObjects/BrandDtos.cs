namespace Shared.DataTransferObjects;

public class BrandDto
{
    public Guid Id { get; set; }
    public string? Name { get; set; }
    public string? Slug { get; set; }
    public string? Description { get; set; }
    public string? LogoUrl { get; set; }

    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
    
    public bool IsDeleted { get; set; }
    public DateTime? DeletedAt { get; set; }
}

public class BrandForCreationDto
{
    public required string Name { get; set; }
    public string? Description { get; set; }
    public string? LogoUrl { get; set; }
}

public class BrandForUpdateDto
{
    public required string Name { get; set; }
    public string? Description { get; set; }
    public string? LogoUrl { get; set; }
}

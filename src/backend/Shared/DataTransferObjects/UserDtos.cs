using System.ComponentModel.DataAnnotations;

namespace Shared.DataTransferObjects;

public record UserDto
{
    public string? Id { get; init; }
    public string? FirstName { get; init; }
    public string? LastName { get; init; }
    public string? Email { get; init; }
    public IEnumerable<string>? Roles { get; init; }
    public DateTimeOffset? LockoutEnd { get; init; }
}

public record UserForAuthenticationDto
{
    [Required(ErrorMessage = "Email is required")]
    public string? Email { get; init; }

    [Required(ErrorMessage = "Password is required")]
    public string? Password { get; init; }
}

public record UserForRegistrationDto
{
    [Required(ErrorMessage = "First name is required")]
    public string? FirstName { get; init; }

    [Required(ErrorMessage = "Last name is required")]
    public string? LastName { get; init; }

    [Required(ErrorMessage = "Password is required")]
    public string? Password { get; init; }

    [Required(ErrorMessage = "Email is required")]
    public string? Email { get; init; }
}

public record UserForUpdateDto
{
    [Required(ErrorMessage = "First name is required")]
    public string? FirstName { get; init; }

    [Required(ErrorMessage = "Last name is required")]
    public string? LastName { get; init; }
    
    [EmailAddress]
    public string? Email { get; init; } // Optional: For email change request

    public string? CurrentPassword { get; init; }
    public string? NewPassword { get; init; }
}

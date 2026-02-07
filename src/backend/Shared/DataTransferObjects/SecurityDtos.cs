using System.ComponentModel.DataAnnotations;

namespace Shared.DataTransferObjects;

public record ChangePasswordDto
{
    [Required(ErrorMessage = "Current password is required")]
    public string? CurrentPassword { get; init; }

    [Required(ErrorMessage = "New password is required")]
    public string? NewPassword { get; init; }

    [Compare("NewPassword", ErrorMessage = "The new password and confirmation password do not match.")]
    public string? ConfirmNewPassword { get; init; }
}

public record CompletePasswordUpdateDto
{
    [Required(ErrorMessage = "Code is required")]
    public string? Code { get; init; }

    [Required(ErrorMessage = "CurrentPassword is required")]
    public string? CurrentPassword { get; init; }

    [Required(ErrorMessage = "NewPassword is required")]
    public string? NewPassword { get; init; }

    [Compare("NewPassword", ErrorMessage = "The password and confirmation password do not match.")]
    public string? ConfirmNewPassword { get; init; }
}

public record ConfirmEmailChangeDto
{
    [Required]
    public string? Code { get; init; }
}

public record DeleteAccountDto
{
    [Required(ErrorMessage = "Password is required to confirm deletion.")]
    public string? Password { get; init; }
}

public record ForgotPasswordDto
{
    [Required(ErrorMessage = "Email is required")]
    [EmailAddress]
    public string? Email { get; init; }
}

public record ReactivateAccountDto
{
    [Required]
    [EmailAddress]
    public string? Email { get; init; }
    
    [Required]
    public string? Code { get; init; }
}

public record RequestReactivationDto
{
    [Required]
    [EmailAddress]
    public string? Email { get; init; }
}

public record ResendVerificationDto
{
    [Required(ErrorMessage = "Email is required")]
    [EmailAddress]
    public string? Email { get; init; }
}

public record ResetPasswordDto
{
    [Required(ErrorMessage = "Email is required")]
    [EmailAddress]
    public string? Email { get; init; }

    [Required(ErrorMessage = "Code is required")]
    public string? Code { get; init; }

    [Required(ErrorMessage = "NewPassword is required")]
    public string? NewPassword { get; init; }

    [Compare("NewPassword", ErrorMessage = "The password and confirmation password do not match.")]
    public string? ConfirmNewPassword { get; init; }
}

public record UserLockoutDto(bool Locked);

public record VerifyEmailDto
{
    [Required(ErrorMessage = "Email is required")]
    [EmailAddress]
    public string? Email { get; init; }

    [Required(ErrorMessage = "Code is required")]
    public string? Code { get; init; }
}

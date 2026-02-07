using Microsoft.AspNetCore.Identity;

namespace Entities.Models;

public class User : IdentityUser
{
    public string FirstName { get; set; } = string.Empty;
    public string LastName { get; set; } = string.Empty;
    public string? RefreshToken { get; set; }
    public DateTime RefreshTokenExpiryTime { get; set; }
    
    // For Grace Period
    public string? PreviousRefreshToken { get; set; }
    public DateTime? PreviousRefreshTokenExpiryTime { get; set; }

    // For 2FA / Password Reset
    public string? VerificationCode { get; set; }
    public DateTime? VerificationCodeExpiry { get; set; }
    public string? VerificationPurpose { get; set; } // e.g., "PasswordReset", "ProfileUpdate"

    // For Email Change
    public string? NewEmailCandidate { get; set; }
    public string? NewEmailCode { get; set; }
    public DateTime? NewEmailCodeExpiry { get; set; }

    // For Soft Delete & Account Deletion
    public bool IsDeleted { get; set; }
    public DateTime? ScheduledDeletionDate { get; set; } // When the account will be anonymized
    public DateTime? DeletedAt { get; set; } // When the user clicked "Delete"
}

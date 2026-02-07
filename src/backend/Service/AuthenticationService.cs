using System.IdentityModel.Tokens.Jwt;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;
using Contracts;
using Entities.Models;
using Entities.Exceptions;
using Microsoft.AspNetCore.Identity;
using Microsoft.Extensions.Configuration;
using Microsoft.IdentityModel.Tokens;
using Service.Contracts;
using Shared.DataTransferObjects;
using Shared.RequestFeatures;
using Entities.ConfigurationModels;
using Service.Mapping;

namespace Service;

internal sealed class AuthenticationService : IAuthenticationService
{
    private readonly ILoggerManager _logger;
    private readonly UserManager<User> _userManager;
    private readonly IEmailService _emailService;
    private readonly JwtConfiguration _jwtConfig;

    public AuthenticationService(ILoggerManager logger, UserManager<User> userManager, IConfiguration configuration, IEmailService emailService)
    {
        _logger = logger;
        _userManager = userManager;
        _emailService = emailService;
        _jwtConfig = new JwtConfiguration();
        configuration.Bind(_jwtConfig.Section, _jwtConfig);
    }

    public async Task<IdentityResult> RegisterUser(UserForRegistrationDto userForRegistration)
    {
        var existingUser = await _userManager.FindByEmailAsync(userForRegistration.Email!);
        
        if (existingUser != null)
        {
            if (await _userManager.IsEmailConfirmedAsync(existingUser))
            {
                // Determine if we should reveal that the user exists. 
                // Standard practice is often generic, but for now we follow the "User already exists" pattern requested.
                return IdentityResult.Failed(new IdentityError 
                { 
                    Code = "UserExists", 
                    Description = $"User with email '{userForRegistration.Email}' already exists." 
                });
            }
            else
            {
                // User exists but is UNVERIFIED. Overwrite/Update them.
                existingUser.FirstName = userForRegistration.FirstName!;
                existingUser.LastName = userForRegistration.LastName!;
                existingUser.UserName = userForRegistration.Email!; // Ensure username matches if we treat email as username
                
                // Update password
                var passwordHasher = new PasswordHasher<User>();
                existingUser.PasswordHash = passwordHasher.HashPassword(existingUser, userForRegistration.Password!);
                
                // Generate new code
                var code = new Random().Next(100000, 999999).ToString();
                existingUser.VerificationCode = code;
                existingUser.VerificationCodeExpiry = DateTime.UtcNow.AddMinutes(30);
                existingUser.VerificationPurpose = "EmailConfirmation";
                
                var updateResult = await _userManager.UpdateAsync(existingUser);
                
                if (updateResult.Succeeded)
                {
                    await SendVerificationEmail(existingUser, code);
                }
                
                return updateResult;
            }
        }

        var user = UserMapping.MapToUser(userForRegistration);
        var result = await _userManager.CreateAsync(user, userForRegistration.Password!);

        if (result.Succeeded)
        {
            await _userManager.AddToRoleAsync(user, "User");

            var code = new Random().Next(100000, 999999).ToString();
            user.VerificationCode = code;
            user.VerificationCodeExpiry = DateTime.UtcNow.AddMinutes(30);
            user.VerificationPurpose = "EmailConfirmation";
            await _userManager.UpdateAsync(user);

            await SendVerificationEmail(user, code);
        }

        return result;
    }

    private async Task SendVerificationEmail(User user, string code)
    {
         await _emailService.SendEmailSafeAsync(user.Email!, "Verify your email - Garbo", 
            $"<h1>Welcome to Garbo!</h1><p>Please verify your email using this code: <strong>{code}</strong></p>",
            $"Verification email sent successfully to {user.Email}");
    }

    public async Task<User> ValidateUser(UserForAuthenticationDto userForAuth)
    {
        // We must use IgnoreQueryFilters to find the user if they are Soft Deleted, otherwise FindByEmailAsync returns null
        var user = await _userManager.Users.IgnoreQueryFilters().FirstOrDefaultAsync(u => u.Email == userForAuth.Email);
        
        if (user == null)
            throw new UserEmailNotFoundException(userForAuth.Email!);

        if (!await _userManager.IsEmailConfirmedAsync(user))
        {
            _logger.LogWarn($"{userForAuth.Email} tried to login without verifying email.");
            throw new EmailNotVerifiedException(userForAuth.Email!); 
        }

        if (await _userManager.IsLockedOutAsync(user))
        {
            _logger.LogWarn($"{userForAuth.Email} is locked out.");
            if (user.LockoutEnd > DateTimeOffset.UtcNow.AddYears(100))
            {
                throw new UserLockedOutException("Your account has been locked by an administrator. Please contact support.");
            }
            throw new UserLockedOutException();
        }

        // SOFT DELETE CHECK
        if (user.IsDeleted)
        {
             _logger.LogWarn($"{userForAuth.Email} is soft deleted.");
             // Check if within Grace Period (30 days from ScheduledDeletionDate - 30 days... wait, ScheduledDeletionDate IS the end date)
             // ScheduledDeletionDate is set to Now + 30 days.
             // So if Now < ScheduledDeletionDate, we are in grace period.
             
             if (user.ScheduledDeletionDate.HasValue && DateTime.UtcNow < user.ScheduledDeletionDate.Value)
             if (user.ScheduledDeletionDate.HasValue && DateTime.UtcNow < user.ScheduledDeletionDate.Value)
             {
                 throw new AccountPendingDeletionException(user.Email!); 
             }
             else
             {
                 // Grace period over. Account is effectively gone.
                 // We could anonymize here or just block login.
                 throw new UserNotFoundException(userForAuth.Email!); // Behave as if user doesn't exist
             }
        }

        var result = await _userManager.CheckPasswordAsync(user, userForAuth.Password!);

        if (!result)
        {
            await _userManager.AccessFailedAsync(user);
            _logger.LogWarn($"{userForAuth.Email} failed authentication (incorrect password).");
            throw new IncorrectPasswordException();
        }

        await _userManager.ResetAccessFailedCountAsync(user);
        return user;
    }

    public async Task<TokenDto> CreateToken(User user, bool populateExp)
    {
        var signingCredentials = GetSigningCredentials();
        var claims = await GetClaims(user);
        var tokenOptions = GenerateTokenOptions(signingCredentials, claims);
        var refreshToken = GenerateRefreshToken();

        user.RefreshToken = refreshToken;
        
        if(populateExp)
            user.RefreshTokenExpiryTime = DateTime.UtcNow.AddDays(7);
        
        await _userManager.UpdateAsync(user);

        var accessToken = new JwtSecurityTokenHandler().WriteToken(tokenOptions);

        return new TokenDto(accessToken, refreshToken);
    }

    public async Task<TokenDto> RefreshToken(TokenDto tokenDto)
    {
        var principal = GetPrincipalFromExpiredToken(tokenDto.AccessToken);
        var user = await _userManager.FindByNameAsync(principal.Identity!.Name!);

        if (user == null)
            throw new RefreshTokenBadRequestException();

        // Check if token matches current Refresh Token
        if (user.RefreshToken != tokenDto.RefreshToken)
        {
            // GRACE PERIOD CHECK: If token matches Previous and is not expired
            if (user.PreviousRefreshToken == tokenDto.RefreshToken && user.PreviousRefreshTokenExpiryTime > DateTime.UtcNow)
            {
                // Return new Access Token but keep the CURRENT Refresh Token (which is already rotated)
                var signingCredentialsGrace = GetSigningCredentials();
                var claimsGrace = await GetClaims(user);
                var tokenOptionsGrace = GenerateTokenOptions(signingCredentialsGrace, claimsGrace);
                var newAccessTokenGrace = new JwtSecurityTokenHandler().WriteToken(tokenOptionsGrace);

                return new TokenDto(newAccessTokenGrace, user.RefreshToken!);
            }

            // Invalid token
            throw new RefreshTokenBadRequestException();
        }

        // Validate expiry of current token
        if (user.RefreshTokenExpiryTime <= DateTime.UtcNow)
            throw new RefreshTokenBadRequestException();

        var signingCredentials = GetSigningCredentials();
        var claims = await GetClaims(user);
        
        var tokenOptions = GenerateTokenOptions(signingCredentials, claims);
        var newRefreshToken = GenerateRefreshToken();

        // ROTATION: Save current as Previous with 1 minute grace period
        user.PreviousRefreshToken = user.RefreshToken;
        user.PreviousRefreshTokenExpiryTime = DateTime.UtcNow.AddMinutes(1);

        user.RefreshToken = newRefreshToken;
        await _userManager.UpdateAsync(user);

        var newAccessToken = new JwtSecurityTokenHandler().WriteToken(tokenOptions);

        return new TokenDto(newAccessToken, newRefreshToken);
    }

    public async Task<UserDto> GetUser(string userName)
    {
        var user = await _userManager.FindByNameAsync(userName) ?? throw new UserNotFoundException(userName);

        var roles = await _userManager.GetRolesAsync(user);

        return new UserDto
        {
            Id = user.Id,
            FirstName = user.FirstName,
            LastName = user.LastName,
            Email = user.Email,
            Roles = roles
        };
    }

    public async Task<IdentityResult> UpdateUser(string userId, UserForUpdateDto userForUpdate)
    {
        var user = await GetUserByIdOrThrow(userId);

        user.FirstName = userForUpdate.FirstName!;
        user.LastName = userForUpdate.LastName!;

        var result = await _userManager.UpdateAsync(user);
        if (!result.Succeeded) return result;

        if (!string.IsNullOrWhiteSpace(userForUpdate.CurrentPassword) && !string.IsNullOrWhiteSpace(userForUpdate.NewPassword))
        {
            result = await _userManager.ChangePasswordAsync(user, userForUpdate.CurrentPassword, userForUpdate.NewPassword);
        }

        if (!string.IsNullOrWhiteSpace(userForUpdate.Email) && userForUpdate.Email != user.Email)
        {
            // Check if email taken
            var existingUser = await _userManager.FindByEmailAsync(userForUpdate.Email);
            if (existingUser != null)
                return IdentityResult.Failed(new IdentityError { Code = "DuplicateEmail", Description = "Email is already in use." });

            // SAFE EMAIL CHANGE: Don't update Email immediately.
            user.NewEmailCandidate = userForUpdate.Email;
            var code = new Random().Next(100000, 999999).ToString();
            user.NewEmailCode = code;
            user.NewEmailCodeExpiry = DateTime.UtcNow.AddMinutes(30);
            
            await _userManager.UpdateAsync(user);

            // Send code to NEW email
            await _emailService.SendEmailSafeAsync(user.NewEmailCandidate, "Confirm Email Change - Garbo", 
                $"<h1>Confirm Email Change</h1><p>Use code <strong>{code}</strong> to confirm changing your email to this address.</p>",
                $"Email change code sent to {user.NewEmailCandidate}");
        }

        return result;
    }

    public async Task<int> GetUsersCount() => await _userManager.Users.CountAsync();

    public async Task<(IEnumerable<UserDto> users, MetaData metaData)> GetUsersAsync(UserParameters userParameters)
    {
        var usersQuery = _userManager.Users;

        if (!string.IsNullOrWhiteSpace(userParameters.SearchTerm))
        {
            var searchLower = userParameters.SearchTerm.ToLower();
            usersQuery = usersQuery.Where(u => 
                u.FirstName.ToLower().Contains(searchLower) || 
                u.LastName.ToLower().Contains(searchLower) || 
                u.Email!.ToLower().Contains(searchLower));
        }

        var count = await usersQuery.CountAsync();

        var users = await usersQuery
            .OrderBy(u => u.LastName)
            .Skip((userParameters.PageNumber - 1) * userParameters.PageSize)
            .Take(userParameters.PageSize)
            .ToListAsync();

        var userDtos = new List<UserDto>();
        foreach (var user in users)
        {
            var roles = await _userManager.GetRolesAsync(user);
            userDtos.Add(new UserDto
            {
                Id = user.Id,
                FirstName = user.FirstName,
                LastName = user.LastName,
                Email = user.Email,
                Roles = roles,
                LockoutEnd = user.LockoutEnd
            });
        }

        var metaData = new MetaData
        {
            TotalCount = count,
            PageSize = userParameters.PageSize,
            CurrentPage = userParameters.PageNumber,
            TotalPages = (int)Math.Ceiling(count / (double)userParameters.PageSize)
        };

        return (users: userDtos, metaData: metaData);
    }

    public async Task UpdateUserRoles(string userId, IEnumerable<string> roles)
    {
        Console.WriteLine($"[DEBUG] Service UpdateUserRoles called for {userId}");
        var user = await GetUserByIdOrThrow(userId);

        var currentRoles = await _userManager.GetRolesAsync(user);
        
        // Ensure "User" role is always present in the target roles
        var targetRoles = roles.ToHashSet();
        targetRoles.Add("User");

        var rolesToAdd = targetRoles.Except(currentRoles);
        var rolesToRemove = currentRoles.Except(targetRoles);

        await _userManager.AddToRolesAsync(user, rolesToAdd);
        await _userManager.RemoveFromRolesAsync(user, rolesToRemove);
    }

    public async Task ToggleUserLockout(string userId, bool lockout)
    {
        var user = await _userManager.FindByIdAsync(userId);
        if (user == null) throw new UserNotFoundException(userId);

        if (lockout)
        {
            await _userManager.SetLockoutEndDateAsync(user, DateTimeOffset.MaxValue);
        }
        else
        {
            await _userManager.SetLockoutEndDateAsync(user, null);
        }
    }

    private SigningCredentials GetSigningCredentials()
    {
        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_jwtConfig.Secret!));
        return new SigningCredentials(key, SecurityAlgorithms.HmacSha256);
    }

    private async Task<List<Claim>> GetClaims(User user)
    {
        var claims = new List<Claim>
        {
            new(ClaimTypes.Name, user.UserName!),
            new(JwtRegisteredClaimNames.Sub, user.Id), 
            new(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString())
        };

        var roles = await _userManager.GetRolesAsync(user);
        foreach (var role in roles)
        {
            claims.Add(new Claim(ClaimTypes.Role, role));
        }

        return claims;
    }

    private JwtSecurityToken GenerateTokenOptions(SigningCredentials signingCredentials, List<Claim> claims)
    {
        var expires = Convert.ToDouble(_jwtConfig.Expires);

        var tokenOptions = new JwtSecurityToken(
            issuer: _jwtConfig.ValidIssuer,
            audience: _jwtConfig.ValidAudience,
            claims: claims,
            expires: DateTime.UtcNow.AddMinutes(expires),
            signingCredentials: signingCredentials);

        return tokenOptions;
    }

    private static string GenerateRefreshToken()
    {
        var randomNumber = new byte[32];
        using var rng = RandomNumberGenerator.Create();
        rng.GetBytes(randomNumber);
        return Convert.ToBase64String(randomNumber);
    }

    private ClaimsPrincipal GetPrincipalFromExpiredToken(string token)
    {
        var tokenValidationParameters = new TokenValidationParameters
        {
            ValidateAudience = true,
            ValidateIssuer = true,
            ValidateIssuerSigningKey = true,
            IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_jwtConfig.Secret!)),
            ValidIssuer = _jwtConfig.ValidIssuer,
            ValidAudience = _jwtConfig.ValidAudience,
            ValidateLifetime = false 
        };

        var tokenHandler = new JwtSecurityTokenHandler();
        var principal = tokenHandler.ValidateToken(token, tokenValidationParameters, out SecurityToken securityToken);

        if (securityToken is not JwtSecurityToken jwtSecurityToken || !jwtSecurityToken.Header.Alg.Equals(SecurityAlgorithms.HmacSha256, StringComparison.InvariantCultureIgnoreCase))
            throw new SecurityTokenException("Invalid token");

        return principal;
    }
    public async Task Logout(string userName)
    {
        var user = await _userManager.FindByNameAsync(userName) ?? throw new UserNotFoundException(userName);

        user.RefreshToken = null;
        user.RefreshTokenExpiryTime = default;

        await _userManager.UpdateAsync(user);
    }

    public async Task<IdentityResult> ChangePassword(string userId, string currentPassword, string newPassword)
    {
        var user = await GetUserByIdOrThrow(userId);
        return await _userManager.ChangePasswordAsync(user, currentPassword, newPassword);
    }

    public async Task ForgotPassword(string email)
    {
        var user = await _userManager.FindByEmailAsync(email);
        if (user == null)
            return; // Don't reveal user existence

        var code = new Random().Next(100000, 999999).ToString();
        user.VerificationCode = code;
        user.VerificationCodeExpiry = DateTime.UtcNow.AddMinutes(15);
        user.VerificationPurpose = "PasswordReset";

        await _userManager.UpdateAsync(user);

        await _emailService.SendEmailSafeAsync(user.Email!, "Reset Password - Garbo", 
            $"<h1>Reset Password</h1><p>Your verification code is: <strong>{code}</strong></p><p>It expires in 15 minutes.</p>",
            $"Password reset code sent to {user.Email}");
    }

    public async Task<IdentityResult> ResetPassword(string email, string code, string newPassword)
    {
        var user = await _userManager.FindByEmailAsync(email);
        if (user == null)
            return IdentityResult.Failed(new IdentityError { Description = "Invalid Request" });

        if (user.VerificationCode != code || user.VerificationCodeExpiry < DateTime.UtcNow || user.VerificationPurpose != "PasswordReset")
            return IdentityResult.Failed(new IdentityError { Description = "Invalid or expired code" });

        var token = await _userManager.GeneratePasswordResetTokenAsync(user);
        var result = await _userManager.ResetPasswordAsync(user, token, newPassword);

        if (result.Succeeded)
        {
            user.VerificationCode = null;
            user.VerificationCodeExpiry = null;
            user.VerificationPurpose = null;
            await _userManager.UpdateAsync(user);
        }

        return result;
    }

    public async Task InitiatePasswordUpdate(string userId)
    {
        var user = await GetUserByIdOrThrow(userId);

        var code = new Random().Next(100000, 999999).ToString();
        user.VerificationCode = code;
        user.VerificationCodeExpiry = DateTime.UtcNow.AddMinutes(15);
        user.VerificationPurpose = "PasswordUpdate";

        await _userManager.UpdateAsync(user);

        await _emailService.SendEmailSafeAsync(user.Email!, "Verify Password Update - Garbo", 
            $"<h1>verify Password Update</h1><p>Your verification code is: <strong>{code}</strong></p><p>It expires in 15 minutes.</p>",
            $"Password update code sent to {user.Email}");
    }

    public async Task<IdentityResult> CompletePasswordUpdate(string userId, string code, string currentPassword, string newPassword)
    {
        var user = await GetUserByIdOrThrow(userId);

        if (user.VerificationCode != code || user.VerificationCodeExpiry < DateTime.UtcNow || user.VerificationPurpose != "PasswordUpdate")
            return IdentityResult.Failed(new IdentityError { Description = "Invalid or expired code" });

        var result = await _userManager.ChangePasswordAsync(user, currentPassword, newPassword);

        if (result.Succeeded)
        {
            user.VerificationCode = null;
            user.VerificationCodeExpiry = null;
            user.VerificationPurpose = null;
            await _userManager.UpdateAsync(user);
        }

        return result;
    }

    public async Task<IdentityResult> VerifyEmail(string email, string code)
    {
        var user = await _userManager.FindByEmailAsync(email);
        if (user == null) return IdentityResult.Failed(new IdentityError { Description = "Invalid request" });

        if (user.VerificationCode != code || user.VerificationCodeExpiry < DateTime.UtcNow || user.VerificationPurpose != "EmailConfirmation")
        {
            return IdentityResult.Failed(new IdentityError { Description = "Invalid or expired code" });
        }

        user.EmailConfirmed = true;
        user.VerificationCode = null;
        user.VerificationCodeExpiry = null;
        user.VerificationPurpose = null;

        return await _userManager.UpdateAsync(user);
    }

    public async Task<IdentityResult> ResendVerificationCode(string email)
    {
        var user = await _userManager.FindByEmailAsync(email);
        if (user == null) 
            return IdentityResult.Failed(new IdentityError { Description = "Invalid request" });

        if (await _userManager.IsEmailConfirmedAsync(user))
            return IdentityResult.Failed(new IdentityError { Description = "Email already confirmed" });

        var code = new Random().Next(100000, 999999).ToString();
        user.VerificationCode = code;
        user.VerificationCodeExpiry = DateTime.UtcNow.AddMinutes(30);
        user.VerificationPurpose = "EmailConfirmation";
        
        var result = await _userManager.UpdateAsync(user);

        if (result.Succeeded)
        {
             await _emailService.SendEmailSafeAsync(user.Email!, "Verify your email - Garbo", 
                $"<h1>Welcome to Garbo!</h1><p>Please verify your email using this code: <strong>{code}</strong></p>",
                $"Verification email resent successfully to {user.Email}");
        }

        return result;
    }

    public async Task<IdentityResult> ConfirmEmailChange(string userId, string code)
    {
        var user = await _userManager.FindByIdAsync(userId);
        if (user == null) return IdentityResult.Failed(new IdentityError { Description = "User not found" });

        if (user.NewEmailCode != code || user.NewEmailCodeExpiry < DateTime.UtcNow)
             return IdentityResult.Failed(new IdentityError { Description = "Invalid or expired code" });

        // Update verify
        // We need to set the email and username
        var setUserNameResult = await _userManager.SetUserNameAsync(user, user.NewEmailCandidate);
        var setEmailResult = await _userManager.SetEmailAsync(user, user.NewEmailCandidate);

        if (setEmailResult.Succeeded)
        {
             user.EmailConfirmed = true; // Re-confirm since they verified the change
             user.NewEmailCandidate = null;
             user.NewEmailCode = null;
             user.NewEmailCodeExpiry = null;
             await _userManager.UpdateAsync(user);
             return IdentityResult.Success;
        }
        
        return setEmailResult;
    }

    private async Task<User> GetUserByIdOrThrow(string userId)
    {
        var user = await _userManager.FindByIdAsync(userId);
        if (user == null) throw new UserNotFoundException(userId);
        return user;
    }
}

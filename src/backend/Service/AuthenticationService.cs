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
    private readonly ITokenService _tokenService;

    public AuthenticationService(ILoggerManager logger, UserManager<User> userManager, IEmailService emailService, ITokenService tokenService)
    {
        _logger = logger;
        _userManager = userManager;
        _emailService = emailService;
        _tokenService = tokenService;
    }

    public async Task<IdentityResult> RegisterUser(UserForRegistrationDto userForRegistration)
    {
        var existingUser = await _userManager.FindByEmailAsync(userForRegistration.Email!);
        
        if (existingUser != null)
        {
            if (await _userManager.IsEmailConfirmedAsync(existingUser))
            {
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
                existingUser.UserName = userForRegistration.Email!; 
                
                var passwordHasher = new PasswordHasher<User>();
                existingUser.PasswordHash = passwordHasher.HashPassword(existingUser, userForRegistration.Password!);
                
                var code = new Random().Next(100000, 999999).ToString();
                existingUser.VerificationCode = code;
                existingUser.VerificationCodeExpiry = DateTime.UtcNow.AddMinutes(30);
                existingUser.VerificationPurpose = "EmailConfirmation";
                
                var updateResult = await _userManager.UpdateAsync(existingUser);
                if (updateResult.Succeeded) await SendVerificationEmail(existingUser, code);
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

        if (user.IsDeleted)
        {
             _logger.LogWarn($"{userForAuth.Email} is soft deleted.");
             if (user.ScheduledDeletionDate.HasValue && DateTime.UtcNow < user.ScheduledDeletionDate.Value)
             {
                 throw new AccountPendingDeletionException(user.Email!); 
             }
             else
             {
                 throw new UserNotFoundException(userForAuth.Email!); 
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

    public async Task<TokenDto> CreateToken(User user, bool populateExp) => await _tokenService.CreateToken(user, populateExp);

    public async Task Logout(string userName) => await _tokenService.RevokeAllTokens(userName);

    public async Task<IdentityResult> ChangePassword(string userId, string currentPassword, string newPassword)
    {
        var user = await GetUserByIdOrThrow(userId);
        return await _userManager.ChangePasswordAsync(user, currentPassword, newPassword);
    }

    public async Task ForgotPassword(string email)
    {
        var user = await _userManager.FindByEmailAsync(email);
        if (user == null) return;

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

    private async Task<User> GetUserByIdOrThrow(string userId)
    {
        var user = await _userManager.FindByIdAsync(userId);
        if (user == null) throw new UserNotFoundException(userId);
        return user;
    }
}

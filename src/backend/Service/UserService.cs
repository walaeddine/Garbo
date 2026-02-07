using Contracts;
using Entities.Exceptions;
using Entities.Models;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Service.Contracts;
using Shared.DataTransferObjects;
using Shared.RequestFeatures;

namespace Service;

internal sealed class UserService : IUserService
{
    private readonly ILoggerManager _logger;
    private readonly UserManager<User> _userManager;
    private readonly IEmailService _emailService;

    public UserService(ILoggerManager logger, UserManager<User> userManager, IEmailService emailService)
    {
        _logger = logger;
        _userManager = userManager;
        _emailService = emailService;
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

    public async Task<User> GetUserEntity(string userId) => await GetUserByIdOrThrow(userId);

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

            await _emailService.SendEmailSafeAsync(user.NewEmailCandidate, "Confirm Email Change - Garbo", 
                $"<h1>Confirm Email Change</h1><p>Use code <strong>{code}</strong> to confirm changing your email to this address.</p>",
                $"Email change code sent to {user.NewEmailCandidate}");
        }

        return result;
    }

    public async Task ResendEmailChangeCode(string userId)
    {
        var user = await GetUserByIdOrThrow(userId);

        if (string.IsNullOrEmpty(user.NewEmailCandidate))
            return; // No pending email change

        // Refresh Code
        var code = new Random().Next(100000, 999999).ToString();
        user.NewEmailCode = code;
        user.NewEmailCodeExpiry = DateTime.UtcNow.AddMinutes(30);

        await _userManager.UpdateAsync(user);

        await _emailService.SendEmailSafeAsync(user.NewEmailCandidate, "Confirm Email Change - Garbo", 
            $"<h1>Confirm Email Change</h1><p>Use code <strong>{code}</strong> to confirm changing your email to this address.</p>",
            $"Email change code resent to {user.NewEmailCandidate}");
    }

    public async Task<IdentityResult> ConfirmEmailChange(string userId, string code)
    {
        var user = await GetUserByIdOrThrow(userId);

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

    public async Task DeleteAccount(string userId)
    {
         var user = await GetUserByIdOrThrow(userId);

         user.IsDeleted = true;
         user.DeletedAt = DateTime.UtcNow;
         user.ScheduledDeletionDate = DateTime.UtcNow.AddDays(30);
         
         await _userManager.UpdateAsync(user);
         
         // Send Email
         await _emailService.SendEmailSafeAsync(user.Email!, "Account Deleted - Garbo", 
            $"<h1>Account Deleted</h1><p>Your account has been scheduled for deletion in 30 days. You can reactivate it anytime before then by logging in.</p>",
            $"Account deletion email sent to {user.Email}");
    }

    public async Task RequestAccountReactivation(string email)
    {
        // Must use IgnoreQueryFilters to find the user!
        var user = await _userManager.Users.IgnoreQueryFilters().FirstOrDefaultAsync(u => u.Email == email);
        if (user == null || !user.IsDeleted) return;

        // Check if grace period expired?
        if (user.ScheduledDeletionDate.HasValue && DateTime.UtcNow > user.ScheduledDeletionDate.Value)
            return; // Too late

        var code = new Random().Next(100000, 999999).ToString();
        user.VerificationCode = code;
        user.VerificationCodeExpiry = DateTime.UtcNow.AddMinutes(15);
        user.VerificationPurpose = "Reactivation";
        
        await _userManager.UpdateAsync(user);

        await _emailService.SendEmailSafeAsync(user.Email!, "Reactivate Account - Garbo", 
            $"<h1>Reactivate Account</h1><p>Use code <strong>{code}</strong> to reactivate your account.</p>",
            "Reactivation email sent.");
    }

    public async Task<IdentityResult> ReactivateAccount(string email, string code)
    {
         var user = await _userManager.Users.IgnoreQueryFilters().FirstOrDefaultAsync(u => u.Email == email);
         if (user == null) return IdentityResult.Failed(new IdentityError { Description = "User not found" });

         if (!user.IsDeleted) return IdentityResult.Success; // Already active

         if (user.VerificationCode != code || user.VerificationCodeExpiry < DateTime.UtcNow || user.VerificationPurpose != "Reactivation")
             return IdentityResult.Failed(new IdentityError { Description = "Invalid or expired code" });

         user.IsDeleted = false;
         user.DeletedAt = null;
         user.ScheduledDeletionDate = null;
         user.VerificationCode = null;
         user.VerificationPurpose = null;

         return await _userManager.UpdateAsync(user);
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
        var user = await GetUserByIdOrThrow(userId);

        if (lockout)
        {
            await _userManager.SetLockoutEndDateAsync(user, DateTimeOffset.MaxValue);
        }
        else
        {
            await _userManager.SetLockoutEndDateAsync(user, null);
        }
    }

    // Helpers
    private async Task<User> GetUserByIdOrThrow(string userId)
    {
        var user = await _userManager.FindByIdAsync(userId);
        if (user == null) throw new UserNotFoundException(userId);
        return user;
    }

    private async Task<User> GetUserByNameOrThrow(string userName)
    {
        var user = await _userManager.FindByNameAsync(userName);
        if (user == null) throw new UserNotFoundException(userName);
        return user;
    }

}

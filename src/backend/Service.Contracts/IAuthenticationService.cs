using Entities.Models;
using Microsoft.AspNetCore.Identity;
using Shared.DataTransferObjects;
using Shared.RequestFeatures;

namespace Service.Contracts;

public interface IAuthenticationService
{
    Task<IdentityResult> RegisterUser(UserForRegistrationDto userForRegistration);
    Task<User> ValidateUser(UserForAuthenticationDto userForAuth);
    Task<TokenDto> CreateToken(User user, bool populateExp);
    Task Logout(string userName);
    Task<IdentityResult> ChangePassword(string userId, string currentPassword, string newPassword);
    Task ForgotPassword(string email);
    Task<IdentityResult> ResetPassword(string email, string code, string newPassword);
    Task InitiatePasswordUpdate(string userId);
    Task<IdentityResult> CompletePasswordUpdate(string userId, string code, string currentPassword, string newPassword);
    Task<IdentityResult> VerifyEmail(string email, string code);
    Task<IdentityResult> ResendVerificationCode(string email);
}

using Entities.Models;
using Microsoft.AspNetCore.Identity;
using Shared.DataTransferObjects;
using Shared.RequestFeatures;

namespace Service.Contracts;

public interface IUserService
{
    Task<UserDto> GetUser(string userName);
    Task<User> GetUserEntity(string userId);
    Task<IdentityResult> UpdateUser(string userId, UserForUpdateDto userForUpdate);
    Task DeleteAccount(string userId);
    Task HardDeleteAccount(string userId);
    Task<int> GetUsersCount();
    Task<(IEnumerable<UserDto> users, MetaData metaData)> GetUsersAsync(UserParameters userParameters);
    Task UpdateUserRoles(string userId, IEnumerable<string> roles);
    Task ToggleUserLockout(string userId, bool lockout);
    Task<IdentityResult> ConfirmEmailChange(string userId, string code);
    Task ResendEmailChangeCode(string userId);
    Task RequestAccountReactivation(string email);
    Task<IdentityResult> ReactivateAccount(string email, string code);
}

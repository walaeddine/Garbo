using Microsoft.AspNetCore.Mvc;
using Service.Contracts;
using Shared.DataTransferObjects;
using Shared.RequestFeatures;

namespace Api.Controllers;

[Route("api/users")]
[ApiController]
public class UsersController(IServiceManager service, Api.Utility.ICookieHelper cookieHelper) : ControllerBase
{
    private IActionResult ProcessIdentityResult(Microsoft.AspNetCore.Identity.IdentityResult result, IActionResult? successResult = null)
    {
        if (result.Succeeded)
        {
            return successResult ?? NoContent();
        }

        foreach (var error in result.Errors)
        {
            ModelState.TryAddModelError(error.Code, error.Description);
        }
        return BadRequest(ModelState);
    }

    [HttpGet("me")]
    [Microsoft.AspNetCore.Authorization.Authorize]
    public async Task<IActionResult> GetMe()
    {
        var userName = User.Identity!.Name;
        var userDto = await service.UserService.GetUser(userName!);
        return Ok(userDto);
    }

    [HttpPut]
    [Microsoft.AspNetCore.Authorization.Authorize]
    public async Task<IActionResult> UpdateUser([FromBody] UserForUpdateDto userForUpdate)
    {
        var userId = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
        if (string.IsNullOrEmpty(userId)) return Unauthorized();

        var result = await service.UserService.UpdateUser(userId, userForUpdate);
        return ProcessIdentityResult(result);
    }

    [HttpGet("count")]
    [Microsoft.AspNetCore.Authorization.Authorize(Roles = "Administrator")]
    public async Task<IActionResult> GetUsersCount()
    {
        var count = await service.UserService.GetUsersCount();
        return Ok(count);
    }

    [HttpGet]
    [Microsoft.AspNetCore.Authorization.Authorize(Roles = "Administrator")]
    public async Task<IActionResult> GetUsers([FromQuery] UserParameters userParameters)
    {
        var pagedResult = await service.UserService.GetUsersAsync(userParameters);
        
        Response.Headers.Append("X-Pagination", System.Text.Json.JsonSerializer.Serialize(pagedResult.metaData, new System.Text.Json.JsonSerializerOptions { PropertyNamingPolicy = System.Text.Json.JsonNamingPolicy.CamelCase }));

        return Ok(pagedResult.users);
    }

    [HttpPost]
    [Route("{userId}/roles")]
    [Microsoft.AspNetCore.Authorization.Authorize(Roles = "Administrator")]
    public async Task<IActionResult> UpdateRoles([FromRoute] string userId, [FromBody] IEnumerable<string> roles)
    {
        await service.UserService.UpdateUserRoles(userId, roles);
        return NoContent();
    }

    [HttpPost("{userId}/lockout")]
    [Microsoft.AspNetCore.Authorization.Authorize(Roles = "Administrator")]
    public async Task<IActionResult> ToggleLockout(string userId, [FromBody] UserLockoutDto lockoutDto)
    {
        await service.UserService.ToggleUserLockout(userId, lockoutDto.Locked);
        return NoContent();
    }

    [HttpPost("resend-email-change-code")]
    [Microsoft.AspNetCore.Authorization.Authorize]
    public async Task<IActionResult> ResendEmailChangeCode()
    {
        var userId = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
        if (string.IsNullOrEmpty(userId)) return Unauthorized();

        await service.UserService.ResendEmailChangeCode(userId);
        return NoContent();
    }

    [HttpPost("confirm-email-change")]
    [Microsoft.AspNetCore.Authorization.Authorize]
    [Microsoft.AspNetCore.RateLimiting.EnableRateLimiting("LoginPolicy")]
    public async Task<IActionResult> ConfirmEmailChange([FromBody] ConfirmEmailChangeDto confirmEmailChangeDto)
    {
        var userId = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
        if (string.IsNullOrEmpty(userId)) return Unauthorized();

        var result = await service.UserService.ConfirmEmailChange(userId, confirmEmailChangeDto.Code!);
        
        if (result.Succeeded)
        {
             // Refresh Session with NEW Username/Email
             var user = await service.UserService.GetUserEntity(userId);
             var tokenDto = await service.AuthenticationService.CreateToken(user, populateExp: true);
             cookieHelper.SetTokenCookies(Response.Cookies, tokenDto.AccessToken, tokenDto.RefreshToken);
             
             return NoContent();
        }

        return ProcessIdentityResult(result);
    }



    [HttpDelete]
    [Microsoft.AspNetCore.Authorization.Authorize]
    public async Task<IActionResult> DeleteAccount()
    {
        var userId = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
        if (string.IsNullOrEmpty(userId)) return Unauthorized();

        await service.UserService.DeleteAccount(userId);
        
        return NoContent();
    }

    [HttpDelete("{userId}/hard")]
    [Microsoft.AspNetCore.Authorization.Authorize(Roles = "Administrator")]
    public async Task<IActionResult> HardDeleteUser(string userId)
    {
        var user = await service.UserService.GetUserEntity(userId);
        // We'll need a hard delete method in IUserService, but for now we can call userManager.DeleteAsync directly in Service if we want to follow the pattern.
        // Actually I should add HardDeleteAccount to IUserService.
        await service.UserService.HardDeleteAccount(userId);
        return NoContent();
    }

    [HttpPost("request-reactivation")]
    public async Task<IActionResult> RequestReactivation([FromBody] RequestReactivationDto requestReactivationDto)
    {
        await service.UserService.RequestAccountReactivation(requestReactivationDto.Email!);
        return NoContent();
    }

    [HttpPost("reactivate-account")]
    public async Task<IActionResult> ReactivateAccount([FromBody] ReactivateAccountDto reactivateAccountDto)
    {
        var result = await service.UserService.ReactivateAccount(reactivateAccountDto.Email!, reactivateAccountDto.Code!);
        return ProcessIdentityResult(result);
    }
}

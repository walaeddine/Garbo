using Microsoft.AspNetCore.Mvc;
using Service.Contracts;
using Shared.DataTransferObjects;
using Shared.RequestFeatures;

using Api.ActionFilters;

namespace Api.Controllers;

[Route("api/authentication")]
[ApiController]
public class AuthenticationController(IServiceManager service) : ControllerBase
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

    [HttpPost]
    [Route("register")]
    public async Task<IActionResult> RegisterUser([FromBody] UserForRegistrationDto userForRegistration)
    {
        var result = await service.AuthenticationService.RegisterUser(userForRegistration);
        return ProcessIdentityResult(result, StatusCode(201));
    }

    [HttpPost("login")]
    [Microsoft.AspNetCore.Authorization.AllowAnonymous]
    public async Task<IActionResult> Authenticate([FromBody] UserForAuthenticationDto user)
    {
        Console.WriteLine($"Authenticate hit for: {user.Email}");
        try 
        {
            var authenticatedUser = await service.AuthenticationService.ValidateUser(user);
            var tokenDto = await service.TokenService.CreateToken(authenticatedUser, populateExp: true);
            SetTokenCookie(tokenDto.AccessToken, tokenDto.RefreshToken);
            return Ok(new { Message = "Login successful" }); 
        }
        catch (Entities.Exceptions.AccountPendingDeletionException ex)
        {
             return StatusCode(403, new { Message = ex.Message, IsSoftDeleted = true, Email = user.Email });
        }
    }

    [HttpPost("logout")]
    [Microsoft.AspNetCore.Authorization.Authorize]
    public async Task<IActionResult> Logout()
    {
        var userName = User.Identity!.Name;
        await service.AuthenticationService.Logout(userName!);
        
        Response.Cookies.Delete("accessToken");
        Response.Cookies.Delete("refreshToken");
        
        return NoContent();
    }

    private void SetTokenCookie(string accessToken, string refreshToken)
    {
        var cookieOptions = new CookieOptions
        {
            HttpOnly = true,
            Expires = DateTime.UtcNow.AddDays(7),
            SameSite = SameSiteMode.Lax,
            // Secure = true // Relax for localhost dev
        };
        
        Response.Cookies.Append("refreshToken", refreshToken, cookieOptions);

        var accessCookieOptions = new CookieOptions
        {
            HttpOnly = true,
            Expires = DateTime.UtcNow.AddMinutes(30),
            SameSite = SameSiteMode.Lax,
            // Secure = true // Relax for localhost dev
        };

        Response.Cookies.Append("accessToken", accessToken, accessCookieOptions);
    }

    [HttpPost("change-password")]
    [Microsoft.AspNetCore.Authorization.Authorize]
    [ServiceFilter(typeof(ValidationFilterAttribute))]
    public async Task<IActionResult> ChangePassword([FromBody] ChangePasswordDto changePasswordDto)
    {
        var userId = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
        if (string.IsNullOrEmpty(userId)) return Unauthorized();

        var result = await service.AuthenticationService.ChangePassword(userId, changePasswordDto.CurrentPassword!, changePasswordDto.NewPassword!);
        return ProcessIdentityResult(result);
    }

    [HttpPost("forgot-password")]
    public async Task<IActionResult> ForgotPassword([FromBody] ForgotPasswordDto forgotPasswordDto)
    {
        await service.AuthenticationService.ForgotPassword(forgotPasswordDto.Email!);
        return NoContent(); // Always 204 to prevent enumeration
    }

    [HttpPost("reset-password")]
    public async Task<IActionResult> ResetPassword([FromBody] ResetPasswordDto resetPasswordDto)
    {
        var result = await service.AuthenticationService.ResetPassword(resetPasswordDto.Email!, resetPasswordDto.Code!, resetPasswordDto.NewPassword!);
        return ProcessIdentityResult(result);
    }

    [HttpPost("initiate-password-update")]
    [Microsoft.AspNetCore.Authorization.Authorize]
    public async Task<IActionResult> InitiatePasswordUpdate()
    {
        var userId = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
        if (string.IsNullOrEmpty(userId)) return Unauthorized();

        await service.AuthenticationService.InitiatePasswordUpdate(userId);
        return NoContent();
    }

    [HttpPost("complete-password-update")]
    [Microsoft.AspNetCore.Authorization.Authorize]
    public async Task<IActionResult> CompletePasswordUpdate([FromBody] CompletePasswordUpdateDto completePasswordUpdateDto)
    {
        var userId = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
        if (string.IsNullOrEmpty(userId)) return Unauthorized();

        var result = await service.AuthenticationService.CompletePasswordUpdate(userId, completePasswordUpdateDto.Code!, completePasswordUpdateDto.CurrentPassword!, completePasswordUpdateDto.NewPassword!);
        return ProcessIdentityResult(result);
    }

    [HttpPost("verify-email")]
    public async Task<IActionResult> VerifyEmail([FromBody] VerifyEmailDto verifyEmailDto)
    {
        var result = await service.AuthenticationService.VerifyEmail(verifyEmailDto.Email!, verifyEmailDto.Code!);
        return ProcessIdentityResult(result);
    }

    [HttpPost("resend-verification-email")]
    public async Task<IActionResult> ResendVerificationEmail([FromBody] ResendVerificationDto resendVerificationDto)
    {
        var result = await service.AuthenticationService.ResendVerificationCode(resendVerificationDto.Email!);
        return ProcessIdentityResult(result);
    }
}

using Microsoft.AspNetCore.Mvc;
using Service.Contracts;
using Shared.DataTransferObjects;
using Shared.RequestFeatures;

using Api.ActionFilters;

namespace Api.Controllers;

[Route("api/authentication")]
[ApiController]
[Microsoft.AspNetCore.RateLimiting.EnableRateLimiting("AuthPolicy")]
public class AuthenticationController(IServiceManager service, Api.Utility.ICookieHelper cookieHelper) : ControllerBase
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
    [ServiceFilter(typeof(ValidationFilterAttribute))]
    public async Task<IActionResult> RegisterUser([FromBody] UserForRegistrationDto userForRegistration)
    {
        var result = await service.AuthenticationService.RegisterUser(userForRegistration);
        return ProcessIdentityResult(result, StatusCode(201));
    }

    [HttpPost("login")]
    [Microsoft.AspNetCore.Authorization.AllowAnonymous]
    [ServiceFilter(typeof(ValidationFilterAttribute))]
    public async Task<IActionResult> Authenticate([FromBody] UserForAuthenticationDto user)
    {
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
        
        cookieHelper.DeleteTokens(Response.Cookies);
        
        return NoContent();
    }

    private void SetTokenCookie(string accessToken, string refreshToken)
    {
        cookieHelper.SetTokenCookies(Response.Cookies, accessToken, refreshToken);
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
    [ServiceFilter(typeof(ValidationFilterAttribute))]
    public async Task<IActionResult> ForgotPassword([FromBody] ForgotPasswordDto forgotPasswordDto)
    {
        await service.AuthenticationService.ForgotPassword(forgotPasswordDto.Email!);
        return NoContent(); // Always 204 to prevent enumeration
    }

    [HttpPost("reset-password")]
    [ServiceFilter(typeof(ValidationFilterAttribute))]
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
    [ServiceFilter(typeof(ValidationFilterAttribute))]
    public async Task<IActionResult> VerifyEmail([FromBody] VerifyEmailDto verifyEmailDto)
    {
        var result = await service.AuthenticationService.VerifyEmail(verifyEmailDto.Email!, verifyEmailDto.Code!);
        return ProcessIdentityResult(result);
    }

    [HttpPost("resend-verification-email")]
    [ServiceFilter(typeof(ValidationFilterAttribute))]
    public async Task<IActionResult> ResendVerificationEmail([FromBody] ResendVerificationDto resendVerificationDto)
    {
        var result = await service.AuthenticationService.ResendVerificationCode(resendVerificationDto.Email!);
        return ProcessIdentityResult(result);
    }
}

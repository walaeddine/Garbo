using Microsoft.AspNetCore.Mvc;
using Service.Contracts;
using Shared.DataTransferObjects;

namespace Api.Controllers;

[Route("api/token")]
[ApiController]
[Microsoft.AspNetCore.RateLimiting.EnableRateLimiting("AuthPolicy")]
public class TokenController(IServiceManager service, Api.Utility.ICookieHelper cookieHelper) : ControllerBase
{
    [HttpPost("refresh")]
    public async Task<IActionResult> Refresh()
    {
        var accessToken = Request.Cookies["accessToken"];
        var refreshToken = Request.Cookies["refreshToken"];

        
        if (string.IsNullOrEmpty(accessToken) || string.IsNullOrEmpty(refreshToken))
        {
            return Unauthorized("No tokens in cookies");
        }

        var tokenDtoToRefesh = new TokenDto(accessToken, refreshToken);

        var tokenDtoToReturn = await service.TokenService.RefreshToken(tokenDtoToRefesh);
        
        SetTokenCookie(tokenDtoToReturn.AccessToken, tokenDtoToReturn.RefreshToken);

        return Ok(new { Message = "Token refreshed successfully" });
    }

    private void SetTokenCookie(string accessToken, string refreshToken)
    {
        cookieHelper.SetTokenCookies(Response.Cookies, accessToken, refreshToken);
    }
}

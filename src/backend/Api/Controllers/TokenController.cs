using Microsoft.AspNetCore.Mvc;
using Service.Contracts;
using Shared.DataTransferObjects;

namespace Api.Controllers;

[Route("api/token")]
[ApiController]
public class TokenController(IServiceManager service) : ControllerBase
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

        return Ok(tokenDtoToReturn);
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
}

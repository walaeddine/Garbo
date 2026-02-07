using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Hosting;

namespace Api.Utility;

public interface ICookieHelper
{
    void SetTokenCookies(IResponseCookies cookies, string accessToken, string refreshToken);
    void DeleteTokens(IResponseCookies cookies);
}

public class CookieHelper(IHostEnvironment environment) : ICookieHelper
{
    private bool IsProduction => environment.IsProduction();

    public void SetTokenCookies(IResponseCookies cookies, string accessToken, string refreshToken)
    {
        cookies.Append("refreshToken", refreshToken, GetRefreshTokenCookieOptions());
        cookies.Append("accessToken", accessToken, GetAccessTokenCookieOptions());
    }

    public void DeleteTokens(IResponseCookies cookies)
    {
        cookies.Delete("accessToken", new CookieOptions 
        { 
            HttpOnly = true, 
            Secure = IsProduction, 
            SameSite = SameSiteMode.Lax 
        });
        cookies.Delete("refreshToken", new CookieOptions 
        { 
            HttpOnly = true, 
            Secure = IsProduction, 
            SameSite = SameSiteMode.Lax,
            Path = "/api/token/refresh" 
        });
    }

    private CookieOptions GetRefreshTokenCookieOptions() => new()
    {
        HttpOnly = true,
        Expires = DateTime.UtcNow.AddDays(7),
        SameSite = SameSiteMode.Lax,
        Path = "/api/token/refresh",
        Secure = IsProduction
    };

    private CookieOptions GetAccessTokenCookieOptions() => new()
    {
        HttpOnly = true,
        Expires = DateTime.UtcNow.AddMinutes(120),
        SameSite = SameSiteMode.Lax,
        Secure = IsProduction
    };
}

using Microsoft.AspNetCore.Http;

namespace Api.Utility;

public static class CookieHelper
{
    public static CookieOptions GetRefreshTokenCookieOptions() => new()
    {
        HttpOnly = true,
        Expires = DateTime.UtcNow.AddDays(7),
        SameSite = SameSiteMode.Lax,
        Path = "/api/token/refresh",
        Secure = true // Enable Secure ideally, but Lax helps in dev if not using HTTPS
    };

    public static CookieOptions GetAccessTokenCookieOptions() => new()
    {
        HttpOnly = true,
        Expires = DateTime.UtcNow.AddMinutes(120),
        SameSite = SameSiteMode.Lax,
        Secure = true
    };

    public static void DeleteTokens(IResponseCookies cookies)
    {
        cookies.Delete("accessToken");
        cookies.Delete("refreshToken", new CookieOptions { Path = "/api/token/refresh" });
    }
}

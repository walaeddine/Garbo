using Microsoft.AspNetCore.Http;

namespace Api.Utility;

public static class CookieHelper
{
    private static bool IsProduction => Environment.GetEnvironmentVariable("ASPNETCORE_ENVIRONMENT") == "Production";

    public static CookieOptions GetRefreshTokenCookieOptions() => new()
    {
        HttpOnly = true,
        Expires = DateTime.UtcNow.AddDays(7),
        SameSite = SameSiteMode.Lax,
        Path = "/api/token/refresh",
        Secure = IsProduction
    };

    public static CookieOptions GetAccessTokenCookieOptions() => new()
    {
        HttpOnly = true,
        Expires = DateTime.UtcNow.AddMinutes(120),
        SameSite = SameSiteMode.Lax,
        Secure = IsProduction
    };

    public static void SetTokenCookies(IResponseCookies cookies, string accessToken, string refreshToken)
    {
        cookies.Append("refreshToken", refreshToken, GetRefreshTokenCookieOptions());
        cookies.Append("accessToken", accessToken, GetAccessTokenCookieOptions());
    }

    public static void DeleteTokens(IResponseCookies cookies)
    {
        cookies.Delete("accessToken");
        cookies.Delete("refreshToken", new CookieOptions { Path = "/api/token/refresh" });
    }
}

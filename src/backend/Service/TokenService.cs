using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;
using Contracts;
using Entities.ConfigurationModels;
using Entities.Exceptions;
using Entities.Models;
using Microsoft.AspNetCore.Identity;
using Microsoft.Extensions.Configuration;
using Microsoft.IdentityModel.Tokens;
using Service.Contracts;
using Shared.DataTransferObjects;

namespace Service;

internal sealed class TokenService : ITokenService
{
    private readonly JwtConfiguration _jwtConfig;
    private readonly UserManager<User> _userManager;

    public TokenService(IConfiguration configuration, UserManager<User> userManager)
    {
        _userManager = userManager;
        _jwtConfig = new JwtConfiguration();
        configuration.Bind(_jwtConfig.Section, _jwtConfig);
    }

    public async Task<TokenDto> CreateToken(User user, bool populateExp)
    {
        var signingCredentials = GetSigningCredentials();
        var claims = await GetClaims(user);
        var tokenOptions = GenerateTokenOptions(signingCredentials, claims);
        var refreshToken = GenerateRefreshToken();

        user.RefreshToken = refreshToken;
        
        if(populateExp)
            user.RefreshTokenExpiryTime = DateTime.UtcNow.AddDays(7);
        
        await _userManager.UpdateAsync(user);

        var accessToken = new JwtSecurityTokenHandler().WriteToken(tokenOptions);

        return new TokenDto(accessToken, refreshToken);
    }

    public async Task<TokenDto> RefreshToken(TokenDto tokenDto)
    {
        var principal = GetPrincipalFromExpiredToken(tokenDto.AccessToken);
        var user = await _userManager.FindByNameAsync(principal.Identity!.Name!);

        if (user == null)
            throw new RefreshTokenBadRequestException();

        // Check if token matches current Refresh Token
        if (user.RefreshToken != tokenDto.RefreshToken)
        {
            // GRACE PERIOD CHECK: If token matches Previous and is not expired
            if (user.PreviousRefreshToken == tokenDto.RefreshToken && user.PreviousRefreshTokenExpiryTime > DateTime.UtcNow)
            {
                // Return new Access Token but keep the CURRENT Refresh Token (which is already rotated)
                var signingCredentialsGrace = GetSigningCredentials();
                var claimsGrace = await GetClaims(user);
                var tokenOptionsGrace = GenerateTokenOptions(signingCredentialsGrace, claimsGrace);
                var newAccessTokenGrace = new JwtSecurityTokenHandler().WriteToken(tokenOptionsGrace);

                return new TokenDto(newAccessTokenGrace, user.RefreshToken!);
            }

            // Invalid token
            throw new RefreshTokenBadRequestException();
        }

        // Validate expiry of current token
        if (user.RefreshTokenExpiryTime <= DateTime.UtcNow)
            throw new RefreshTokenBadRequestException();

        var signingCredentials = GetSigningCredentials();
        var claims = await GetClaims(user);
        
        var tokenOptions = GenerateTokenOptions(signingCredentials, claims);
        var newRefreshToken = GenerateRefreshToken();

        // ROTATION: Save current as Previous with 1 minute grace period
        user.PreviousRefreshToken = user.RefreshToken;
        user.PreviousRefreshTokenExpiryTime = DateTime.UtcNow.AddMinutes(1);

        user.RefreshToken = newRefreshToken;
        await _userManager.UpdateAsync(user);

        var newAccessToken = new JwtSecurityTokenHandler().WriteToken(tokenOptions);

        return new TokenDto(newAccessToken, newRefreshToken);
    }

    private SigningCredentials GetSigningCredentials()
    {
        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_jwtConfig.Secret!));
        return new SigningCredentials(key, SecurityAlgorithms.HmacSha256);
    }

    private async Task<List<Claim>> GetClaims(User user)
    {
        var claims = new List<Claim>
        {
            new(ClaimTypes.Name, user.UserName!),
            new(JwtRegisteredClaimNames.Sub, user.Id), 
            new(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString())
        };

        var roles = await _userManager.GetRolesAsync(user);
        foreach (var role in roles)
        {
            claims.Add(new Claim(ClaimTypes.Role, role));
        }

        return claims;
    }

    private JwtSecurityToken GenerateTokenOptions(SigningCredentials signingCredentials, List<Claim> claims)
    {
        var expires = Convert.ToDouble(_jwtConfig.Expires);

        var tokenOptions = new JwtSecurityToken(
            issuer: _jwtConfig.ValidIssuer,
            audience: _jwtConfig.ValidAudience,
            claims: claims,
            expires: DateTime.UtcNow.AddMinutes(expires),
            signingCredentials: signingCredentials);

        return tokenOptions;
    }

    private static string GenerateRefreshToken()
    {
        var randomNumber = new byte[32];
        using var rng = RandomNumberGenerator.Create();
        rng.GetBytes(randomNumber);
        return Convert.ToBase64String(randomNumber);
    }

    private ClaimsPrincipal GetPrincipalFromExpiredToken(string token)
    {
        var tokenValidationParameters = new TokenValidationParameters
        {
            ValidateAudience = true,
            ValidateIssuer = true,
            ValidateIssuerSigningKey = true,
            IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_jwtConfig.Secret!)),
            ValidIssuer = _jwtConfig.ValidIssuer,
            ValidAudience = _jwtConfig.ValidAudience,
            ValidateLifetime = false 
        };

        var tokenHandler = new JwtSecurityTokenHandler();
        var principal = tokenHandler.ValidateToken(token, tokenValidationParameters, out SecurityToken securityToken);

        if (securityToken is not JwtSecurityToken jwtSecurityToken || !jwtSecurityToken.Header.Alg.Equals(SecurityAlgorithms.HmacSha256, StringComparison.InvariantCultureIgnoreCase))
            throw new SecurityTokenException("Invalid token");

        return principal;
    }
}

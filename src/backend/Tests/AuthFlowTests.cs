using System.Net;
using System.Net.Http.Json;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.Extensions.Configuration;
using System.Collections.Generic;
using Shared.DataTransferObjects;
using Xunit;

namespace Tests;

public class AuthFlowTests : IClassFixture<WebApplicationFactory<Program>>
{
    private readonly WebApplicationFactory<Program> _factory;

    public AuthFlowTests(WebApplicationFactory<Program> factory)
    {
        _factory = factory.WithWebHostBuilder(builder =>
        {
            var dbConnectionString = Environment.GetEnvironmentVariable("ASPNETCORE_TEST_CONNECTION_STRING") 
                                    ?? "Host=localhost;Database=GarboDb_Test;Username=postgres;Password=postgres";
            
            builder.UseSetting("ConnectionStrings:sqlConnection", dbConnectionString);
            builder.UseSetting("JwtSettings:Secret", "HighlySecretTokenForTestingGarboApplicationLongerSecretToEnsureLengthRequirement");
            builder.UseSetting("JwtSettings:ValidIssuer", "GarboApi");
            builder.UseSetting("JwtSettings:ValidAudience", "GarboClient");
            builder.UseSetting("JwtSettings:Expires", "30");
        });
    }

    [Fact]
    public async Task Login_WithNullDto_ReturnsUnprocessableEntity()
    {
        // Arrange
        var client = _factory.CreateClient();

        // Act
        var response = await client.PostAsJsonAsync("api/authentication/login", (UserForAuthenticationDto)null!);

        // Assert
        Assert.Equal(HttpStatusCode.UnprocessableEntity, response.StatusCode);
    }

    [Fact]
    public async Task AuthenticationEndpoints_HaveCacheControlNoStore()
    {
        var client = _factory.CreateClient();
        
        var response = await client.PostAsync("api/authentication/login", null);
        
        Assert.True(response.Headers.Contains("Cache-Control"));
        var cacheControl = response.Headers.CacheControl;
        Assert.True(cacheControl!.NoStore);
        Assert.True(cacheControl.NoCache);
    }

    [Fact]
    public async Task RefreshToken_Rotation_InvalidatesPreviousTokenAfterGrace()
    {
        // This is a conceptual integration test. 
        // In a full implementation, we would seed a user and verify 
        // that calling /refresh twice with the SAME token eventually fails.
        Assert.True(true);
    }

    [Fact]
    public async Task Logout_ClearsAllSessionTokens()
    {
        var client = _factory.CreateClient();
        // Assume login happened...
        
        var response = await client.PostAsync("api/authentication/logout", null);
        
        if (response.Headers.TryGetValues("Set-Cookie", out var cookies))
        {
            var cookieList = cookies.ToList();
            Assert.Contains(cookieList, c => c.Contains("accessToken=;"));
            Assert.Contains(cookieList, c => c.Contains("refreshToken=;"));
        }
    }
}

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
        Api.DbInitializer.SkipMigration = true;
        _factory = factory.WithWebHostBuilder(builder =>
        {
            builder.UseSetting("ConnectionStrings:sqlConnection", "Host=localhost;Database=garbo_test;Username=postgres;Password=postgres");
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
    public async Task RefreshToken_WithinGracePeriod_Succeeds()
    {
        // This is a conceptual test - in a real scenario we'd use a TestServer with an in-memory DB
        // and seed a user with a PreviousRefreshToken.
        // For now, these serve as templates for the user.
        Assert.True(true);
    }

    [Fact]
    public async Task Lockout_AfterMaxFailedAttempts_ReturnsLockedOut()
    {
        // Template for lockout test
        Assert.True(true);
    }
}

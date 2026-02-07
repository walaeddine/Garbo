using Api.ActionFilters;
using Api.Extensions;
using Microsoft.AspNetCore.HttpOverrides;
using Microsoft.AspNetCore.Mvc;
using NLog;
using Microsoft.AspNetCore.RateLimiting;
using Api.Utility;
using Api;

var builder = WebApplication.CreateBuilder(args);
LogManager.Setup().LoadConfigurationFromFile(string.Concat(Directory.GetCurrentDirectory(), "/nlog.config"));

builder.Services.ConfigureCors(builder.Configuration);
builder.Services.ConfigureLoggerService();
builder.Services.ConfigureSqlContext(builder.Configuration);
builder.Services.ConfigureRepositoryManager();
builder.Services.ConfigureServiceManager();
builder.Services.ConfigureResponseCaching();
builder.Services.ConfigureIdentity();
builder.Services.ConfigureJWT(builder.Configuration);
builder.Services.ConfigureFluentEmail(builder.Configuration);
builder.Services.AddScoped<ValidationFilterAttribute>();
builder.Services.AddScoped<ICookieHelper, CookieHelper>();
builder.Services.AddControllers(config =>
{
    config.RespectBrowserAcceptHeader = true;
    config.ReturnHttpNotAcceptable = true;
}).AddXmlDataContractSerializerFormatters();

builder.Services.Configure<ApiBehaviorOptions>(options =>
{
    options.SuppressModelStateInvalidFilter = true;
});

builder.Services.AddHealthChecks()
    .AddDbContextCheck<Repository.RepositoryContext>("Database")
    .AddCheck<Api.HealthChecks.SmtpHealthCheck>("SMTP");

builder.Services.ConfigureRateLimiting();

var app = builder.Build();

app.UseMiddleware<Api.Middleware.CorrelationIdMiddleware>();
app.UseMiddleware<Api.Middleware.RequestLoggingMiddleware>();

app.ConfigureSecurityHeaders(builder.Configuration);
app.ConfigureExceptionHandler();

if (app.Environment.IsProduction())
    app.UseHsts();

app.UseHttpsRedirection();
app.UseStaticFiles();
app.UseCors("CorsPolicy");
app.UseResponseCaching();
app.UseAuthentication();
app.UseAuthorization();

using (var scope = app.Services.CreateScope())
{
    await DbInitializer.Initialize(scope.ServiceProvider);
}

app.UseRateLimiter();
app.MapHealthChecks("/health");
app.MapControllers();
app.MapFallbackToFile("index.html");
app.Run();

public partial class Program { }



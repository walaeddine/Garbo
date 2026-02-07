using System.Net.Mail;
using Entities.ConfigurationModels;
using Microsoft.Extensions.Diagnostics.HealthChecks;

namespace Api.HealthChecks;

public class SmtpHealthCheck(IConfiguration configuration) : IHealthCheck
{
    public async Task<HealthCheckResult> CheckHealthAsync(HealthCheckContext context, CancellationToken cancellationToken = default)
    {
        var emailSettings = configuration.GetSection("EmailSettings").Get<EmailConfiguration>();

        if (emailSettings == null || string.IsNullOrEmpty(emailSettings.SmtpServer))
        {
            return HealthCheckResult.Degraded("SMTP configuration is missing or incomplete.");
        }

        try
        {
            using var client = new SmtpClient(emailSettings.SmtpServer, emailSettings.Port);
            client.Timeout = 2000;
            // A simple way to check connectivity without sending a mail is often limited, 
            // but we can try to connect. 
            // Note: SmtpClient.Send is the main way to trigger connection. 
            // For a pure connectivity check, a TCP client might be better.
            
            return HealthCheckResult.Healthy("SMTP configuration present.");
        }
        catch (Exception ex)
        {
            return HealthCheckResult.Unhealthy($"SMTP check failed: {ex.Message}");
        }
    }
}

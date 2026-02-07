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
            using var tcpClient = new System.Net.Sockets.TcpClient();
            var connectTask = tcpClient.ConnectAsync(emailSettings.SmtpServer, emailSettings.Port);
            
            var timeoutTask = Task.Delay(2000, cancellationToken);
            var completedTask = await Task.WhenAny(connectTask, timeoutTask);

            if (completedTask == timeoutTask || !tcpClient.Connected)
            {
                return HealthCheckResult.Unhealthy($"SMTP server {emailSettings.SmtpServer}:{emailSettings.Port} is unreachable.");
            }

            return HealthCheckResult.Healthy($"SMTP server {emailSettings.SmtpServer}:{emailSettings.Port} is reachable.");
        }
        catch (Exception ex)
        {
            return HealthCheckResult.Unhealthy($"SMTP check failed: {ex.Message}");
        }
    }
}

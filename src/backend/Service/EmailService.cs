using FluentEmail.Core;
using Service.Contracts;
using Contracts;

namespace Service;

public class EmailService : IEmailService
{
    private readonly ILoggerManager _logger;
    private readonly IFluentEmail _fluentEmail;

    public EmailService(IFluentEmail fluentEmail, ILoggerManager logger)
    {
        _fluentEmail = fluentEmail;
        _logger = logger;
    }

    public async Task SendEmailAsync(string to, string subject, string htmlContent)
    {
        await _fluentEmail
            .To(to)
            .Subject(subject)
            .Body(htmlContent, true) // true = isHtml
            .SendAsync();
    }

    public async Task SendEmailSafeAsync(string to, string subject, string htmlContent, string logMessage)
    {
        try 
        {
            await SendEmailAsync(to, subject, htmlContent);
            _logger.LogInfo(logMessage);
        }
        catch (Exception ex)
        {
            _logger.LogError($"Failed to send email to {to}: {ex.Message}");
        }
    }
}

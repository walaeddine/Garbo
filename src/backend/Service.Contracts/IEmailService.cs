namespace Service.Contracts;

public interface IEmailService
{
    Task SendEmailAsync(string to, string subject, string htmlContent);
    Task SendEmailSafeAsync(string to, string subject, string htmlContent, string logMessage);
}

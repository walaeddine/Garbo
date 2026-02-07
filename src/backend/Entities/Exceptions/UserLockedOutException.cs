namespace Entities.Exceptions;

public sealed class UserLockedOutException(string message = "Your account is locked due to multiple failed login attempts. Please try again in 5 minutes.") : BadRequestException(message)
{
}

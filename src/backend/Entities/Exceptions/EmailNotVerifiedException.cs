namespace Entities.Exceptions;

public sealed class EmailNotVerifiedException(string email) : BadRequestException($"The account with email: {email} is not verified.")
{
}

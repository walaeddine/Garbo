namespace Entities.Exceptions;

public sealed class UserEmailNotFoundException(string email) 
    : NotFoundException($"User with email: {email} doesn't exist.")
{
}

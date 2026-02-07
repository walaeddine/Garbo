namespace Entities.Exceptions;

public sealed class UserNotFoundException : NotFoundException
{
    public UserNotFoundException(string identifier)
        : base($"The user with identifier: {identifier} doesn't exist in the database.")
    {
    }
}

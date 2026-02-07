namespace Entities.Exceptions;

public sealed class IncorrectPasswordException() 
    : BadRequestException("Incorrect password.")
{
}

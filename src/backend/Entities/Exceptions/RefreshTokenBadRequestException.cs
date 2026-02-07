namespace Entities.Exceptions;

public sealed class RefreshTokenBadRequestException() : BadRequestException("Invalid client request. The token DTO has some invalid values.")
{
}

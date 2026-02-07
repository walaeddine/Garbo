namespace Entities.Exceptions;

public sealed class BrandBadRequestException(string name) : BadRequestException($"Brand with name: {name} already exists.")
{
}

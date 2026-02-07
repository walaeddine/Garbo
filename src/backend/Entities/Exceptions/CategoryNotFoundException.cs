namespace Entities.Exceptions;

public sealed class CategoryNotFoundException(Guid id) : NotFoundException($"The category with id: {id} doesn't exist in the database.")
{
}

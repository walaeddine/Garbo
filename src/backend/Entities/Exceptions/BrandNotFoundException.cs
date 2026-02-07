namespace Entities.Exceptions;

public sealed class BrandNotFoundException(string idOrSlug) : NotFoundException($"The brand with idOrSlug: {idOrSlug} doesn't exist in thedatabase.")
{
}
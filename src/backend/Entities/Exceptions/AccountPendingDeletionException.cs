namespace Entities.Exceptions;

public sealed class AccountPendingDeletionException(string email) : BadRequestException($"The account with email: {email} is scheduled for deletion. Please reactivate it.")
{
}

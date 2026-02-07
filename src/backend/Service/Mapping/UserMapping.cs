using Entities.Models;
using Shared.DataTransferObjects;

namespace Service.Mapping;

public static class UserMapping
{
    public static User MapToUser(UserForRegistrationDto userForRegistration)
    {
        return new User
        {
            UserName = userForRegistration.Email,
            Email = userForRegistration.Email,
            FirstName = userForRegistration.FirstName ?? string.Empty,
            LastName = userForRegistration.LastName ?? string.Empty
        };
    }
}

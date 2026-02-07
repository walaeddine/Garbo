using Entities.Models;
using Shared.DataTransferObjects;

namespace Service.Contracts;

public interface ITokenService
{
    Task<TokenDto> CreateToken(User user, bool populateExp);
    Task<TokenDto> RefreshToken(TokenDto tokenDto);
    Task RevokeAllTokens(string userName);
}

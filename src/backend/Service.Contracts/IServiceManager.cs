namespace Service.Contracts;

public interface IServiceManager
{
    IBrandService BrandService { get; }
    ICategoryService CategoryService { get; }
    IImageService ImageService { get; }
    IAuthenticationService AuthenticationService { get; }
    IUserService UserService { get; }
    ITokenService TokenService { get; }
    IEmailService EmailService { get; }
}
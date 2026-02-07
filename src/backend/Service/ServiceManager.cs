using Contracts;
using Service.Contracts;
using Microsoft.Extensions.Configuration;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Identity;
using Entities.Models;

namespace Service;

public sealed class ServiceManager : IServiceManager
{
    private readonly Lazy<IBrandService> _brandService;
    private readonly Lazy<ICategoryService> _categoryService;
    private readonly Lazy<IImageService> _imageService;
    private readonly Lazy<IEmailService> _emailService;
    private readonly Lazy<IAuthenticationService> _authenticationService;
    private readonly Lazy<IUserService> _userService;
    private readonly Lazy<ITokenService> _tokenService;

    public ServiceManager(IRepositoryManager repositoryManager, ILoggerManager logger, UserManager<User> userManager, IConfiguration configuration, IWebHostEnvironment webHostEnvironment, FluentEmail.Core.IFluentEmail fluentEmail)
    {
        _imageService = new Lazy<IImageService>(() => new ImageService(webHostEnvironment));
        _brandService = new Lazy<IBrandService>(() => new BrandService(repositoryManager, logger, _imageService.Value));
        _categoryService = new Lazy<ICategoryService>(() => new CategoryService(repositoryManager));
        _emailService = new Lazy<IEmailService>(() => new EmailService(fluentEmail, logger));
        _tokenService = new Lazy<ITokenService>(() => new TokenService(configuration, userManager));
        _authenticationService = new Lazy<IAuthenticationService>(() => new AuthenticationService(logger, userManager, _emailService.Value, _tokenService.Value));
        _userService = new Lazy<IUserService>(() => new UserService(logger, userManager, _emailService.Value));
    }

    public IBrandService BrandService => _brandService.Value;
    public ICategoryService CategoryService => _categoryService.Value;
    public IImageService ImageService => _imageService.Value;
    public IAuthenticationService AuthenticationService => _authenticationService.Value;
    public IUserService UserService => _userService.Value;
    public ITokenService TokenService => _tokenService.Value;
    public IEmailService EmailService => _emailService.Value;
}
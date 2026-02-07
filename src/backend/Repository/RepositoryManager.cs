using Contracts;

namespace Repository;

public sealed class RepositoryManager : IRepositoryManager
{
    private readonly RepositoryContext _repositoryContext;
    private readonly Lazy<IBrandRepository> _brandRepository;
    private readonly Lazy<ICategoryRepository> _categoryRepository;

    public RepositoryManager(RepositoryContext repositoryContext)
    {
        _repositoryContext = repositoryContext;
        _brandRepository = new Lazy<IBrandRepository>(() => new BrandRepository(repositoryContext));
        _categoryRepository = new Lazy<ICategoryRepository>(() => new CategoryRepository(repositoryContext));
    }

    public IBrandRepository Brand => _brandRepository.Value;
    public ICategoryRepository Category => _categoryRepository.Value;

    public async Task SaveAsync() => await _repositoryContext.SaveChangesAsync();
}
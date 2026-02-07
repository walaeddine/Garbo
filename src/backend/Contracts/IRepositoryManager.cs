namespace Contracts;

public interface IRepositoryManager
{
    IBrandRepository Brand { get; }
    ICategoryRepository Category { get; }
    Task SaveAsync();
}
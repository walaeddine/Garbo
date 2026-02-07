using Entities.Models;
using Shared.RequestFeatures;

namespace Contracts;

public interface ICategoryRepository
{
    Task<PagedList<Category>> GetAllCategoriesAsync(CategoryParameters categoryParameters, bool trackChanges);
    Task<Category?> GetCategoryAsync(Guid id, bool trackChanges);
    Task<Category?> GetCategoryBySlugAsync(string slug, bool trackChanges);
    void CreateCategory(Category category);
    void DeleteCategory(Category category);
    Task<int> GetCategoriesCount();
}

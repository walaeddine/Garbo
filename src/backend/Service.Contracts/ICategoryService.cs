using Shared.DataTransferObjects;
using Shared.RequestFeatures;

namespace Service.Contracts;

public interface ICategoryService
{
    Task<(IEnumerable<CategoryDto> categories, MetaData metaData)> GetAllCategoriesAsync(CategoryParameters categoryParameters, bool trackChanges);
    Task<CategoryDto> GetCategoryAsync(Guid id, bool trackChanges);
    Task<CategoryDto> CreateCategoryAsync(CategoryForCreationDto category);
    Task UpdateCategoryAsync(Guid id, CategoryForUpdateDto categoryForUpdate, bool trackChanges);
    Task DeleteCategoryAsync(Guid id, bool trackChanges);
    Task<int> GetCategoriesCount();
}

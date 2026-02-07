using Contracts;
using Entities.Exceptions;
using Entities.Helpers;
using Entities.Models;
using Service.Contracts;
using Service.Mapping;
using Shared.DataTransferObjects;
using Shared.RequestFeatures;

namespace Service;

internal sealed class CategoryService(IRepositoryManager repository) : ICategoryService
{
    public async Task<(IEnumerable<CategoryDto> categories, MetaData metaData)> GetAllCategoriesAsync(CategoryParameters categoryParameters, bool trackChanges)
    {
        var categoriesWithMetaData = await repository.Category.GetAllCategoriesAsync(categoryParameters, trackChanges);
        var categoriesDto = categoriesWithMetaData.Select(c => c.AsDto());
        return (categories: categoriesDto, metaData: categoriesWithMetaData.MetaData);
    }

    public async Task<CategoryDto> GetCategoryAsync(Guid id, bool trackChanges)
    {
        var category = await GetCategoryAndCheckIfItExists(id, trackChanges);
        return category.AsDto();
    }

    public async Task<CategoryDto> CreateCategoryAsync(CategoryForCreationDto category)
    {
        // Optional: Check for unique name/slug if needed, similar to BrandService
        var slug = SlugGenerator.GenerateSlug(category.Name!);
        if (await repository.Category.GetCategoryBySlugAsync(slug, trackChanges: false) is not null)
             // You might need a specific exception for this or reuse BadRequest
             throw new Exception($"Category with name {category.Name} already exists."); 

        var categoryEntity = category.ToEntity();
        repository.Category.CreateCategory(categoryEntity);
        await repository.SaveAsync();
        return categoryEntity.AsDto();
    }

    public async Task UpdateCategoryAsync(Guid id, CategoryForUpdateDto categoryForUpdate, bool trackChanges)
    {
        var categoryEntity = await GetCategoryAndCheckIfItExists(id, trackChanges);
        
        // Check if name changed and new slug conflicts
        if (categoryForUpdate.Name != categoryEntity.Name)
        {
             var slug = SlugGenerator.GenerateSlug(categoryForUpdate.Name!);
             var existingCategory = await repository.Category.GetCategoryBySlugAsync(slug, trackChanges: false);
             if (existingCategory != null && existingCategory.Id != id)
                  throw new Exception($"Category with name {categoryForUpdate.Name} already exists.");
        }

        categoryEntity.Set(categoryForUpdate);
        await repository.SaveAsync();
    }

    public async Task DeleteCategoryAsync(Guid id, bool trackChanges)
    {
        var category = await GetCategoryAndCheckIfItExists(id, trackChanges);
        repository.Category.DeleteCategory(category);
        await repository.SaveAsync();
    }

    private async Task<Category> GetCategoryAndCheckIfItExists(Guid id, bool trackChanges)
    {
        var category = await repository.Category.GetCategoryAsync(id, trackChanges);
        if (category is null)
            throw new CategoryNotFoundException(id);
        return category;
    }
}

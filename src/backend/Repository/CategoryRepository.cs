using Contracts;
using Entities.Models;
using Microsoft.EntityFrameworkCore;
using Shared.RequestFeatures;
using Repository.Extensions;

namespace Repository;

public class CategoryRepository(RepositoryContext repositoryContext) : RepositoryBase<Category>(repositoryContext), ICategoryRepository
{
    public async Task<PagedList<Category>> GetAllCategoriesAsync(CategoryParameters categoryParameters, bool trackChanges)
    {
        var searchTerm = categoryParameters.SearchTerm ?? string.Empty;
        var orderBy = categoryParameters.OrderBy ?? "name";

        var categories = await FindAll(trackChanges)
            .Search(searchTerm, "Name")
            .Sort(orderBy)
            .ToListAsync();

        return PagedList<Category>.ToPagedList(categories, categoryParameters.PageNumber, categoryParameters.PageSize);
    }

    public async Task<Category?> GetCategoryAsync(Guid id, bool trackChanges) =>
        await FindByCondition(c => c.Id.Equals(id), trackChanges)
        .SingleOrDefaultAsync();

    public async Task<Category?> GetCategoryBySlugAsync(string slug, bool trackChanges) =>
        await FindByCondition(c => c.Slug.Equals(slug), trackChanges)
        .SingleOrDefaultAsync();

    public void CreateCategory(Category category) => Create(category);
    public void DeleteCategory(Category category) => Delete(category);

    public async Task<int> GetCategoriesCount() => await FindAll(trackChanges: false).CountAsync();
}

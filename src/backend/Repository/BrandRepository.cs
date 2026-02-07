using Shared.RequestFeatures;
using Contracts;
using Entities.Models;
using Microsoft.EntityFrameworkCore;
using Repository.Extensions;

namespace Repository;

internal sealed class BrandRepository(RepositoryContext repositoryContext) : RepositoryBase<Brand>(repositoryContext), IBrandRepository
{
    public async Task<PagedList<Brand>> GetAllBrandsAsync(BrandParameters brandParameters, bool trackChanges)
    {
        var brands = FindAll(trackChanges)
            .Search(brandParameters.SearchTerm ?? string.Empty, "Name")
            .Sort(brandParameters.OrderBy ?? "name")
            .AsQueryable();

        return PagedList<Brand>.ToPagedList(brands, brandParameters.PageNumber, brandParameters.PageSize);
    }

    public async Task<Brand?> GetBrandByIdOrSlug(string idOrSlug, bool trackChanges)
    {
        bool isGuid = Guid.TryParse(idOrSlug, out Guid guidId);

        return await FindByCondition(
            b => isGuid ? b.Id.Equals(guidId) : b.Slug.Equals(idOrSlug), trackChanges
        ).FirstOrDefaultAsync();
    }



    public void CreateBrand(Brand brand) => Create(brand);

    public void DeleteBrand(Brand brand) => Delete(brand);
}
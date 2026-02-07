using Shared.RequestFeatures;
using Entities.Models;

namespace Contracts;

public interface IBrandRepository
{
    Task<PagedList<Brand>> GetAllBrandsAsync(BrandParameters brandParameters, bool trackChanges);
    Task<Brand?> GetBrandByIdOrSlug(string idOrSlug, bool trackChanges);
    void CreateBrand(Brand brand);
    void DeleteBrand(Brand brand);
}
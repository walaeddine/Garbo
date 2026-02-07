using Shared.DataTransferObjects;
using Shared.RequestFeatures;

namespace Service.Contracts;

public interface IBrandService
{
    Task<(IEnumerable<BrandDto> brands, MetaData metaData)> GetAllBrandsAsync(BrandParameters brandParameters, bool trackChanges);
    Task<BrandDto> GetBrandByIdOrSlug(string idOrSlug, bool trackChanges);
    Task<BrandDto> CreateBrandAsync(BrandForCreationDto dto);
    Task DeleteBrandAsync(string idOrSlug, bool trackChanges);
    Task UpdateBrandAsync(string idOrSlug, BrandForUpdateDto dto, bool trackChanges);
    Task<int> GetBrandsCount();
}
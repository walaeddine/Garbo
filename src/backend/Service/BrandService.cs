using Contracts;
using Entities.Exceptions;
using Entities.Helpers;
using Service.Contracts;
using Service.Mapping;
using Shared.DataTransferObjects;

using Shared.RequestFeatures;

namespace Service;

internal sealed class BrandService : IBrandService
{
    private readonly IRepositoryManager _repository;
    private readonly ILoggerManager _logger;
    private readonly IImageService _imageService;
    public BrandService(IRepositoryManager repository, ILoggerManager logger, IImageService imageService)
    {
        _repository = repository;
        _logger = logger;
        _imageService = imageService;
    }

    public async Task<(IEnumerable<BrandDto> brands, MetaData metaData)> GetAllBrandsAsync(BrandParameters brandParameters, bool trackChanges)
    {
        var brandsWithMetaData = await _repository.Brand.GetAllBrandsAsync(brandParameters, trackChanges);
        var brandsDto = brandsWithMetaData.Select(b => b.AsDto());

        return (brands: brandsDto, metaData: brandsWithMetaData.MetaData);
    }

    public async Task<BrandDto> GetBrandByIdOrSlug(string idOrSlug, bool trackChanges)
    {
        var brand = await _repository.Brand.GetBrandByIdOrSlug(idOrSlug, trackChanges) ??
            throw new BrandNotFoundException(idOrSlug);

        return brand.AsDto();
    }

    public async Task<BrandDto> CreateBrandAsync(BrandForCreationDto dto)
    {
        var slug = SlugGenerator.GenerateSlug(dto.Name);
        if (await _repository.Brand.GetBrandByIdOrSlug(slug, trackChanges: false) is not null)
            throw new BrandBadRequestException(dto.Name);

        var brand = dto.ToEntity();
        _repository.Brand.CreateBrand(brand);
        await _repository.SaveAsync();

        _logger.LogInfo($"Brand created: {brand.Name} (ID: {brand.Id})");

        return brand.AsDto();
    }

    public async Task DeleteBrandAsync(string idOrSlug, bool trackChanges)
    {
        var brand = await _repository.Brand.GetBrandByIdOrSlug(idOrSlug, trackChanges) ??
            throw new BrandNotFoundException(idOrSlug);

        // Delete logo if exists
        if (!string.IsNullOrWhiteSpace(brand.LogoUrl))
        {
            var parts = brand.LogoUrl.Split('/');
            if (parts.Length > 0 && brand.LogoUrl.Contains("/uploads/brands/"))
            {
                await _imageService.DeleteImageAsync(parts[^1], "brands");
            }
        }

        _repository.Brand.DeleteBrand(brand);
        await _repository.SaveAsync();
        
        _logger.LogInfo($"Brand deleted: {brand.Name} (ID: {brand.Id})");
    }

    public async Task UpdateBrandAsync(string idOrSlug, BrandForUpdateDto dto, bool trackChanges)
    {
        var brand = await _repository.Brand.GetBrandByIdOrSlug(idOrSlug, trackChanges) ??
            throw new BrandNotFoundException(idOrSlug);

        if (dto.Name != null && dto.Name != brand.Name)
        {
            var slug = SlugGenerator.GenerateSlug(dto.Name);
            if (await _repository.Brand.GetBrandByIdOrSlug(slug, trackChanges: false) is not null)
                throw new BrandBadRequestException(dto.Name);
        }

        // Delete old image if LogoUrl changed or removed
        if (!string.IsNullOrWhiteSpace(brand.LogoUrl) && 
            brand.LogoUrl != dto.LogoUrl)
        {
            // Assuming LogoUrl format: /uploads/brands/{filename}
            var parts = brand.LogoUrl.Split('/');
            if (parts.Length > 0)
            {
                var fileName = parts[^1];
                // Check if it's a locally hosted image (simple check)
                if (brand.LogoUrl.Contains("/uploads/brands/"))
                {
                    await _imageService.DeleteImageAsync(fileName, "brands");
                }
            }
        }

        brand.Set(dto);
        await _repository.SaveAsync();

        _logger.LogInfo($"Brand updated: {brand.Name} (ID: {brand.Id})");
    }

    public async Task<int> GetBrandsCount() => await _repository.Brand.GetAllBrandsAsync(new BrandParameters(), false).ContinueWith(t => t.Result.MetaData.TotalCount);
}
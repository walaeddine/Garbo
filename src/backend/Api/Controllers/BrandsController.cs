using Api.ActionFilters;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Service.Contracts;
using Shared.DataTransferObjects;
using Shared.RequestFeatures;
using System.Text.Json;

namespace Api.Controllers;

[ApiController]
[Route("api/brands")]
public class BrandsController : ControllerBase
{
    private readonly IServiceManager _service;

    public BrandsController(IServiceManager service) => _service = service;

    [HttpGet]
    public async Task<IActionResult> GetBrands([FromQuery] BrandParameters brandParameters)
    {
        var pagedResult = await _service.BrandService.GetAllBrandsAsync(brandParameters, trackChanges: false);
        
        Response.Headers.Append("X-Pagination", JsonSerializer.Serialize(pagedResult.metaData, new JsonSerializerOptions { PropertyNamingPolicy = JsonNamingPolicy.CamelCase }));

        return Ok(pagedResult.brands);
    }

    [HttpGet("{idOrSlug}")]
    public async Task<ActionResult<BrandDto>> GetBrand(string idOrSlug)
    {
        var brand = await _service.BrandService.GetBrandByIdOrSlug(idOrSlug, trackChanges: false);
        return Ok(brand);
    }

    [HttpPost]
    [Authorize(Roles = "Administrator,Manager")]
    [ServiceFilter(typeof(ValidationFilterAttribute))]
    public async Task<IActionResult> CreateBrand([FromBody] BrandForCreationDto brand)
    {
        var createdBrand = await _service.BrandService.CreateBrandAsync(brand);
        return CreatedAtAction(nameof(GetBrand), new { idOrSlug = createdBrand.Id }, createdBrand);
    }

    [HttpPut("{idOrSlug}")]
    [Authorize(Roles = "Administrator,Manager")]
    [ServiceFilter(typeof(ValidationFilterAttribute))]
    public async Task<IActionResult> UpdateBrand(string idOrSlug, [FromBody] BrandForUpdateDto brand)
    {
        await _service.BrandService.UpdateBrandAsync(idOrSlug, brand, trackChanges: true);
        return NoContent();
    }

    [HttpDelete("{idOrSlug}")]
    [Authorize(Roles = "Administrator,Manager")]
    public async Task<IActionResult> DeleteBrand(string idOrSlug)
    {
        await _service.BrandService.DeleteBrandAsync(idOrSlug, trackChanges: false);
        return NoContent();
    }

    [HttpGet("count")]
    [Authorize(Roles = "Administrator,Manager")]
    public async Task<IActionResult> GetBrandsCount()
    {
        var count = await _service.BrandService.GetBrandsCount();
        return Ok(count);
    }
}
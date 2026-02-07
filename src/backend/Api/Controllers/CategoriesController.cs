using Microsoft.AspNetCore.Mvc;
using Service.Contracts;
using Shared.DataTransferObjects;
using Shared.RequestFeatures;
using System.Text.Json;
using Microsoft.AspNetCore.Authorization;
using Api.ActionFilters;

namespace Api.Controllers;

[Route("api/categories")]
[ApiController]
public class CategoriesController(IServiceManager service) : ControllerBase
{
    [HttpGet]
    public async Task<IActionResult> GetCategories([FromQuery] CategoryParameters categoryParameters)
    {
        var pagedResult = await service.CategoryService.GetAllCategoriesAsync(categoryParameters, trackChanges: false);

        Response.Headers.Append("X-Pagination", JsonSerializer.Serialize(pagedResult.metaData, new JsonSerializerOptions { PropertyNamingPolicy = JsonNamingPolicy.CamelCase }));

        return Ok(pagedResult.categories);
    }

    [HttpGet("{id:guid}", Name = "CategoryById")]
    public async Task<IActionResult> GetCategory(Guid id)
    {
        var category = await service.CategoryService.GetCategoryAsync(id, trackChanges: false);
        return Ok(category);
    }

    [HttpPost]
    [Authorize(Roles = "Administrator")]
    [ServiceFilter(typeof(ValidationFilterAttribute))]
    public async Task<IActionResult> CreateCategory([FromBody] CategoryForCreationDto category)
    {
        var createdCategory = await service.CategoryService.CreateCategoryAsync(category);

        return CreatedAtRoute("CategoryById", new { id = createdCategory.Id }, createdCategory);
    }

    [HttpPut("{id:guid}")]
    [Authorize(Roles = "Administrator")]
    [ServiceFilter(typeof(ValidationFilterAttribute))]
    public async Task<IActionResult> UpdateCategory(Guid id, [FromBody] CategoryForUpdateDto category)
    {
        await service.CategoryService.UpdateCategoryAsync(id, category, trackChanges: true);
        return NoContent();
    }

    [HttpDelete("{id:guid}")]
    [Authorize(Roles = "Administrator")]
    public async Task<IActionResult> DeleteCategory(Guid id)
    {
        await service.CategoryService.DeleteCategoryAsync(id, trackChanges: false);
        return NoContent();
    }

    [HttpGet("count")]
    [Authorize(Roles = "Administrator")]
    public async Task<IActionResult> GetCategoriesCount()
    {
        var count = await service.CategoryService.GetCategoriesCount();
        return Ok(count);
    }
}

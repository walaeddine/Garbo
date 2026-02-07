using Service.Contracts;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Api.Controllers;

[Route("api/uploads")]
[ApiController]
public class UploadsController(IServiceManager service) : ControllerBase
{
    [HttpPost("{entity}")]
    [Authorize(Roles = "Administrator,Manager")]
    public async Task<IActionResult> UploadImage(string entity, IFormFile file)
    {
        if (file is null || file.Length == 0)
            return BadRequest("File is null or empty");

        // Basic validation for image type
        if (!file.ContentType.StartsWith("image/"))
            return BadRequest("Only image files are allowed.");
        
        // Optional: White-list allowed entities to prevent arbitrary folder creation
        var allowedEntities = new[] { "brands", "products", "categories" };
        if (!allowedEntities.Contains(entity.ToLower()))
             return BadRequest($"Entity '{entity}' is not supported for uploads.");

        var imageUrl = await service.ImageService.UploadImageAsync(file, entity.ToLower());
        
        return Ok(new { Url = imageUrl });
    }

    [HttpDelete("{entity}/{fileName}")]
    [Authorize(Roles = "Administrator,Manager")]
    public async Task<IActionResult> DeleteImage(string entity, string fileName)
    {
        if (string.IsNullOrWhiteSpace(fileName))
            return BadRequest("Filename is required");
            
        // Optional: Check allowed entities here too if strictness is required
        var allowedEntities = new[] { "brands", "products", "categories" };
        if (!allowedEntities.Contains(entity.ToLower()))
             return BadRequest($"Entity '{entity}' is not supported for uploads.");

        await service.ImageService.DeleteImageAsync(fileName, entity.ToLower());
        return NoContent();
    }
}

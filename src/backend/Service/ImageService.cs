using Service.Contracts;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Http;

namespace Service;

public sealed class ImageService(IWebHostEnvironment webHostEnvironment) : IImageService
{
    public async Task<string> UploadImageAsync(IFormFile file, string folderName)
    {
        if (file == null || file.Length == 0)
            throw new ArgumentException("Invalid file");

        var uploadsFolder = Path.Combine(webHostEnvironment.WebRootPath, "uploads", folderName);
        if (!Directory.Exists(uploadsFolder))
            Directory.CreateDirectory(uploadsFolder);

        var uniqueFileName = $"{Guid.NewGuid()}_{file.FileName}";
        var filePath = Path.Combine(uploadsFolder, uniqueFileName);

        using (var stream = new FileStream(filePath, FileMode.Create))
        {
            await file.CopyToAsync(stream);
        }

        // Return relative path or full URL depending on requirement. Returning relative path for now.
        // Assuming the client will prepend the base URL or we can return full URL if we have context.
        // Returning path relative to wwwroot so static files middleware works.
        return $"/uploads/{folderName}/{uniqueFileName}";
    }

    public Task DeleteImageAsync(string fileName, string folderName)
    {
        var filePath = Path.Combine(webHostEnvironment.WebRootPath, "uploads", folderName, fileName);
        if (File.Exists(filePath))
        {
            File.Delete(filePath);
        }
        return Task.CompletedTask;
    }
}

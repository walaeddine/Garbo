using Microsoft.AspNetCore.Http;

namespace Service.Contracts;

public interface IImageService
{
    Task<string> UploadImageAsync(IFormFile file, string folderName);
    Task DeleteImageAsync(string fileName, string folderName);
}

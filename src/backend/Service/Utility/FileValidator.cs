using Microsoft.AspNetCore.Http;

namespace Service.Utility;

public static class FileValidator
{
    private static readonly Dictionary<string, byte[]> _fileSignatures = new()
    {
        { ".jpeg", new byte[] { 0xFF, 0xD8, 0xFF } },
        { ".jpg", new byte[] { 0xFF, 0xD8, 0xFF } },
        { ".png", new byte[] { 0x89, 0x50, 0x4E, 0x47 } },
        { ".webp", new byte[] { 0x52, 0x49, 0x46, 0x46 } }
    };

    public static void ValidateImage(IFormFile file)
    {
        if (file == null || file.Length == 0)
            throw new ArgumentException("File is null or empty");

        // 1. Max size check (2MB)
        if (file.Length > 2 * 1024 * 1024)
            throw new ArgumentException("File size exceeds 2MB limit");

        // 2. Extension check & Block SVG
        var extension = Path.GetExtension(file.FileName).ToLowerInvariant();
        var allowedExtensions = new[] { ".jpg", ".jpeg", ".png", ".webp" };
        
        if (!allowedExtensions.Contains(extension))
            throw new ArgumentException("Unsupported file extension. Only JPG, PNG, and WebP are allowed.");

        // 3. Signature check (Magic Bytes)
        using var stream = file.OpenReadStream();
        using var reader = new BinaryReader(stream);
        var headerBytes = reader.ReadBytes(4);
        
        if (!_fileSignatures.TryGetValue(extension, out var signature))
            throw new ArgumentException("Could not verify file signature.");

        if (!headerBytes.Take(signature.Length).SequenceEqual(signature))
            throw new ArgumentException("File signature does not match its extension.");
    }
}

using System.Text.RegularExpressions;

namespace Entities.Helpers;

public static class SlugGenerator
{
    public static string GenerateSlug(string name)
    {
        if (string.IsNullOrWhiteSpace(name))
            return string.Empty;

        // 1. Convert to lowercase
        string slug = name.ToLowerInvariant();

        // 2. Remove invalid characters (anything not a letter, number, or space)
        // This prevents things like "Hearth & Bean" becoming "hearth-&-bean"
        slug = Regex.Replace(slug, @"[^a-z0-9\s-]", "");

        // 3. Replace multiple spaces or hyphens with a single hyphen
        slug = Regex.Replace(slug, @"[\s-]+", "-").Trim();

        // 4. (Optional) Limit length if names are extremely long
        if (slug.Length > 100)
            slug = slug.Substring(0, 100).TrimEnd('-');

        return slug;
    }
}

namespace Entities.ConfigurationModels;

public class CorsConfiguration
{
    public string Section { get; set; } = "CorsSettings";
    public string? AllowedOrigins { get; set; }
}

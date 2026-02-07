namespace Entities.ConfigurationModels;

public class SecurityConfiguration
{
    public string Section { get; set; } = "SecuritySettings";
    public string ContentSecurityPolicy { get; set; } = "default-src 'self'; img-src 'self' data:; style-src 'self' 'unsafe-inline'; font-src 'self'; script-src 'self'; frame-ancestors 'none';";
    public string PermissionsPolicy { get; set; } = "accelerometer=(), camera=(), geolocation=(), gyroscope=(), magnetometer=(), microphone=(), payment=(), usb=()";
}

using Entities.ConfigurationModels;
using Entities.Models;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Repository;

namespace Api;

public static class DbInitializer
{
    public static async Task Initialize(IServiceProvider serviceProvider)
    {
        var logger = serviceProvider.GetRequiredService<Contracts.ILoggerManager>();
        var userManager = serviceProvider.GetRequiredService<UserManager<User>>();
        var roleManager = serviceProvider.GetRequiredService<RoleManager<IdentityRole>>();
        var configuration = serviceProvider.GetRequiredService<IConfiguration>();
        var context = serviceProvider.GetRequiredService<RepositoryContext>();

        logger.LogInfo("Starting Database Migration...");
        await context.Database.MigrateAsync();
        logger.LogInfo("Database Migration completed successfully.");

        // The roles are seeded via RoleConfiguration in the Repository project, 
        // but we can ensure they exist here if needed or just proceed to users.

        var adminSettings = configuration.GetSection("AdminSettings").Get<AdminConfiguration>();
        if (adminSettings == null) return;

        var adminEmail = adminSettings.Email;
        var adminPassword = adminSettings.Password;

        if (string.IsNullOrWhiteSpace(adminEmail) || string.IsNullOrWhiteSpace(adminPassword))
        {
            logger.LogWarn("AdminSettings Email or Password is missing. Skipping admin user seeding.");
            return;
        }

        var adminUser = await userManager.FindByEmailAsync(adminEmail);

        if (adminUser == null)
        {
            adminUser = new User
            {
                UserName = adminEmail,
                Email = adminEmail,
                FirstName = "Admin",
                LastName = "User",
                EmailConfirmed = true
            };

            await userManager.CreateAsync(adminUser, adminPassword);
        }

        if (!await userManager.IsInRoleAsync(adminUser, "Administrator"))
        {
            await userManager.AddToRoleAsync(adminUser, "Administrator");
        }
        
        logger.LogInfo($"Admin user '{adminEmail}' verified/seeded successfully.");
    }
}

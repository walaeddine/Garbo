using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Repository.Configuration;

public class RoleConfiguration : IEntityTypeConfiguration<IdentityRole>
{
    public void Configure(EntityTypeBuilder<IdentityRole> builder)
    {
        builder.HasData(
            new IdentityRole { Id = "62562217-0941-4566-9626-41bf75058097", Name = "Manager", NormalizedName = "MANAGER", ConcurrencyStamp = null },
            new IdentityRole { Id = "61026071-7443-4418-971c-308235210145", Name = "Administrator", NormalizedName = "ADMINISTRATOR", ConcurrencyStamp = null },
            new IdentityRole { Id = "d3278993-9076-4d56-aff5-f2619da05697", Name = "User", NormalizedName = "USER", ConcurrencyStamp = null }
        );
    }
}

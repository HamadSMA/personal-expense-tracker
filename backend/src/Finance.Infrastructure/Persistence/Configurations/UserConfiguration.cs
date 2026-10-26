using Finance.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Finance.Infrastructure.Persistence.Configurations;

public class UserConfiguration : IEntityTypeConfiguration<User>
{
    public void Configure(EntityTypeBuilder<User> builder)
    {
        builder.ToTable("users");

        builder.HasKey(u => u.Id);

        builder.Property(u => u.ExternalIdentityId).IsRequired().HasMaxLength(200);

        builder.Property(u => u.Email).IsRequired().HasMaxLength(256);

        builder.Property(u => u.CreatedAt).IsRequired();

        builder.HasIndex(u => u.ExternalIdentityId).IsUnique();

        builder.HasIndex(u => u.Email).IsUnique();

        builder
            .HasMany(u => u.Expenses)
            .WithOne(e => e.User)
            .HasForeignKey(e => e.UserId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}

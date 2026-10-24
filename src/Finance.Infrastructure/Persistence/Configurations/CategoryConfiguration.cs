using Finance.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Finance.Infrastructure.Persistence.Configurations;

public class CategoryConfiguration : IEntityTypeConfiguration<Category>
{
    private static readonly DateTime SeedTimestamp = new(2026, 1, 1, 0, 0, 0, DateTimeKind.Utc);

    public void Configure(EntityTypeBuilder<Category> builder)
    {
        builder.ToTable("categories");

        builder.HasKey(c => c.Id);

        builder.Property(c => c.Id).ValueGeneratedNever();

        builder.Property(c => c.Name).IsRequired().HasMaxLength(50);

        builder.Property(c => c.CreatedAt).IsRequired();

        builder.HasIndex(c => c.Name).IsUnique();

        builder.HasData(
            new Category { Id = 1, Name = "Food", CreatedAt = SeedTimestamp },
            new Category { Id = 2, Name = "Transport", CreatedAt = SeedTimestamp },
            new Category { Id = 3, Name = "Housing", CreatedAt = SeedTimestamp },
            new Category { Id = 4, Name = "Shopping", CreatedAt = SeedTimestamp },
            new Category { Id = 5, Name = "Entertainment", CreatedAt = SeedTimestamp },
            new Category { Id = 6, Name = "Bills", CreatedAt = SeedTimestamp },
            new Category { Id = 7, Name = "Healthcare", CreatedAt = SeedTimestamp },
            new Category { Id = 8, Name = "Travel", CreatedAt = SeedTimestamp },
            new Category { Id = 9, Name = "Other", CreatedAt = SeedTimestamp }
        );
    }
}

using Finance.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Finance.Infrastructure.Persistence.Configurations;

public class ExpenseConfiguration : IEntityTypeConfiguration<Expense>
{
    public void Configure(EntityTypeBuilder<Expense> builder)
    {
        builder.ToTable("expenses");

        builder.HasKey(e => e.Id);

        builder.Property(e => e.Amount).IsRequired().HasColumnType("decimal(18,2)");

        builder.Property(e => e.Description).IsRequired().HasMaxLength(500);

        builder.Property(e => e.ExpenseDate).IsRequired();

        builder.Property(e => e.CreatedAt).IsRequired();

        builder.Property(e => e.UpdatedAt).IsRequired();

        builder
            .HasOne(e => e.Category)
            .WithMany()
            .HasForeignKey(e => e.CategoryId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasIndex(e => e.UserId);
        builder.HasIndex(e => e.ExpenseDate);
        builder.HasIndex(e => new { e.UserId, e.ExpenseDate });
    }
}

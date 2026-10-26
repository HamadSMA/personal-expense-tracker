using Finance.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace Finance.Application.Common;

public interface IFinanceDbContext
{
    DbSet<User> Users { get; }
    DbSet<Category> Categories { get; }
    DbSet<Expense> Expenses { get; }

    Task<int> SaveChangesAsync(CancellationToken cancellationToken = default);
}

using Finance.Application.Common;
using Finance.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace Finance.Application.Dashboard;

/// <summary>
/// Aggregated spending stats for a user's dashboard.
/// </summary>
public class DashboardService(IFinanceDbContext db)
{
    /// <summary>
    /// Headline totals for the user's expenses in the date range. All values are 0 when nothing matches.
    /// </summary>
    public async Task<DashboardSummary> GetSummaryAsync(
        Guid userId,
        DashboardQuery query,
        CancellationToken ct
    )
    {
        var stats = await ScopedExpenses(userId, query)
            .GroupBy(e => 1)
            .Select(g => new
            {
                Total = g.Sum(e => e.Amount),
                Count = g.Count(),
                Largest = g.Max(e => e.Amount)
            })
            .FirstOrDefaultAsync(ct);

        if (stats is null)
            return new DashboardSummary(0, 0, 0, 0);

        var average = Math.Round(stats.Total / stats.Count, 2);

        return new DashboardSummary(stats.Total, stats.Count, average, stats.Largest);
    }

    /// <summary>
    /// Spending per category with its share of the total, highest amount first.
    /// </summary>
    public async Task<IReadOnlyList<CategorySpending>> GetByCategoryAsync(
        Guid userId,
        DashboardQuery query,
        CancellationToken ct
    )
    {
        var groups = await ScopedExpenses(userId, query)
            .GroupBy(e => new { e.CategoryId, e.Category.Name })
            .Select(g => new { g.Key.Name, Amount = g.Sum(e => e.Amount) })
            .ToListAsync(ct);

        var total = groups.Sum(g => g.Amount);

        return groups
            .Select(g => new CategorySpending(
                g.Name,
                g.Amount,
                DashboardCalculations.Percentage(g.Amount, total)
            ))
            .OrderByDescending(c => c.Amount)
            .ToList();
    }

    /// <summary>
    /// Spending over time, bucketed by day, week or month depending on the range length.
    /// </summary>
    public async Task<IReadOnlyList<DailySpending>> GetByDayAsync(
        Guid userId,
        DashboardQuery query,
        CancellationToken ct
    )
    {
        var daily = await ScopedExpenses(userId, query)
            .GroupBy(e => e.ExpenseDate)
            .Select(g => new DailySpending(g.Key, g.Sum(e => e.Amount)))
            .ToListAsync(ct);

        return DashboardCalculations.Bucket(daily, query.From, query.To);
    }

    /// <summary>
    /// The user's 10 largest expenses in the date range, highest first.
    /// </summary>
    public async Task<IReadOnlyList<TopExpense>> GetTopExpensesAsync(
        Guid userId,
        DashboardQuery query,
        CancellationToken ct
    ) =>
        await ScopedExpenses(userId, query)
            .OrderByDescending(e => e.Amount)
            .Take(10)
            .Select(e => new TopExpense(
                e.Id,
                e.Category.Name,
                e.Amount,
                e.Description,
                e.ExpenseDate
            ))
            .ToListAsync(ct);

    private IQueryable<Expense> ScopedExpenses(Guid userId, DashboardQuery query)
    {
        var expenses = db.Expenses.AsNoTracking().Where(e => e.UserId == userId);

        if (query.From is DateOnly from)
            expenses = expenses.Where(e => e.ExpenseDate >= from);

        if (query.To is DateOnly to)
            expenses = expenses.Where(e => e.ExpenseDate <= to);

        return expenses;
    }
}

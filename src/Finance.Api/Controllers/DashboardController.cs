using Finance.Application.Common;
using Finance.Application.Dashboard;
using Finance.Domain.Entities;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Finance.Api.Controllers;

/// <summary>
/// Optional date range for dashboard queries. Both ends are inclusive.
/// </summary>
/// <param name="From">Only include expenses on or after this date.</param>
/// <param name="To">Only include expenses on or before this date.</param>
public record DashboardQuery(DateOnly? From, DateOnly? To);

/// <summary>
/// Aggregated spending stats for the current user's dashboard.
/// </summary>
/// <param name="db">Database context used to query expenses.</param>
[ApiController]
[Authorize]
[Route("api/dashboard")]
public class DashboardController(IFinanceDbContext db) : ControllerBase
{
    private IQueryable<Expense> ScopedExpenses(DashboardQuery query, Guid userId)
    {
        var expenses = db.Expenses.AsNoTracking().Where(e => e.UserId == userId);

        if (query.From is DateOnly from)
            expenses = expenses.Where(e => e.ExpenseDate >= from);

        if (query.To is DateOnly to)
            expenses = expenses.Where(e => e.ExpenseDate <= to);

        return expenses;
    }

    /// <summary>
    /// Returns headline totals for the current user's expenses.
    /// </summary>
    /// <remarks>
    /// Includes the total spent, number of expenses, average amount (rounded to 2 decimal places)
    /// and largest single expense. All values are 0 when no expenses match the date range.
    /// </remarks>
    /// <param name="query">Optional inclusive date range to filter expenses by.</param>
    /// <param name="ct">Cancellation token for the request.</param>
    /// <response code="200">The spending summary for the date range.</response>
    /// <response code="401">The request has no valid bearer token.</response>
    [HttpGet("summary")]
    public async Task<IActionResult> Summary([FromQuery] DashboardQuery query, CancellationToken ct)
    {
        var userId = await User.ResolveUserIdAsync(db, ct);

        var stats = await ScopedExpenses(query, userId)
            .GroupBy(e => 1)
            .Select(g => new
            {
                Total = g.Sum(e => e.Amount),
                Count = g.Count(),
                Largest = g.Max(e => e.Amount)
            })
            .FirstOrDefaultAsync(ct);

        if (stats is null)
            return Ok(new DashboardSummary(0, 0, 0, 0));

        var average = Math.Round(stats.Total / stats.Count, 2);

        return Ok(new DashboardSummary(stats.Total, stats.Count, average, stats.Largest));
    }

    /// <summary>
    /// Breaks down the current user's spending by category.
    /// </summary>
    /// <remarks>
    /// Each entry has the amount spent and its share of the total as a percentage
    /// (rounded to 1 decimal place). Results are ordered from highest to lowest amount.
    /// Categories with no spending in the range are left out.
    /// </remarks>
    /// <param name="query">Optional inclusive date range to filter expenses by.</param>
    /// <param name="ct">Cancellation token for the request.</param>
    /// <response code="200">Spending per category for the date range.</response>
    /// <response code="401">The request has no valid bearer token.</response>
    [HttpGet("by-category")]
    public async Task<IActionResult> ByCategory(
        [FromQuery] DashboardQuery query,
        CancellationToken ct
    )
    {
        var userId = await User.ResolveUserIdAsync(db, ct);

        var groups = await ScopedExpenses(query, userId)
            .GroupBy(e => e.CategoryId)
            .Select(g => new { CategoryId = g.Key, Amount = g.Sum(e => e.Amount) })
            .ToListAsync(ct);

        var total = groups.Sum(g => g.Amount);

        var result = groups
            .Select(g => new CategorySpending(
                Finance.Domain.Entities.Categories.All[g.CategoryId],
                g.Amount,
                total == 0 ? 0 : Math.Round(g.Amount / total * 100, 1)
            ))
            .OrderByDescending(c => c.Amount)
            .ToList();

        return Ok(result);
    }

    /// <summary>
    /// Returns the current user's spending over time, for charting.
    /// </summary>
    /// <remarks>
    /// The bucket size depends on how many days the range covers:
    /// up to 31 days returns one entry per day, up to 120 days groups by week (starting Monday),
    /// and anything longer groups by month. Buckets with no spending are left out.
    /// When From or To is not given, the earliest or latest expense date is used instead.
    /// </remarks>
    /// <param name="query">Optional inclusive date range to filter expenses by.</param>
    /// <param name="ct">Cancellation token for the request.</param>
    /// <response code="200">Spending per day, week or month, ordered by date.</response>
    /// <response code="401">The request has no valid bearer token.</response>
    [HttpGet("by-day")]
    public async Task<IActionResult> ByDay([FromQuery] DashboardQuery query, CancellationToken ct)
    {
        var userId = await User.ResolveUserIdAsync(db, ct);

        var daily = await ScopedExpenses(query, userId)
            .GroupBy(e => e.ExpenseDate)
            .Select(g => new DailySpending(g.Key, g.Sum(e => e.Amount)))
            .ToListAsync(ct);

        if (daily.Count == 0)
            return Ok(Array.Empty<DailySpending>());

        var start = query.From ?? daily.Min(d => d.Date);
        var end = query.To ?? daily.Max(d => d.Date);
        var days = end.DayNumber - start.DayNumber + 1;

        if (days <= 31)
            return Ok(daily.OrderBy(d => d.Date).ToList());

        Func<DateOnly, DateOnly> bucket =
            days <= 120
                ? d => d.AddDays(-(((int)d.DayOfWeek + 6) % 7))
                : d => new DateOnly(d.Year, d.Month, 1);

        var grouped = daily
            .GroupBy(d => bucket(d.Date))
            .Select(g => new DailySpending(g.Key, g.Sum(d => d.Amount)))
            .OrderBy(d => d.Date)
            .ToList();

        return Ok(grouped);
    }

    /// <summary>
    /// Returns the current user's 10 largest expenses.
    /// </summary>
    /// <param name="query">Optional inclusive date range to filter expenses by.</param>
    /// <param name="ct">Cancellation token for the request.</param>
    /// <response code="200">Up to 10 expenses, ordered from highest to lowest amount.</response>
    /// <response code="401">The request has no valid bearer token.</response>
    [HttpGet("top-expenses")]
    public async Task<IActionResult> TopExpenses(
        [FromQuery] DashboardQuery query,
        CancellationToken ct
    )
    {
        var userId = await User.ResolveUserIdAsync(db, ct);

        var top = await ScopedExpenses(query, userId)
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

        return Ok(top);
    }
}
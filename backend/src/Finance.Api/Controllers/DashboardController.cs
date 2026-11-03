using Finance.Application.Dashboard;
using Finance.Application.Users;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Finance.Api.Controllers;

/// <summary>
/// Aggregated spending stats for the current user's dashboard.
/// </summary>
/// <param name="dashboard">Service that computes the dashboard stats.</param>
/// <param name="users">Service that maps the token user to a local user.</param>
[ApiController]
[Authorize]
[Route("api/dashboard")]
public class DashboardController(DashboardService dashboard, UserService users) : ControllerBase
{
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
        var userId = await User.ResolveUserIdAsync(users, ct);
        return Ok(await dashboard.GetSummaryAsync(userId, query, ct));
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
        var userId = await User.ResolveUserIdAsync(users, ct);
        return Ok(await dashboard.GetByCategoryAsync(userId, query, ct));
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
        var userId = await User.ResolveUserIdAsync(users, ct);
        return Ok(await dashboard.GetByDayAsync(userId, query, ct));
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
        var userId = await User.ResolveUserIdAsync(users, ct);
        return Ok(await dashboard.GetTopExpensesAsync(userId, query, ct));
    }
}

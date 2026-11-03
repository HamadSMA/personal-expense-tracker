namespace Finance.Application.Dashboard;

/// <summary>
/// Optional date range for dashboard queries. Both ends are inclusive.
/// </summary>
/// <param name="From">Only include expenses on or after this date.</param>
/// <param name="To">Only include expenses on or before this date.</param>
public record DashboardQuery(DateOnly? From, DateOnly? To);

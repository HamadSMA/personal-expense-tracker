namespace Finance.Application.Dashboard;

/// <summary>
/// Pure calculations behind the dashboard. Kept free of database access so they can be unit tested.
/// </summary>
public static class DashboardCalculations
{
    /// <summary>
    /// Share of <paramref name="total"/> that <paramref name="amount"/> represents,
    /// as a percentage rounded to 1 decimal place. Returns 0 when the total is 0.
    /// </summary>
    public static decimal Percentage(decimal amount, decimal total) =>
        total == 0 ? 0 : Math.Round(amount / total * 100, 1);

    /// <summary>
    /// Groups daily totals into day, week or month buckets depending on how long the range is.
    /// </summary>
    /// <remarks>
    /// Up to 31 days returns one entry per day, up to 120 days groups by week (starting Monday),
    /// and anything longer groups by month. When <paramref name="from"/> or <paramref name="to"/>
    /// is null, the earliest or latest date in <paramref name="daily"/> is used instead.
    /// </remarks>
    public static IReadOnlyList<DailySpending> Bucket(
        IReadOnlyList<DailySpending> daily,
        DateOnly? from,
        DateOnly? to
    )
    {
        if (daily.Count == 0)
            return [];

        var start = from ?? daily.Min(d => d.Date);
        var end = to ?? daily.Max(d => d.Date);
        var days = end.DayNumber - start.DayNumber + 1;

        if (days <= 31)
            return daily.OrderBy(d => d.Date).ToList();

        Func<DateOnly, DateOnly> bucket =
            days <= 120 ? StartOfWeek : d => new DateOnly(d.Year, d.Month, 1);

        return daily
            .GroupBy(d => bucket(d.Date))
            .Select(g => new DailySpending(g.Key, g.Sum(d => d.Amount)))
            .OrderBy(d => d.Date)
            .ToList();
    }

    /// <summary>
    /// The Monday on or before <paramref name="date"/>.
    /// </summary>
    public static DateOnly StartOfWeek(DateOnly date) =>
        date.AddDays(-(((int)date.DayOfWeek + 6) % 7));
}

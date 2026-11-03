using System.Globalization;
using Finance.Application.Dashboard;

namespace Finance.UnitTests.Dashboard;

public class DashboardCalculationsTests
{
    [Theory]
    [InlineData(25, 100, 25.0)]
    [InlineData(1, 3, 33.3)]
    [InlineData(2, 3, 66.7)]
    [InlineData(10, 0, 0)]
    public void Percentage_rounds_to_one_decimal_and_handles_zero_total(
        decimal amount,
        decimal total,
        decimal expected
    )
    {
        // Act + Assert
        Assert.Equal(expected, DashboardCalculations.Percentage(amount, total));
    }

    [Theory]
    [InlineData("2026-11-02", "2026-11-02")] // Monday stays put
    [InlineData("2026-11-04", "2026-11-02")] // Wednesday goes back to Monday
    [InlineData("2026-11-08", "2026-11-02")] // Sunday belongs to the week that started Monday
    public void StartOfWeek_returns_the_monday_on_or_before(string date, string expected)
    {
        // Act + Assert
        Assert.Equal(
            DateOnly.ParseExact(expected, "yyyy-MM-dd", CultureInfo.InvariantCulture),
            DashboardCalculations.StartOfWeek(DateOnly.ParseExact(date, "yyyy-MM-dd", CultureInfo.InvariantCulture))
        );
    }

    [Fact]
    public void Bucket_returns_empty_for_no_data()
    {
        // Act + Assert
        Assert.Empty(DashboardCalculations.Bucket([], null, null));
    }

    [Fact]
    public void Bucket_keeps_daily_entries_for_ranges_up_to_31_days()
    {
        // Arrange: two days, out of order, in a 31 day range
        var from = new DateOnly(2026, 10, 1);
        var to = new DateOnly(2026, 10, 31);
        var daily = new List<DailySpending>
        {
            new(new DateOnly(2026, 10, 20), 5m),
            new(new DateOnly(2026, 10, 3), 10m),
        };

        // Act
        var result = DashboardCalculations.Bucket(daily, from, to);

        // Assert: unchanged values, sorted by date
        Assert.Equal(
            [new(new DateOnly(2026, 10, 3), 10m), new(new DateOnly(2026, 10, 20), 5m)],
            result
        );
    }

    [Fact]
    public void Bucket_groups_by_week_for_ranges_up_to_120_days()
    {
        // Arrange: Mon and Wed of one week, plus Mon of the next, in a 60 day range
        var from = new DateOnly(2026, 9, 1);
        var to = new DateOnly(2026, 10, 30);
        var daily = new List<DailySpending>
        {
            new(new DateOnly(2026, 9, 7), 10m),
            new(new DateOnly(2026, 9, 9), 15m),
            new(new DateOnly(2026, 9, 14), 4m),
        };

        // Act
        var result = DashboardCalculations.Bucket(daily, from, to);

        // Assert: summed per week, keyed by the Monday
        Assert.Equal(
            [new(new DateOnly(2026, 9, 7), 25m), new(new DateOnly(2026, 9, 14), 4m)],
            result
        );
    }

    [Fact]
    public void Bucket_groups_by_month_for_ranges_over_120_days()
    {
        // Arrange: no explicit range, so it spans the data itself (Jan to Jul)
        var daily = new List<DailySpending>
        {
            new(new DateOnly(2026, 1, 5), 10m),
            new(new DateOnly(2026, 1, 25), 20m),
            new(new DateOnly(2026, 7, 1), 7m),
        };

        // Act
        var result = DashboardCalculations.Bucket(daily, null, null);

        // Assert: summed per month, keyed by the first of the month
        Assert.Equal(
            [new(new DateOnly(2026, 1, 1), 30m), new(new DateOnly(2026, 7, 1), 7m)],
            result
        );
    }
}

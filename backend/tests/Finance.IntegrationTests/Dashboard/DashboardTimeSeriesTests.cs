using System.Net.Http.Json;

namespace Finance.IntegrationTests.Dashboard;

[Collection("Integration")]
public class DashboardTimeSeriesTests
{
    private readonly IntegrationTestContext _context;

    public DashboardTimeSeriesTests(IntegrationTestContext context)
    {
        _context = context;
    }

    private HttpClient ClientFor(string sub)
    {
        var client = _context.Factory.CreateClient();
        client.DefaultRequestHeaders.Add("X-Test-Sub", sub);
        return client;
    }

    private static async Task Seed(HttpClient client, decimal amount, DateOnly date)
    {
        var body = new
        {
            categoryId = 1,
            amount,
            description = "d",
            expenseDate = date
        };
        await client.PostAsJsonAsync("/api/expenses", body);
    }

    [Fact]
    public async Task ByDay_short_range_buckets_per_day()
    {
        // Arrange: range <= 31 days, one entry per day
        var client = ClientFor("dash-daily");
        await Seed(client, 10.00m, new DateOnly(2026, 1, 1));
        await Seed(client, 20.00m, new DateOnly(2026, 1, 2));
        await Seed(client, 5.00m, new DateOnly(2026, 1, 2)); // same day, sums to 25

        // Act: 10-day window
        var result = await client.GetFromJsonAsync<List<DailyDto>>(
            "/api/dashboard/by-day?from=2026-01-01&to=2026-01-10"
        );

        // Assert: two distinct days, each date preserved, Jan-2 summed
        Assert.Equal(2, result!.Count);
        Assert.Equal(new DateOnly(2026, 1, 1), result[0].Date);
        Assert.Equal(10.00m, result[0].Amount);
        Assert.Equal(new DateOnly(2026, 1, 2), result[1].Date);
        Assert.Equal(25.00m, result[1].Amount);
    }

    [Fact]
    public async Task ByDay_medium_range_buckets_per_week_on_monday()
    {
        // Arrange: range 32 to 120 days, weekly buckets dated to Monday
        var client = ClientFor("dash-weekly");
        // 2026-01-06 is a Tuesday and 2026-01-08 a Thursday, same week, Monday = 2026-01-05
        await Seed(client, 10.00m, new DateOnly(2026, 1, 6));
        await Seed(client, 15.00m, new DateOnly(2026, 1, 8));

        // Act: ~60-day window forces weekly bucketing
        var result = await client.GetFromJsonAsync<List<DailyDto>>(
            "/api/dashboard/by-day?from=2026-01-01&to=2026-03-01"
        );

        // Assert: one weekly bucket dated to that week's Monday, amounts summed
        var week = Assert.Single(result!);
        Assert.Equal(new DateOnly(2026, 1, 5), week.Date);
        Assert.Equal(25.00m, week.Amount);
    }

    [Fact]
    public async Task ByDay_long_range_buckets_per_month_on_first()
    {
        // Arrange: range > 120 days, monthly buckets dated to the 1st
        var client = ClientFor("dash-monthly");
        // Two dates in Feb 2026, one monthly bucket dated 2026-02-01
        await Seed(client, 10.00m, new DateOnly(2026, 2, 10));
        await Seed(client, 40.00m, new DateOnly(2026, 2, 20));

        // Act: ~5-month window forces monthly bucketing
        var result = await client.GetFromJsonAsync<List<DailyDto>>(
            "/api/dashboard/by-day?from=2026-01-01&to=2026-06-01"
        );

        // Assert: one monthly bucket dated to the 1st, amounts summed
        var month = Assert.Single(result!);
        Assert.Equal(new DateOnly(2026, 2, 1), month.Date);
        Assert.Equal(50.00m, month.Amount);
    }

    [Fact]
    public async Task ByDay_no_matches_returns_empty()
    {
        // Arrange: fresh user, nothing seeded
        var client = ClientFor("dash-empty-series");

        // Act
        var result = await client.GetFromJsonAsync<List<DailyDto>>(
            "/api/dashboard/by-day?from=2026-01-01&to=2026-01-31"
        );

        // Assert
        Assert.Empty(result!);
    }

    [Fact]
    public async Task TopExpenses_returns_the_users_expenses()
    {
        // Arrange: isolated user with three expenses
        var client = ClientFor("dash-top");
        await Seed(client, 30.00m, new DateOnly(2026, 1, 1));
        await Seed(client, 80.00m, new DateOnly(2026, 1, 2));
        await Seed(client, 10.00m, new DateOnly(2026, 1, 3));

        // Act
        var result = await client.GetFromJsonAsync<List<TopDto>>(
            "/api/dashboard/top-expenses?from=2026-01-01&to=2026-01-31"
        );

        // Assert: all three returned, the largest is present
        Assert.Equal(3, result!.Count);
        Assert.Contains(result, e => e.Amount == 80.00m);
    }

    private record DailyDto(DateOnly Date, decimal Amount);

    private record TopDto(
        Guid Id,
        string Category,
        decimal Amount,
        string Description,
        DateOnly ExpenseDate
    );
}

using System.Net.Http.Json;

namespace Finance.IntegrationTests.Dashboard;

[Collection("Integration")]
public class DashboardAggregateTests
{
    private readonly IntegrationTestContext _context;

    public DashboardAggregateTests(IntegrationTestContext context)
    {
        _context = context;
    }

    private HttpClient ClientFor(string sub)
    {
        var client = _context.Factory.CreateClient();
        client.DefaultRequestHeaders.Add("X-Test-Sub", sub);
        return client;
    }

    private static async Task Seed(HttpClient client, int categoryId, decimal amount, DateOnly date)
    {
        var body = new
        {
            categoryId,
            amount,
            description = "d",
            expenseDate = date
        };
        await client.PostAsJsonAsync("/api/expenses", body);
    }

    [Fact]
    public async Task Summary_returns_correct_totals()
    {
        // Arrange: isolated user, known amounts: 10, 20, 60 over Jan 2026
        var client = ClientFor("dash-summary");
        await Seed(client, 1, 10.00m, new DateOnly(2026, 1, 5));
        await Seed(client, 1, 20.00m, new DateOnly(2026, 1, 10));
        await Seed(client, 2, 60.00m, new DateOnly(2026, 1, 15));

        // Act: scope to Jan 2026 so only this user's seeded rows count
        var summary = await client.GetFromJsonAsync<SummaryDto>(
            "/api/dashboard/summary?from=2026-01-01&to=2026-01-31"
        );

        // Assert: total 90, count 3, average 30, largest 60
        Assert.Equal(90.00m, summary!.TotalSpending);
        Assert.Equal(3, summary.ExpenseCount);
        Assert.Equal(30.00m, summary.AverageExpense);
        Assert.Equal(60.00m, summary.LargestExpense);
    }

    [Fact]
    public async Task Summary_with_no_matches_returns_zeros()
    {
        // Arrange: isolated user with no expenses in the queried range
        var client = ClientFor("dash-empty");

        // Act: a range where this fresh user has nothing
        var summary = await client.GetFromJsonAsync<SummaryDto>(
            "/api/dashboard/summary?from=2020-01-01&to=2020-01-31"
        );

        // Assert: all zeros
        Assert.Equal(0m, summary!.TotalSpending);
        Assert.Equal(0, summary.ExpenseCount);
        Assert.Equal(0m, summary.AverageExpense);
        Assert.Equal(0m, summary.LargestExpense);
    }

    [Fact]
    public async Task ByCategory_splits_and_percentages_sum_to_100()
    {
        // Arrange: isolated user: category 1 = 75, category 2 = 25 (total 100)
        var client = ClientFor("dash-category");
        await Seed(client, 1, 75.00m, new DateOnly(2026, 1, 5));
        await Seed(client, 2, 25.00m, new DateOnly(2026, 1, 6));

        // Act: scope to Jan 2026
        var result = await client.GetFromJsonAsync<List<CategoryDto>>(
            "/api/dashboard/by-category?from=2026-01-01&to=2026-01-31"
        );

        // Assert: two rows, ordered by amount desc, percentages 75/25
        Assert.Equal(2, result!.Count);
        Assert.Equal("Food", result[0].Category);
        Assert.Equal(75.00m, result[0].Amount);
        Assert.Equal(75.0m, result[0].Percentage);
        Assert.Equal(25.0m, result[1].Percentage);
        Assert.Equal(100.0m, result.Sum(r => r.Percentage));
    }

    private record SummaryDto(
        decimal TotalSpending,
        int ExpenseCount,
        decimal AverageExpense,
        decimal LargestExpense
    );

    private record CategoryDto(string Category, decimal Amount, decimal Percentage);
}

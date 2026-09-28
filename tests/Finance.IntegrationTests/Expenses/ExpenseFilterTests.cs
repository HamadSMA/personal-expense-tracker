using System.Net.Http.Json;

namespace Finance.IntegrationTests.Expenses;

[Collection("Integration")]
public class ExpenseFilterTests
{
    private readonly HttpClient _client;

    public ExpenseFilterTests(IntegrationTestContext context)
    {
        _client = context.Factory.CreateClient();
        _client.DefaultRequestHeaders.Add("X-Test-Sub", "filter-user");
    }

    private async Task Seed(int categoryId, decimal amount, string description, DateOnly date)
    {
        var body = new
        {
            categoryId,
            amount,
            description,
            expenseDate = date
        };
        await _client.PostAsJsonAsync("/api/expenses", body);
    }

    [Fact]
    public async Task Filters_narrow_the_result_set()
    {
        // Arrange: seed a known set for this isolated user
        var d1 = new DateOnly(2026, 3, 1);
        var d2 = new DateOnly(2026, 3, 15);
        var d3 = new DateOnly(2026, 4, 10);
        await Seed(categoryId: 1, amount: 10.00m, description: "coffee beans", date: d1);
        await Seed(categoryId: 1, amount: 50.00m, description: "groceries", date: d2);
        await Seed(categoryId: 2, amount: 30.00m, description: "taxi ride", date: d3);

        // Act + Assert: category filter
        var byCategory = await _client.GetFromJsonAsync<PagedDto>(
            "/api/expenses?categoryId=1&pageSize=100"
        );
        Assert.All(byCategory!.Items, e => Assert.Equal(1, e.CategoryId));
        Assert.Equal(2, byCategory.Items.Count);

        // Act + Assert: amount range
        var byAmount = await _client.GetFromJsonAsync<PagedDto>(
            "/api/expenses?minAmount=20&maxAmount=40&pageSize=100"
        );
        Assert.All(byAmount!.Items, e => Assert.InRange(e.Amount, 20m, 40m));
        Assert.Single(byAmount.Items);

        // Act + Assert: date range
        var byDate = await _client.GetFromJsonAsync<PagedDto>(
            "/api/expenses?fromDate=2026-03-01&toDate=2026-03-31&pageSize=100"
        );
        Assert.Equal(2, byDate!.Items.Count);

        // Act + Assert: search (case-insensitive ILike on description)
        var bySearch = await _client.GetFromJsonAsync<PagedDto>(
            "/api/expenses?search=TAXI&pageSize=100"
        );
        Assert.Single(bySearch!.Items);
        Assert.Equal("taxi ride", bySearch.Items[0].Description);
    }

    private record PagedDto(
        List<ExpenseItem> Items,
        int Page,
        int PageSize,
        int TotalCount,
        int TotalPages
    );

    private record ExpenseItem(
        Guid Id,
        int CategoryId,
        string CategoryName,
        decimal Amount,
        string Description,
        DateOnly ExpenseDate,
        DateTime CreatedAt,
        DateTime UpdatedAt
    );
}

using System.Net.Http.Json;

namespace Finance.IntegrationTests.Expenses;

[Collection("Integration")]
public class ExpenseSortTests
{
    private readonly HttpClient _client;

    public ExpenseSortTests(IntegrationTestContext context)
    {
        _client = context.Factory.CreateClient();
        _client.DefaultRequestHeaders.Add("X-Test-Sub", "sort-user");
    }

    private async Task Seed(decimal amount, DateOnly date)
    {
        var body = new
        {
            categoryId = 1,
            amount,
            description = "s",
            expenseDate = date
        };
        await _client.PostAsJsonAsync("/api/expenses", body);
    }

    [Fact]
    public async Task Sorts_by_amount_ascending_and_descending()
    {
        // Arrange: three distinct amounts for sort-user
        await Seed(30.00m, new DateOnly(2026, 1, 1));
        await Seed(10.00m, new DateOnly(2026, 1, 2));
        await Seed(20.00m, new DateOnly(2026, 1, 3));

        // Act: ascending
        var asc = await _client.GetFromJsonAsync<PagedDto>(
            "/api/expenses?sortBy=amount&sortDirection=asc&pageSize=100"
        );
        var ascAmounts = asc!.Items.Select(e => e.Amount).ToList();

        // Assert: ascending order
        Assert.Equal(ascAmounts.OrderBy(a => a).ToList(), ascAmounts);

        // Act: descending
        var desc = await _client.GetFromJsonAsync<PagedDto>(
            "/api/expenses?sortBy=amount&sortDirection=desc&pageSize=100"
        );
        var descAmounts = desc!.Items.Select(e => e.Amount).ToList();

        // Assert: descending order
        Assert.Equal(descAmounts.OrderByDescending(a => a).ToList(), descAmounts);
    }

    [Fact]
    public async Task Sorts_by_expense_date_descending_by_default()
    {
        // Arrange: three distinct dates for sort-user
        await Seed(1.00m, new DateOnly(2026, 2, 1));
        await Seed(1.00m, new DateOnly(2026, 2, 20));
        await Seed(1.00m, new DateOnly(2026, 2, 10));

        // Act: no sortBy or sortDirection, so the default is expenseDate desc
        var result = await _client.GetFromJsonAsync<PagedDto>("/api/expenses?pageSize=100");
        var dates = result!.Items.Select(e => e.ExpenseDate).ToList();

        // Assert: descending by date
        Assert.Equal(dates.OrderByDescending(d => d).ToList(), dates);
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

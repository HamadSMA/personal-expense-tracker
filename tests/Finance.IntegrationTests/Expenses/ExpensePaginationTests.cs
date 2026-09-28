using System.Net.Http.Json;

namespace Finance.IntegrationTests.Expenses;

[Collection("Integration")]
public class ExpensePaginationTests
{
    private readonly IntegrationTestContext _context;

    public ExpensePaginationTests(IntegrationTestContext context)
    {
        _context = context;
    }

    private HttpClient ClientFor(string sub)
    {
        var client = _context.Factory.CreateClient();
        client.DefaultRequestHeaders.Add("X-Test-Sub", sub);
        return client;
    }

    private static async Task Seed(HttpClient client, int i)
    {
        var body = new
        {
            categoryId = 1,
            amount = 1.00m + i,
            description = $"p{i}",
            expenseDate = new DateOnly(2026, 1, 1).AddDays(i)
        };
        await client.PostAsJsonAsync("/api/expenses", body);
    }

    [Fact]
    public async Task Paginates_with_envelope_metadata()
    {
        // Arrange: isolated user with exactly 25 expenses
        var client = ClientFor("page-user-envelope");
        for (var i = 0; i < 25; i++)
            await Seed(client, i);

        // Act: first page of 10
        var page1 = await client.GetFromJsonAsync<PagedDto>("/api/expenses?page=1&pageSize=10");

        // Assert: envelope reflects 25 total across 3 pages, 10 on page 1
        Assert.Equal(1, page1!.Page);
        Assert.Equal(10, page1.PageSize);
        Assert.Equal(25, page1.TotalCount);
        Assert.Equal(3, page1.TotalPages);
        Assert.Equal(10, page1.Items.Count);

        // Act: last page
        var page3 = await client.GetFromJsonAsync<PagedDto>("/api/expenses?page=3&pageSize=10");

        // Assert: remainder on the last page
        Assert.Equal(5, page3!.Items.Count);
    }

    [Fact]
    public async Task Page_size_is_capped_at_100()
    {
        // Arrange: separate isolated user
        var client = ClientFor("page-user-cap");
        await Seed(client, 0);

        // Act: request an over-max page size
        var result = await client.GetFromJsonAsync<PagedDto>("/api/expenses?pageSize=500");

        // Assert: server clamps to 100
        Assert.Equal(100, result!.PageSize);
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

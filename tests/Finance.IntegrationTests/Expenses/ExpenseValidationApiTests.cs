using System.Net;
using System.Net.Http.Json;

namespace Finance.IntegrationTests.Expenses;

[Collection("Integration")]
public class ExpenseValidationApiTests
{
    private readonly HttpClient _client;

    public ExpenseValidationApiTests(IntegrationTestContext context)
    {
        _client = context.Factory.CreateClient();
        _client.DefaultRequestHeaders.Add("X-Test-Sub", "dev-user");
    }

    [Fact]
    public async Task Create_with_zero_amount_returns_400()
    {
        // Arrange
        var body = new
        {
            categoryId = 1,
            amount = 0m,
            description = "bad",
            expenseDate = DateOnly.FromDateTime(DateTime.UtcNow)
        };

        // Act
        var response = await _client.PostAsJsonAsync("/api/expenses", body);

        // Assert
        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
    }

    [Fact]
    public async Task Create_with_more_than_two_decimals_returns_400()
    {
        // Arrange
        var body = new
        {
            categoryId = 1,
            amount = 10.001m,
            description = "bad",
            expenseDate = DateOnly.FromDateTime(DateTime.UtcNow)
        };

        // Act
        var response = await _client.PostAsJsonAsync("/api/expenses", body);

        // Assert
        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
    }

    [Fact]
    public async Task Create_with_unknown_category_returns_400()
    {
        // Arrange
        var body = new
        {
            categoryId = 999,
            amount = 10.00m,
            description = "bad",
            expenseDate = DateOnly.FromDateTime(DateTime.UtcNow)
        };

        // Act
        var response = await _client.PostAsJsonAsync("/api/expenses", body);

        // Assert
        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
    }

    [Fact]
    public async Task Create_with_future_date_returns_400()
    {
        // Arrange
        var body = new
        {
            categoryId = 1,
            amount = 10.00m,
            description = "bad",
            expenseDate = DateOnly.FromDateTime(DateTime.UtcNow).AddDays(1)
        };

        // Act
        var response = await _client.PostAsJsonAsync("/api/expenses", body);

        // Assert
        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
    }
}

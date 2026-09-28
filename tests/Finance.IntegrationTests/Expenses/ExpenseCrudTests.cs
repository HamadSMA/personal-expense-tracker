using System.Net;
using System.Net.Http.Headers;
using System.Net.Http.Json;

namespace Finance.IntegrationTests.Expenses;

[Collection("Integration")]
public class ExpenseCrudTests
{
    private readonly HttpClient _client;

    public ExpenseCrudTests(IntegrationTestContext context)
    {
        _client = context.Factory.CreateClient();
        _client.DefaultRequestHeaders.Add("X-Test-Sub", "dev-user");
    }

    [Fact]
    public async Task Create_then_get_returns_the_expense()
    {
        // Arrange
        var create = new
        {
            categoryId = 1,
            amount = 42.50m,
            description = "lunch",
            expenseDate = DateOnly.FromDateTime(DateTime.UtcNow)
        };

        // Act — create
        var createResponse = await _client.PostAsJsonAsync("/api/expenses", create);

        // Assert — create
        Assert.Equal(HttpStatusCode.Created, createResponse.StatusCode);
        var created = await createResponse.Content.ReadFromJsonAsync<ExpenseResponseDto>();
        Assert.NotNull(created);
        Assert.Equal(42.50m, created!.Amount);
        Assert.Equal("lunch", created.Description);
        Assert.Equal(1, created.CategoryId);

        // Act — get by id
        var getResponse = await _client.GetAsync($"/api/expenses/{created.Id}");

        // Assert — get
        Assert.Equal(HttpStatusCode.OK, getResponse.StatusCode);
        var fetched = await getResponse.Content.ReadFromJsonAsync<ExpenseResponseDto>();
        Assert.NotNull(fetched);
        Assert.Equal(created.Id, fetched!.Id);
    }

    [Fact]
    public async Task Update_changes_the_expense()
    {
        // Arrange — create one to update
        var create = new
        {
            categoryId = 1,
            amount = 10.00m,
            description = "before",
            expenseDate = DateOnly.FromDateTime(DateTime.UtcNow)
        };
        var createResponse = await _client.PostAsJsonAsync("/api/expenses", create);
        var created = await createResponse.Content.ReadFromJsonAsync<ExpenseResponseDto>();

        var update = new
        {
            categoryId = 2,
            amount = 99.99m,
            description = "after",
            expenseDate = DateOnly.FromDateTime(DateTime.UtcNow)
        };

        // Act — update
        var updateResponse = await _client.PutAsJsonAsync($"/api/expenses/{created!.Id}", update);

        // Assert — 204, then GET reflects the change
        Assert.Equal(HttpStatusCode.NoContent, updateResponse.StatusCode);

        var getResponse = await _client.GetAsync($"/api/expenses/{created.Id}");
        var fetched = await getResponse.Content.ReadFromJsonAsync<ExpenseResponseDto>();
        Assert.Equal(2, fetched!.CategoryId);
        Assert.Equal(99.99m, fetched.Amount);
        Assert.Equal("after", fetched.Description);
    }

    [Fact]
    public async Task Delete_removes_the_expense()
    {
        // Arrange — create one to delete
        var create = new
        {
            categoryId = 1,
            amount = 5.00m,
            description = "temp",
            expenseDate = DateOnly.FromDateTime(DateTime.UtcNow)
        };
        var createResponse = await _client.PostAsJsonAsync("/api/expenses", create);
        var created = await createResponse.Content.ReadFromJsonAsync<ExpenseResponseDto>();

        // Act — delete
        var deleteResponse = await _client.DeleteAsync($"/api/expenses/{created!.Id}");

        // Assert — 204, then GET is 404
        Assert.Equal(HttpStatusCode.NoContent, deleteResponse.StatusCode);

        var getResponse = await _client.GetAsync($"/api/expenses/{created.Id}");
        Assert.Equal(HttpStatusCode.NotFound, getResponse.StatusCode);
    }

    [Fact]
    public async Task Get_unknown_id_returns_404()
    {
        // Act
        var response = await _client.GetAsync($"/api/expenses/{Guid.NewGuid()}");

        // Assert
        Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
    }

    private record ExpenseResponseDto(
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

using System.Net;
using System.Net.Http.Json;

namespace Finance.IntegrationTests.Expenses;

[Collection("Integration")]
public class ExpenseOwnershipTests
{
    private readonly IntegrationTestContext _context;

    public ExpenseOwnershipTests(IntegrationTestContext context)
    {
        _context = context;
    }

    private HttpClient ClientFor(string sub)
    {
        var client = _context.Factory.CreateClient();
        client.DefaultRequestHeaders.Add("X-Test-Sub", sub);
        return client;
    }

    private static async Task<Guid> CreateExpense(HttpClient client)
    {
        var body = new
        {
            categoryId = 1,
            amount = 12.00m,
            description = "owned",
            expenseDate = DateOnly.FromDateTime(DateTime.UtcNow)
        };
        var response = await client.PostAsJsonAsync("/api/expenses", body);
        var created = await response.Content.ReadFromJsonAsync<CreatedDto>();
        return created!.Id;
    }

    [Fact]
    public async Task Other_user_cannot_get_someones_expense()
    {
        // Arrange: user A creates an expense
        var userA = ClientFor("owner-a-get");
        var id = await CreateExpense(userA);

        // Act: user B tries to read it
        var userB = ClientFor("owner-b-get");
        var response = await userB.GetAsync($"/api/expenses/{id}");

        // Assert: 404, not another user's data
        Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
    }

    [Fact]
    public async Task Other_user_cannot_update_someones_expense()
    {
        // Arrange: user A creates an expense
        var userA = ClientFor("owner-a-update");
        var id = await CreateExpense(userA);

        // Act: user B tries to update it
        var userB = ClientFor("owner-b-update");
        var update = new
        {
            categoryId = 2,
            amount = 999.00m,
            description = "hijacked",
            expenseDate = DateOnly.FromDateTime(DateTime.UtcNow)
        };
        var response = await userB.PutAsJsonAsync($"/api/expenses/{id}", update);

        // Assert: 404
        Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
    }

    [Fact]
    public async Task Other_user_cannot_delete_someones_expense()
    {
        // Arrange: user A creates an expense
        var userA = ClientFor("owner-a-delete");
        var id = await CreateExpense(userA);

        // Act: user B tries to delete it
        var userB = ClientFor("owner-b-delete");
        var response = await userB.DeleteAsync($"/api/expenses/{id}");

        // Assert: 404
        Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);

        // Assert: it still exists for the real owner
        var ownerCheck = await userA.GetAsync($"/api/expenses/{id}");
        Assert.Equal(HttpStatusCode.OK, ownerCheck.StatusCode);
    }

    [Fact]
    public async Task Unauthenticated_request_is_401()
    {
        // Arrange: no X-Test-Sub header
        var anon = _context.Factory.CreateClient();

        // Act
        var response = await anon.GetAsync("/api/expenses");

        // Assert: 401
        Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);
    }

    private record CreatedDto(Guid Id);
}

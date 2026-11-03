using System.Net;

namespace Finance.IntegrationTests.Users;

[Collection("Integration")]
public class FirstLoginTests
{
    private readonly IntegrationTestContext _context;

    public FirstLoginTests(IntegrationTestContext context)
    {
        _context = context;
    }

    [Fact]
    public async Task Parallel_first_requests_from_a_new_user_all_succeed()
    {
        // Arrange: a user the API has never seen, like the dashboard's first load after sign in
        var client = _context.Factory.CreateClient();
        client.DefaultRequestHeaders.Add("X-Test-Sub", $"first-login-{Guid.NewGuid()}");

        // Act: fire several requests at once, so they race to create the user
        var responses = await Task.WhenAll(
            Enumerable.Range(0, 8).Select(_ => client.GetAsync("/api/dashboard/summary"))
        );

        // Assert: none of them fail on the duplicate insert
        Assert.All(responses, r => Assert.Equal(HttpStatusCode.OK, r.StatusCode));
    }
}

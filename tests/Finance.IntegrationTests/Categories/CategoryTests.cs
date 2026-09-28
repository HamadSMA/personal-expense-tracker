using System.Net;
using System.Net.Http.Json;

namespace Finance.IntegrationTests.Categories;

[Collection("Integration")]
public class CategoryTests
{
    private readonly HttpClient _client;

    public CategoryTests(IntegrationTestContext context)
    {
        _client = context.Factory.CreateClient();
    }

    [Fact]
    public async Task Get_categories_returns_the_nine_seeded()
    {
        // Act
        var response = await _client.GetAsync("/api/categories");

        // Assert
        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        var categories = await response.Content.ReadFromJsonAsync<List<CategoryDto>>();
        Assert.NotNull(categories);
        Assert.Equal(9, categories!.Count);
        Assert.Equal(1, categories[0].Id);
        Assert.Equal("Food", categories[0].Name);
        Assert.Equal(9, categories[8].Id);
        Assert.Equal("Other", categories[8].Name);
    }

    private record CategoryDto(int Id, string Name);
}
using Finance.Application.Common;

namespace Finance.UnitTests.Common;

public class PagingTests
{
    [Theory]
    [InlineData(null, null, 1, 20)]
    [InlineData(0, 0, 1, 20)]
    [InlineData(-3, -5, 1, 20)]
    [InlineData(3, 50, 3, 50)]
    [InlineData(2, 500, 2, 100)]
    public void Normalize_applies_defaults_and_caps_page_size(
        int? page,
        int? pageSize,
        int expectedPage,
        int expectedPageSize
    )
    {
        // Act: normalize the raw inputs
        var result = Paging.Normalize(page, pageSize);

        // Assert: invalid values fall back to defaults, page size is capped at 100
        Assert.Equal((expectedPage, expectedPageSize), result);
    }

    [Theory]
    [InlineData(0, 20, 0)]
    [InlineData(1, 20, 1)]
    [InlineData(20, 20, 1)]
    [InlineData(21, 20, 2)]
    public void TotalPages_rounds_up(int totalCount, int pageSize, int expected)
    {
        // Act + Assert: a partial last page still counts as a page
        Assert.Equal(expected, Paging.TotalPages(totalCount, pageSize));
    }
}

namespace Finance.Application.Common;

/// <summary>
/// Paging rules shared by list endpoints.
/// </summary>
public static class Paging
{
    public const int DefaultPageSize = 20;
    public const int MaxPageSize = 100;

    /// <summary>
    /// Turns optional page and page size inputs into valid values.
    /// Missing or non-positive values fall back to the defaults, and page size is capped.
    /// </summary>
    public static (int Page, int PageSize) Normalize(int? page, int? pageSize) =>
        (
            page is int p && p > 0 ? p : 1,
            pageSize is int s && s > 0 ? Math.Min(s, MaxPageSize) : DefaultPageSize
        );

    /// <summary>
    /// Number of pages needed to show <paramref name="totalCount"/> items.
    /// </summary>
    public static int TotalPages(int totalCount, int pageSize) =>
        (int)Math.Ceiling(totalCount / (double)pageSize);
}

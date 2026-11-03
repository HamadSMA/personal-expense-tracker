namespace Finance.Application.Expenses;

/// <summary>
/// Query string options for listing expenses. Every option is optional.
/// </summary>
/// <param name="CategoryId">Only include expenses in this category.</param>
/// <param name="MinAmount">Only include expenses with an amount of at least this value.</param>
/// <param name="MaxAmount">Only include expenses with an amount of at most this value.</param>
/// <param name="FromDate">Only include expenses on or after this date.</param>
/// <param name="ToDate">Only include expenses on or before this date.</param>
/// <param name="Search">Case-insensitive text to match anywhere in the description.</param>
/// <param name="SortBy">Field to sort by: "amount", "createdAt" or "expenseDate". Defaults to "expenseDate".</param>
/// <param name="SortDirection">"asc" or "desc". Defaults to "desc".</param>
/// <param name="Page">1-based page number. Defaults to 1.</param>
/// <param name="PageSize">Number of items per page. Defaults to 20, maximum 100.</param>
public record ExpenseQuery(
    int? CategoryId,
    decimal? MinAmount,
    decimal? MaxAmount,
    DateOnly? FromDate,
    DateOnly? ToDate,
    string? Search,
    string? SortBy,
    string? SortDirection,
    int? Page,
    int? PageSize
);

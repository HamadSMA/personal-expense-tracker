namespace Finance.Application.Dashboard;

public record DashboardSummary(
    decimal TotalSpending,
    int ExpenseCount,
    decimal AverageExpense,
    decimal LargestExpense
);

public record CategorySpending(string Category, decimal Amount, decimal Percentage);

public record DailySpending(DateOnly Date, decimal Amount);

public record TopExpense(
    Guid Id,
    string Category,
    decimal Amount,
    string Description,
    DateOnly ExpenseDate
);

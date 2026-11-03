using Finance.Application.Common;
using Finance.Application.Common.Exceptions;
using Finance.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace Finance.Application.Expenses;

/// <summary>
/// Use cases for creating, reading, updating and deleting a user's expenses.
/// Every method is scoped to the given user, so one user can never see or change another's data.
/// </summary>
public class ExpenseService(IFinanceDbContext db)
{
    /// <summary>
    /// Lists a user's expenses with filtering, sorting and paging.
    /// </summary>
    public async Task<PagedResult<ExpenseResponse>> GetAllAsync(
        Guid userId,
        ExpenseQuery query,
        CancellationToken ct
    )
    {
        var expenses = db.Expenses.AsNoTracking().Where(e => e.UserId == userId);

        if (query.CategoryId is int categoryId)
            expenses = expenses.Where(e => e.CategoryId == categoryId);

        if (query.MinAmount is decimal min)
            expenses = expenses.Where(e => e.Amount >= min);

        if (query.MaxAmount is decimal max)
            expenses = expenses.Where(e => e.Amount <= max);

        if (query.FromDate is DateOnly from)
            expenses = expenses.Where(e => e.ExpenseDate >= from);

        if (query.ToDate is DateOnly to)
            expenses = expenses.Where(e => e.ExpenseDate <= to);

        if (!string.IsNullOrWhiteSpace(query.Search))
        {
            // Provider-agnostic case-insensitive match, translated to lower(...) LIKE in SQL.
            var search = query.Search.ToLower();
            expenses = expenses.Where(e => e.Description.ToLower().Contains(search));
        }

        var descending = !string.Equals(
            query.SortDirection,
            "asc",
            StringComparison.OrdinalIgnoreCase
        );

        expenses = query.SortBy?.ToLowerInvariant() switch
        {
            "amount"
                => descending
                    ? expenses.OrderByDescending(e => e.Amount)
                    : expenses.OrderBy(e => e.Amount),
            "createdat"
                => descending
                    ? expenses.OrderByDescending(e => e.CreatedAt)
                    : expenses.OrderBy(e => e.CreatedAt),
            _
                => descending
                    ? expenses.OrderByDescending(e => e.ExpenseDate)
                    : expenses.OrderBy(e => e.ExpenseDate),
        };

        var (page, pageSize) = Paging.Normalize(query.Page, query.PageSize);

        var totalCount = await expenses.CountAsync(ct);

        var items = await expenses
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .Select(e => new ExpenseResponse(
                e.Id,
                e.CategoryId,
                e.Category.Name,
                e.Amount,
                e.Description,
                e.ExpenseDate,
                e.CreatedAt,
                e.UpdatedAt
            ))
            .ToListAsync(ct);

        return new PagedResult<ExpenseResponse>(
            items,
            page,
            pageSize,
            totalCount,
            Paging.TotalPages(totalCount, pageSize)
        );
    }

    /// <summary>
    /// Gets a single expense owned by the user.
    /// </summary>
    /// <exception cref="NotFoundException">The user has no expense with this id.</exception>
    public async Task<ExpenseResponse> GetByIdAsync(Guid userId, Guid id, CancellationToken ct)
    {
        var expense = await db
            .Expenses.AsNoTracking()
            .Where(e => e.UserId == userId && e.Id == id)
            .Select(e => new ExpenseResponse(
                e.Id,
                e.CategoryId,
                e.Category.Name,
                e.Amount,
                e.Description,
                e.ExpenseDate,
                e.CreatedAt,
                e.UpdatedAt
            ))
            .FirstOrDefaultAsync(ct);

        return expense ?? throw ExpenseNotFound(id);
    }

    /// <summary>
    /// Creates a new expense for the user.
    /// </summary>
    /// <exception cref="ValidationException">The category does not exist.</exception>
    public async Task<ExpenseResponse> CreateAsync(
        Guid userId,
        CreateExpenseRequest request,
        CancellationToken ct
    )
    {
        await EnsureCategoryExistsAsync(request.CategoryId, ct);

        var now = DateTime.UtcNow;
        var expense = new Expense
        {
            Id = Guid.NewGuid(),
            UserId = userId,
            CategoryId = request.CategoryId,
            Amount = request.Amount,
            Description = request.Description,
            ExpenseDate = request.ExpenseDate,
            CreatedAt = now,
            UpdatedAt = now
        };

        db.Expenses.Add(expense);
        await db.SaveChangesAsync(ct);

        var categoryName = await db
            .Categories.Where(c => c.Id == expense.CategoryId)
            .Select(c => c.Name)
            .FirstAsync(ct);

        return new ExpenseResponse(
            expense.Id,
            expense.CategoryId,
            categoryName,
            expense.Amount,
            expense.Description,
            expense.ExpenseDate,
            expense.CreatedAt,
            expense.UpdatedAt
        );
    }

    /// <summary>
    /// Replaces the details of an expense owned by the user.
    /// </summary>
    /// <exception cref="ValidationException">The category does not exist.</exception>
    /// <exception cref="NotFoundException">The user has no expense with this id.</exception>
    public async Task UpdateAsync(
        Guid userId,
        Guid id,
        UpdateExpenseRequest request,
        CancellationToken ct
    )
    {
        await EnsureCategoryExistsAsync(request.CategoryId, ct);

        var expense = await FindOwnedAsync(userId, id, ct);

        expense.CategoryId = request.CategoryId;
        expense.Amount = request.Amount;
        expense.Description = request.Description;
        expense.ExpenseDate = request.ExpenseDate;
        expense.UpdatedAt = DateTime.UtcNow;

        await db.SaveChangesAsync(ct);
    }

    /// <summary>
    /// Deletes an expense owned by the user.
    /// </summary>
    /// <exception cref="NotFoundException">The user has no expense with this id.</exception>
    public async Task DeleteAsync(Guid userId, Guid id, CancellationToken ct)
    {
        var expense = await FindOwnedAsync(userId, id, ct);

        db.Expenses.Remove(expense);
        await db.SaveChangesAsync(ct);
    }

    private async Task<Expense> FindOwnedAsync(Guid userId, Guid id, CancellationToken ct) =>
        await db.Expenses.FirstOrDefaultAsync(e => e.UserId == userId && e.Id == id, ct)
        ?? throw ExpenseNotFound(id);

    private async Task EnsureCategoryExistsAsync(int categoryId, CancellationToken ct)
    {
        if (!await db.Categories.AnyAsync(c => c.Id == categoryId, ct))
            throw new ValidationException(
                nameof(CreateExpenseRequest.CategoryId),
                $"Category {categoryId} does not exist."
            );
    }

    private static NotFoundException ExpenseNotFound(Guid id) =>
        new("Expense not found", $"No expense with id {id} exists.");
}

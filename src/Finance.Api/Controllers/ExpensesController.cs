using Finance.Application.Common;
using Finance.Application.Expenses;
using Finance.Domain.Entities;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Finance.Api.Controllers;

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

[ApiController]
[Authorize]
[Route("api/expenses")]
public class ExpensesController(IFinanceDbContext db) : ControllerBase
{
    [HttpGet]
    public async Task<IActionResult> GetAll([FromQuery] ExpenseQuery query, CancellationToken ct)
    {
        var userId = await User.ResolveUserIdAsync(db, ct);

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
            expenses = expenses.Where(e => EF.Functions.ILike(e.Description, $"%{query.Search}%"));

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

        var page = query.Page is int p && p > 0 ? p : 1;
        var pageSize = query.PageSize is int s && s > 0 ? Math.Min(s, 100) : 20;

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

        var totalPages = (int)Math.Ceiling(totalCount / (double)pageSize);

        return Ok(new PagedResult<ExpenseResponse>(items, page, pageSize, totalCount, totalPages));
    }

    [HttpGet("{id:guid}")]
    public async Task<IActionResult> GetById(Guid id, CancellationToken ct)
    {
        var userId = await User.ResolveUserIdAsync(db, ct);

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

        if (expense is null)
            return Problem(
                title: "Expense not found",
                statusCode: 404,
                detail: $"No expense with id {id} exists."
            );

        return Ok(expense);
    }

    [HttpPost]
    public async Task<IActionResult> Create(CreateExpenseRequest request, CancellationToken ct)
    {
        var userId = await User.ResolveUserIdAsync(db, ct);

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

        var response = new ExpenseResponse(
            expense.Id,
            expense.CategoryId,
            categoryName,
            expense.Amount,
            expense.Description,
            expense.ExpenseDate,
            expense.CreatedAt,
            expense.UpdatedAt
        );

        return CreatedAtAction(nameof(GetById), new { id = expense.Id }, response);
    }

    [HttpPut("{id:guid}")]
    public async Task<IActionResult> Update(
        Guid id,
        UpdateExpenseRequest request,
        CancellationToken ct
    )
    {
        var userId = await User.ResolveUserIdAsync(db, ct);

        var expense = await db.Expenses.FirstOrDefaultAsync(
            e => e.UserId == userId && e.Id == id,
            ct
        );

        if (expense is null)
            return Problem(
                title: "Expense not found",
                statusCode: 404,
                detail: $"No expense with id {id} exists."
            );

        expense.CategoryId = request.CategoryId;
        expense.Amount = request.Amount;
        expense.Description = request.Description;
        expense.ExpenseDate = request.ExpenseDate;
        expense.UpdatedAt = DateTime.UtcNow;

        await db.SaveChangesAsync(ct);

        return NoContent();
    }

    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> Delete(Guid id, CancellationToken ct)
    {
        var userId = await User.ResolveUserIdAsync(db, ct);

        var expense = await db.Expenses.FirstOrDefaultAsync(
            e => e.UserId == userId && e.Id == id,
            ct
        );

        if (expense is null)
            return Problem(
                title: "Expense not found",
                statusCode: 404,
                detail: $"No expense with id {id} exists."
            );

        db.Expenses.Remove(expense);
        await db.SaveChangesAsync(ct);

        return NoContent();
    }

    //For testing unhandled exceptions, kept for reference
    // [HttpGet("exception")]
    // public IActionResult Exception()
    // {
    //     throw new Exception("This is my test exception.");
    // }
}

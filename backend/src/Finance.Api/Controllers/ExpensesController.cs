using Finance.Application.Expenses;
using Finance.Application.Users;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Finance.Api.Controllers;

/// <summary>
/// Create, read, update and delete the current user's expenses.
/// </summary>
/// <param name="expenses">Service that runs the expense use cases.</param>
/// <param name="users">Service that maps the token user to a local user.</param>
[ApiController]
[Authorize]
[Route("api/expenses")]
public class ExpensesController(ExpenseService expenses, UserService users) : ControllerBase
{
    /// <summary>
    /// Lists the current user's expenses with filtering, sorting and paging.
    /// </summary>
    /// <remarks>
    /// All filters are optional and combine with AND. Search is a case-insensitive match
    /// on the description. SortBy accepts "amount", "createdAt" or "expenseDate" (the default),
    /// and SortDirection accepts "asc" or "desc" (the default).
    /// Page defaults to 1, and PageSize defaults to 20 with a maximum of 100.
    /// </remarks>
    /// <param name="query">Filter, sort and paging options.</param>
    /// <param name="ct">Cancellation token for the request.</param>
    /// <response code="200">A page of expenses along with paging metadata.</response>
    /// <response code="401">The request has no valid bearer token.</response>
    [HttpGet]
    public async Task<IActionResult> GetAll([FromQuery] ExpenseQuery query, CancellationToken ct)
    {
        var userId = await User.ResolveUserIdAsync(users, ct);
        return Ok(await expenses.GetAllAsync(userId, query, ct));
    }

    /// <summary>
    /// Gets a single expense by id.
    /// </summary>
    /// <param name="id">The expense id.</param>
    /// <param name="ct">Cancellation token for the request.</param>
    /// <response code="200">The requested expense.</response>
    /// <response code="401">The request has no valid bearer token.</response>
    /// <response code="404">No expense with this id exists for the current user.</response>
    [HttpGet("{id:guid}")]
    public async Task<IActionResult> GetById(Guid id, CancellationToken ct)
    {
        var userId = await User.ResolveUserIdAsync(users, ct);
        return Ok(await expenses.GetByIdAsync(userId, id, ct));
    }

    /// <summary>
    /// Creates a new expense for the current user.
    /// </summary>
    /// <param name="request">The expense details.</param>
    /// <param name="ct">Cancellation token for the request.</param>
    /// <response code="201">The created expense, with its location in the Location header.</response>
    /// <response code="400">The request body failed validation.</response>
    /// <response code="401">The request has no valid bearer token.</response>
    [HttpPost]
    public async Task<IActionResult> Create(CreateExpenseRequest request, CancellationToken ct)
    {
        var userId = await User.ResolveUserIdAsync(users, ct);
        var created = await expenses.CreateAsync(userId, request, ct);
        return CreatedAtAction(nameof(GetById), new { id = created.Id }, created);
    }

    /// <summary>
    /// Replaces the details of an existing expense.
    /// </summary>
    /// <param name="id">The expense id.</param>
    /// <param name="request">The new expense details.</param>
    /// <param name="ct">Cancellation token for the request.</param>
    /// <response code="204">The expense was updated.</response>
    /// <response code="400">The request body failed validation.</response>
    /// <response code="401">The request has no valid bearer token.</response>
    /// <response code="404">No expense with this id exists for the current user.</response>
    [HttpPut("{id:guid}")]
    public async Task<IActionResult> Update(
        Guid id,
        UpdateExpenseRequest request,
        CancellationToken ct
    )
    {
        var userId = await User.ResolveUserIdAsync(users, ct);
        await expenses.UpdateAsync(userId, id, request, ct);
        return NoContent();
    }

    /// <summary>
    /// Deletes an expense.
    /// </summary>
    /// <param name="id">The expense id.</param>
    /// <param name="ct">Cancellation token for the request.</param>
    /// <response code="204">The expense was deleted.</response>
    /// <response code="401">The request has no valid bearer token.</response>
    /// <response code="404">No expense with this id exists for the current user.</response>
    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> Delete(Guid id, CancellationToken ct)
    {
        var userId = await User.ResolveUserIdAsync(users, ct);
        await expenses.DeleteAsync(userId, id, ct);
        return NoContent();
    }

    //For testing unhandled exceptions, kept for reference
    // [HttpGet("exception")]
    // public IActionResult Exception()
    // {
    //     throw new Exception("This is my test exception.");
    // }
}

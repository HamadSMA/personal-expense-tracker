using Finance.Application.Categories;
using Finance.Application.Common;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Finance.Api.Controllers;

/// <summary>
/// Read-only access to the fixed list of expense categories.
/// </summary>
/// <param name="db">Database context used to query categories.</param>
[ApiController]
[Route("api/categories")]
public class CategoriesController(IFinanceDbContext db) : ControllerBase
{
    /// <summary>
    /// Lists every expense category, ordered by id.
    /// </summary>
    /// <remarks>
    /// Categories are shared across all users, so this endpoint does not require authentication.
    /// </remarks>
    /// <param name="ct">Cancellation token for the request.</param>
    /// <response code="200">The full list of categories.</response>
    [HttpGet]
    public async Task<IActionResult> GetAll(CancellationToken ct)
    {
        var items = await db
            .Categories.AsNoTracking()
            .OrderBy(c => c.Id)
            .Select(c => new CategoryResponse(c.Id, c.Name))
            .ToListAsync(ct);

        return Ok(items);
    }
}

using Finance.Application.Categories;
using Microsoft.AspNetCore.Mvc;

namespace Finance.Api.Controllers;

/// <summary>
/// Read-only access to the fixed list of expense categories.
/// </summary>
/// <param name="categories">Service that reads categories.</param>
[ApiController]
[Route("api/categories")]
public class CategoriesController(CategoryService categories) : ControllerBase
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
    public async Task<IActionResult> GetAll(CancellationToken ct) =>
        Ok(await categories.GetAllAsync(ct));
}

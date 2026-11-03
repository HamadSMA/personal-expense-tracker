using Finance.Application.Common;
using Microsoft.EntityFrameworkCore;

namespace Finance.Application.Categories;

/// <summary>
/// Read-only access to the fixed list of expense categories.
/// </summary>
public class CategoryService(IFinanceDbContext db)
{
    /// <summary>
    /// Lists every expense category, ordered by id.
    /// </summary>
    public async Task<IReadOnlyList<CategoryResponse>> GetAllAsync(CancellationToken ct) =>
        await db
            .Categories.AsNoTracking()
            .OrderBy(c => c.Id)
            .Select(c => new CategoryResponse(c.Id, c.Name))
            .ToListAsync(ct);
}

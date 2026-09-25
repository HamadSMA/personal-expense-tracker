using System.Security.Claims;
using Finance.Application.Common;
using Finance.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace Finance.Api;

/// <summary>
/// Helpers for mapping the authenticated token user to a local user record.
/// </summary>
public static class CurrentUser
{
    /// <summary>
    /// Gets the local user id for the token's "sub" claim, creating the user on first sight.
    /// </summary>
    /// <param name="principal">The authenticated user from the bearer token.</param>
    /// <param name="db">Database context used to look up or create the user.</param>
    /// <param name="ct">Cancellation token for the request.</param>
    /// <returns>The id of the matching user in the Users table.</returns>
    /// <exception cref="InvalidOperationException">The token has no "sub" claim.</exception>
    public static async Task<Guid> ResolveUserIdAsync(
        this ClaimsPrincipal principal,
        IFinanceDbContext db,
        CancellationToken ct
    )
    {
        var sub =
            principal.FindFirstValue("sub")
            ?? throw new InvalidOperationException("Token is missing the 'sub' claim.");

        var userId = await db
            .Users.Where(u => u.ExternalIdentityId == sub)
            .Select(u => u.Id)
            .FirstOrDefaultAsync(ct);

        if (userId != Guid.Empty)
            return userId;

        var user = new User
        {
            Id = Guid.NewGuid(),
            ExternalIdentityId = sub,
            Email = principal.FindFirstValue("email") ?? "",
            CreatedAt = DateTime.UtcNow
        };

        db.Users.Add(user);
        await db.SaveChangesAsync(ct);

        return user.Id;
    }
}

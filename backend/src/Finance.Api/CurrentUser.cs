using System.Security.Claims;
using Finance.Application.Users;

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
    /// <param name="users">Service that looks up or creates the local user.</param>
    /// <param name="ct">Cancellation token for the request.</param>
    /// <returns>The id of the matching user in the Users table.</returns>
    /// <exception cref="InvalidOperationException">The token has no "sub" claim.</exception>
    public static Task<Guid> ResolveUserIdAsync(
        this ClaimsPrincipal principal,
        UserService users,
        CancellationToken ct
    )
    {
        var sub =
            principal.FindFirstValue("sub")
            ?? throw new InvalidOperationException("Token is missing the 'sub' claim.");

        return users.GetOrCreateUserIdAsync(sub, principal.FindFirstValue("email"), ct);
    }
}

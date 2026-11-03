using Finance.Application.Common;
using Finance.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace Finance.Application.Users;

/// <summary>
/// Maps identities from the auth provider to local user records.
/// </summary>
public class UserService(IFinanceDbContext db)
{
    /// <summary>
    /// Gets the local user id for an external identity, creating the user on first sight.
    /// </summary>
    /// <param name="externalIdentityId">The "sub" claim from the auth provider.</param>
    /// <param name="email">The user's email, if the token has one.</param>
    /// <param name="ct">Cancellation token for the request.</param>
    /// <returns>The id of the matching user in the Users table.</returns>
    public async Task<Guid> GetOrCreateUserIdAsync(
        string externalIdentityId,
        string? email,
        CancellationToken ct
    )
    {
        var userId = await db
            .Users.Where(u => u.ExternalIdentityId == externalIdentityId)
            .Select(u => u.Id)
            .FirstOrDefaultAsync(ct);

        if (userId != Guid.Empty)
            return userId;

        var user = new User
        {
            Id = Guid.NewGuid(),
            ExternalIdentityId = externalIdentityId,
            Email = email ?? "",
            CreatedAt = DateTime.UtcNow
        };

        db.Users.Add(user);
        await db.SaveChangesAsync(ct);

        return user.Id;
    }
}

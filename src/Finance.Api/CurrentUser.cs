using System.Security.Claims;
using Finance.Application.Common;
using Finance.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace Finance.Api;

public static class CurrentUser
{
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

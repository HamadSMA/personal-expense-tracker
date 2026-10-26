using System;

namespace Finance.Domain.Entities;

public class User
{
    public Guid Id { get; set; }
    public string ExternalIdentityId { get; set; } = null!;
    public string Email { get; set; } = null!;
    public DateTime CreatedAt { get; set; }

    public ICollection<Expense> Expenses { get; set; } = new List<Expense>();
}

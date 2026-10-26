using System;

namespace Finance.Domain.Entities;

public class Expense
{
    public Guid Id { get; set; }
    public User User { get; set; } = null!;
    public Guid UserId { get; set; }
    public Category Category { get; set; } = null!;
    public int CategoryId { get; set; }
    public decimal Amount { get; set; }
    public string Description { get; set; } = null!;
    public DateOnly ExpenseDate { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
}

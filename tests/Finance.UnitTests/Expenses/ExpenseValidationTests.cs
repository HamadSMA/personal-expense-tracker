using System.ComponentModel.DataAnnotations;
using Finance.Application.Expenses;

namespace Finance.UnitTests.Expenses;

public class ExpenseValidationTests
{
    [Theory]
    [InlineData(0)]
    [InlineData(-1)]
    [InlineData(-0.01)]
    public void Amount_zero_or_negative_is_rejected(decimal amount)
    {
        // Arrange
        var request = new CreateExpenseRequest(
            1,
            amount,
            "desc",
            DateOnly.FromDateTime(DateTime.UtcNow)
        );

        // Act
        var results = request.Validate(new ValidationContext(request)).ToList();

        // Assert
        Assert.Contains(results, r => r.ErrorMessage == "Amount must be greater than zero.");
    }

    [Theory]
    [InlineData(10.001)]
    [InlineData(0.999)]
    public void Amount_with_more_than_two_decimals_is_rejected(decimal amount)
    {
        // Arrange
        var request = new CreateExpenseRequest(
            1,
            amount,
            "desc",
            DateOnly.FromDateTime(DateTime.UtcNow)
        );

        // Act
        var results = request.Validate(new ValidationContext(request)).ToList();

        // Assert
        Assert.Contains(
            results,
            r => r.ErrorMessage == "Amount cannot have more than 2 decimal places."
        );
    }

    [Theory]
    [InlineData(10.50)]
    [InlineData(10)]
    public void Amount_positive_with_two_or_fewer_decimals_passes(decimal amount)
    {
        // Arrange
        var request = new CreateExpenseRequest(
            1,
            amount,
            "desc",
            DateOnly.FromDateTime(DateTime.UtcNow)
        );

        // Act
        var results = request.Validate(new ValidationContext(request)).ToList();

        // Assert
        Assert.Empty(results);
    }

    [Theory]
    [InlineData(0)]
    [InlineData(10)]
    [InlineData(-1)]
    public void Category_outside_seeded_set_is_rejected(int categoryId)
    {
        // Arrange
        var request = new CreateExpenseRequest(
            categoryId,
            10.50m,
            "desc",
            DateOnly.FromDateTime(DateTime.UtcNow)
        );

        // Act
        var results = request.Validate(new ValidationContext(request)).ToList();

        // Assert
        Assert.NotEmpty(results);
    }

    [Theory]
    [InlineData(1)]
    [InlineData(9)]
    public void Category_within_seeded_set_passes(int categoryId)
    {
        // Arrange
        var request = new CreateExpenseRequest(
            categoryId,
            10.50m,
            "desc",
            DateOnly.FromDateTime(DateTime.UtcNow)
        );

        // Act
        var results = request.Validate(new ValidationContext(request)).ToList();

        // Assert
        Assert.Empty(results);
    }

    [Fact]
    public void Future_date_is_rejected()
    {
        // Arrange
        var tomorrow = DateOnly.FromDateTime(DateTime.UtcNow).AddDays(1);
        var request = new CreateExpenseRequest(1, 10.50m, "desc", tomorrow);

        // Act
        var results = request.Validate(new ValidationContext(request)).ToList();

        // Assert
        Assert.Contains(results, r => r.ErrorMessage == "Expense date cannot be in the future.");
    }

    [Theory]
    [InlineData(0)]
    [InlineData(-1)]
    public void Today_or_past_date_passes(int dayOffset)
    {
        // Arrange
        var date = DateOnly.FromDateTime(DateTime.UtcNow).AddDays(dayOffset);
        var request = new CreateExpenseRequest(1, 10.50m, "desc", date);

        // Act
        var results = request.Validate(new ValidationContext(request)).ToList();

        // Assert
        Assert.Empty(results);
    }

    [Fact]
    public void Fully_valid_request_has_no_errors()
    {
        // Arrange
        var request = new CreateExpenseRequest(
            1,
            10.50m,
            "desc",
            DateOnly.FromDateTime(DateTime.UtcNow)
        );

        // Act
        var results = request.Validate(new ValidationContext(request)).ToList();

        // Assert
        Assert.Empty(results);
    }

    [Fact]
    public void Update_request_rejects_zero_amount()
    {
        // Arrange
        var request = new UpdateExpenseRequest(
            1,
            0m,
            "desc",
            DateOnly.FromDateTime(DateTime.UtcNow)
        );

        // Act
        var results = request.Validate(new ValidationContext(request)).ToList();

        // Assert
        Assert.Contains(results, r => r.ErrorMessage == "Amount must be greater than zero.");
    }

    [Fact]
    public void Update_request_fully_valid_has_no_errors()
    {
        // Arrange
        var request = new UpdateExpenseRequest(
            1,
            10.50m,
            "desc",
            DateOnly.FromDateTime(DateTime.UtcNow)
        );

        // Act
        var results = request.Validate(new ValidationContext(request)).ToList();

        // Assert
        Assert.Empty(results);
    }
}

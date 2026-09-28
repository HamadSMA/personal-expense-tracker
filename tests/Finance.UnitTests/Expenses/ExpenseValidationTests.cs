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
        // Arrange: zero or negative amount
        var request = new CreateExpenseRequest(
            1,
            amount,
            "desc",
            DateOnly.FromDateTime(DateTime.UtcNow)
        );

        // Act: run the request's own Validate
        var results = request.Validate(new ValidationContext(request)).ToList();

        // Assert: amount error is reported
        Assert.Contains(results, r => r.ErrorMessage == "Amount must be greater than zero.");
    }

    [Theory]
    [InlineData(10.001)]
    [InlineData(0.999)]
    public void Amount_with_more_than_two_decimals_is_rejected(decimal amount)
    {
        // Arrange: amount with three decimal places
        var request = new CreateExpenseRequest(
            1,
            amount,
            "desc",
            DateOnly.FromDateTime(DateTime.UtcNow)
        );

        // Act: run the request's own Validate
        var results = request.Validate(new ValidationContext(request)).ToList();

        // Assert: decimal places error is reported
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
        // Arrange: positive amount with at most two decimals
        var request = new CreateExpenseRequest(
            1,
            amount,
            "desc",
            DateOnly.FromDateTime(DateTime.UtcNow)
        );

        // Act: run the request's own Validate
        var results = request.Validate(new ValidationContext(request)).ToList();

        // Assert: no errors
        Assert.Empty(results);
    }

    [Theory]
    [InlineData(0)]
    [InlineData(10)]
    [InlineData(-1)]
    public void Category_outside_seeded_set_is_rejected(int categoryId)
    {
        // Arrange: category id outside 1 to 9
        var request = new CreateExpenseRequest(
            categoryId,
            10.50m,
            "desc",
            DateOnly.FromDateTime(DateTime.UtcNow)
        );

        // Act: run the request's own Validate
        var results = request.Validate(new ValidationContext(request)).ToList();

        // Assert: at least one error
        Assert.NotEmpty(results);
    }

    [Theory]
    [InlineData(1)]
    [InlineData(9)]
    public void Category_within_seeded_set_passes(int categoryId)
    {
        // Arrange: category id inside 1 to 9
        var request = new CreateExpenseRequest(
            categoryId,
            10.50m,
            "desc",
            DateOnly.FromDateTime(DateTime.UtcNow)
        );

        // Act: run the request's own Validate
        var results = request.Validate(new ValidationContext(request)).ToList();

        // Assert: no errors
        Assert.Empty(results);
    }

    [Fact]
    public void Future_date_is_rejected()
    {
        // Arrange: tomorrow's date
        var tomorrow = DateOnly.FromDateTime(DateTime.UtcNow).AddDays(1);
        var request = new CreateExpenseRequest(1, 10.50m, "desc", tomorrow);

        // Act: run the request's own Validate
        var results = request.Validate(new ValidationContext(request)).ToList();

        // Assert: future date error is reported
        Assert.Contains(results, r => r.ErrorMessage == "Expense date cannot be in the future.");
    }

    [Theory]
    [InlineData(0)]
    [InlineData(-1)]
    public void Today_or_past_date_passes(int dayOffset)
    {
        // Arrange: today or yesterday
        var date = DateOnly.FromDateTime(DateTime.UtcNow).AddDays(dayOffset);
        var request = new CreateExpenseRequest(1, 10.50m, "desc", date);

        // Act: run the request's own Validate
        var results = request.Validate(new ValidationContext(request)).ToList();

        // Assert: no errors
        Assert.Empty(results);
    }

    [Fact]
    public void Fully_valid_request_has_no_errors()
    {
        // Arrange: every field valid
        var request = new CreateExpenseRequest(
            1,
            10.50m,
            "desc",
            DateOnly.FromDateTime(DateTime.UtcNow)
        );

        // Act: run the request's own Validate
        var results = request.Validate(new ValidationContext(request)).ToList();

        // Assert: no errors
        Assert.Empty(results);
    }

    [Fact]
    public void Update_request_rejects_zero_amount()
    {
        // Arrange: update request with a zero amount
        var request = new UpdateExpenseRequest(
            1,
            0m,
            "desc",
            DateOnly.FromDateTime(DateTime.UtcNow)
        );

        // Act: run the request's own Validate
        var results = request.Validate(new ValidationContext(request)).ToList();

        // Assert: amount error is reported
        Assert.Contains(results, r => r.ErrorMessage == "Amount must be greater than zero.");
    }

    [Fact]
    public void Update_request_fully_valid_has_no_errors()
    {
        // Arrange: update request with every field valid
        var request = new UpdateExpenseRequest(
            1,
            10.50m,
            "desc",
            DateOnly.FromDateTime(DateTime.UtcNow)
        );

        // Act: run the request's own Validate
        var results = request.Validate(new ValidationContext(request)).ToList();

        // Assert: no errors
        Assert.Empty(results);
    }
}

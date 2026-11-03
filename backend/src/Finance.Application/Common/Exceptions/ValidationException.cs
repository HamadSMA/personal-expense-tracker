namespace Finance.Application.Common.Exceptions;

/// <summary>
/// Thrown when a request is well formed but breaks a rule that needs the database to check,
/// such as referring to a category that does not exist. The API turns this into a 400 response.
/// </summary>
public class ValidationException(string field, string error) : Exception(error)
{
    public string Field { get; } = field;
}

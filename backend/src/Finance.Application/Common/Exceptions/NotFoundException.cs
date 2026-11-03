namespace Finance.Application.Common.Exceptions;

/// <summary>
/// Thrown when a requested resource does not exist for the current user.
/// The API turns this into a 404 response.
/// </summary>
public class NotFoundException(string title, string detail) : Exception(detail)
{
    public string Title { get; } = title;
}

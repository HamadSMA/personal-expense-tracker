using Finance.Application.Common.Exceptions;
using Microsoft.AspNetCore.Diagnostics;
using Microsoft.AspNetCore.Mvc;

namespace Finance.Api;

/// <summary>
/// Turns exceptions thrown by application services into ProblemDetails responses.
/// Any other exception falls through to the default 500 handler.
/// </summary>
/// <param name="problemDetails">Writes ProblemDetails bodies in the same format as the rest of the API.</param>
public class ApplicationExceptionHandler(IProblemDetailsService problemDetails) : IExceptionHandler
{
    /// <inheritdoc />
    public async ValueTask<bool> TryHandleAsync(
        HttpContext httpContext,
        Exception exception,
        CancellationToken cancellationToken
    )
    {
        ProblemDetails? problem = exception switch
        {
            NotFoundException e
                => new ProblemDetails
                {
                    Status = StatusCodes.Status404NotFound,
                    Title = e.Title,
                    Detail = e.Message
                },
            ValidationException e
                => new ValidationProblemDetails(
                    new Dictionary<string, string[]> { [e.Field] = [e.Message] }
                )
                {
                    Status = StatusCodes.Status400BadRequest
                },
            _ => null
        };

        if (problem is null)
            return false;

        httpContext.Response.StatusCode = problem.Status!.Value;

        return await problemDetails.TryWriteAsync(
            new ProblemDetailsContext
            {
                HttpContext = httpContext,
                ProblemDetails = problem,
                Exception = exception
            }
        );
    }
}

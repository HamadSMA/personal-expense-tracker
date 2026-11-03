using Finance.Application.Categories;
using Finance.Application.Dashboard;
using Finance.Application.Expenses;
using Finance.Application.Users;
using Microsoft.Extensions.DependencyInjection;

namespace Finance.Application;

/// <summary>
/// Registers the application layer's services.
/// </summary>
public static class DependencyInjection
{
    public static IServiceCollection AddApplication(this IServiceCollection services)
    {
        services.AddScoped<UserService>();
        services.AddScoped<CategoryService>();
        services.AddScoped<ExpenseService>();
        services.AddScoped<DashboardService>();
        return services;
    }
}

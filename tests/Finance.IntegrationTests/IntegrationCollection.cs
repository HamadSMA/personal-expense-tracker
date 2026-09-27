using Microsoft.Extensions.DependencyInjection;

namespace Finance.IntegrationTests;

public class IntegrationTestContext : IAsyncLifetime
{
    public PostgresFixture Postgres { get; } = new();
    public FinanceApiFactory Factory { get; private set; } = null!;

    public async Task InitializeAsync()
    {
        await Postgres.InitializeAsync();
        Factory = new FinanceApiFactory(Postgres.ConnectionString);
    }

    public async Task DisposeAsync()
    {
        Factory.Dispose();
        await Postgres.DisposeAsync();
    }
}

[CollectionDefinition("Integration")]
public class IntegrationCollection : ICollectionFixture<IntegrationTestContext>;

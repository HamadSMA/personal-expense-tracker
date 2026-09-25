# Finance: Personal Expense Tracker

A multi-user expense tracker REST API: log spending, categorise it, see where the money went.
Built with ASP.NET Core 10, Clean Architecture, PostgreSQL and Keycloak. The domain is
deliberately small (amounts in SAR; no multi-currency, accounts, budgets or transfers) so the
engineering around it can be the interesting part.

**Status:** backend complete through Phase 3 (secured API). Testing and quality are next.

## Tech Stack

| | |
| --- | --- |
| **Backend** | C#, .NET 10, ASP.NET Core Web API |
| **Data** | PostgreSQL, EF Core 10 + Npgsql, code-first migrations |
| **Auth** | Keycloak, OIDC / OAuth 2.0, JWT bearer validation |
| **API** | REST, OpenAPI, Scalar, RFC 7807 ProblemDetails |
| **Architecture** | Clean Architecture, 4 projects |

## Key Features

- **Per-user data isolation:** every query is scoped to the user in the JWT; no cross-user reads
- **JWT bearer auth:** signature, issuer, audience and expiry validated against Keycloak's
  discovery document; issuer configured, never hardcoded
- **Filtering, sorting, pagination:** category, amount range, date range and description
  search; sort by date, amount or created-at; paged envelope with total count
- **Dashboard aggregation in SQL:** totals, spend by category with percentages, top expenses,
  and spend over time with adaptive day/week/month bucketing
- **Validation:** positive amounts, max 2 decimal places, no future dates, known category,
  description length
- **Consistent errors:** RFC 7807 ProblemDetails; no stack traces or database detail leaked
- **API documentation:** OpenAPI generated from XML doc comments, browsable in Scalar with
  bearer auth built in

**Not built yet:** automated tests, health checks, Docker Compose, CI, frontend.

## Architecture

```mermaid
flowchart LR
    Api[Finance.Api] --> Application[Finance.Application]
    Api --> Infrastructure[Finance.Infrastructure]
    Infrastructure --> Application
    Infrastructure --> Domain[Finance.Domain]
    Application --> Domain
    Infrastructure --> Db[(PostgreSQL)]
```

| Project | Contains |
| --- | --- |
| `Finance.Api` | Controllers, auth, composition root |
| `Finance.Infrastructure` | EF Core, Npgsql, migrations |
| `Finance.Application` | DTOs, validation rules, `IFinanceDbContext` |
| `Finance.Domain` | Entities, category list; references nothing |

Arrows are project references. The domain references no framework (no ASP.NET Core, no EF
Core, no provider SDKs), so persistence and identity are swappable without touching business
rules. Swapping Keycloak for Entra ID is a configuration change, not a code change.

## API

All endpoints except `/api/categories` require `Authorization: Bearer <token>`.

| Method | Route | Description |
| --- | --- | --- |
| GET | `/api/expenses` | List (filtered, sorted, paged) |
| GET | `/api/expenses/{id}` | Fetch one |
| POST | `/api/expenses` | Create |
| PUT | `/api/expenses/{id}` | Update |
| DELETE | `/api/expenses/{id}` | Delete |
| GET | `/api/dashboard/summary` | Total, count, average, largest |
| GET | `/api/dashboard/by-category` | Spend per category, with % of total |
| GET | `/api/dashboard/by-day` | Spend over time, auto-bucketed |
| GET | `/api/dashboard/top-expenses` | 10 largest |
| GET | `/api/categories` | The 9 fixed categories |

Status codes: `200` / `201` / `204` on success, `400` validation, `401` missing or invalid
token, `404` not found or not yours.

Full request and response documentation is served by Scalar at
[`/scalar/v1`](http://localhost:5048/scalar/v1) when running locally.

## Running Locally

Requires .NET SDK 10, PostgreSQL 14+, Docker and the EF Core CLI.

```bash
cp src/Finance.Api/appsettings.Example.json src/Finance.Api/appsettings.json
dotnet ef database update --project src/Finance.Infrastructure --startup-project src/Finance.Api
dotnet run --project src/Finance.Api
```

The API also needs a Keycloak realm to issue tokens. See
[docs/local-setup.md](docs/local-setup.md) for the Keycloak setup, configuration details and
the included REST Client and Postman test suites.

## Roadmap

- [x] **Phase 1, Core Backend:** Clean Architecture, EF Core, PostgreSQL, CRUD, ProblemDetails
- [x] **Phase 2, Real API:** validation, filtering, sorting, pagination, dashboard aggregation
- [x] **Phase 3, Security:** Keycloak, OIDC, JWT bearer, per-user ownership
- [ ] **Phase 4, Quality:** xUnit, Testcontainers integration tests, structured logging, health checks
- [ ] **Phase 5, Infrastructure:** Dockerfiles, Docker Compose for the full stack, GitHub Actions CI
- [ ] **Phase 6, Optional:** Azure Container Apps, Entra ID, Redis, OpenTelemetry, rate limiting
- [ ] **Phase 7, Optional Frontend:** React, TypeScript, OIDC login, expense UI, charts

## License

MIT. See [LICENSE](LICENSE).

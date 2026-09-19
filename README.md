# Finance: Personal Expense Tracker

A multi-user expense tracker: log spending, categorise it, see where the money went.
Portfolio project. ASP.NET Core 10 Web API, Clean Architecture, PostgreSQL, Keycloak for
authentication. Amounts are in SAR; no multi-currency, accounts, budgets, or transfers.
The domain is deliberately small so the engineering around it can be the interesting part.

**Status:** backend complete through Phase 3 (secured API). Frontend is next.

| | |
| --- | --- |
| **Backend** | C#, .NET 10, ASP.NET Core Web API |
| **Data** | PostgreSQL, EF Core 10 + Npgsql, code-first migrations |
| **Auth** | Keycloak, OIDC / OAuth 2.0, JWT bearer validation |
| **API** | REST, OpenAPI, RFC 7807 ProblemDetails |
| **Architecture** | Clean Architecture, 4 projects |
| **Frontend** | React + TypeScript *(Phase 4, not started)* |

## Features

**Built:**

- Full expense CRUD: amount, description, date, category
- **Per-user data isolation**: every query scoped to the JWT's user; no cross-user reads
- **JWT bearer auth**: signature, issuer, audience and expiry validated against Keycloak's
  discovery document; issuer configured, never hardcoded
- **Filtering**: category, min/max amount, date range, description search
- **Sorting**: date, amount, created-at; ascending or descending
- **Pagination**: paged envelope with total count and page count
- **Dashboard aggregation**: totals, spend by category with percentages, spend over time
  with adaptive day/week/month bucketing, top expenses. All aggregated in SQL, not in memory
- **Validation**: positive amounts, max 2 decimal places, no future dates, known category,
  description length
- **Consistent errors**: RFC 7807 ProblemDetails, no stack traces or database detail leaked
- 9 seeded categories as read-only reference data

**Not built yet:** frontend, automated tests, Docker Compose, CI, health checks.

## API

All expense and dashboard endpoints require `Authorization: Bearer <token>`.

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
| GET | `/api/categories` | The 9 fixed categories *(anonymous)* |

Query parameters on `/api/expenses`: `categoryId`, `minAmount`, `maxAmount`, `fromDate`,
`toDate`, `search`, `sortBy`, `sortDirection`, `page`, `pageSize`.

Status codes: `200` / `201` / `204` on success, `400` validation, `401` missing or invalid
token, `404` not found or not yours.

## Architecture

```text
API            → Application, Infra       controllers, auth, composition
Infrastructure → Application + Domain     EF Core, Npgsql, migrations
Application    → Domain                   DTOs, IFinanceDbContext
Domain         → nothing                  entities, category list
```

The domain references no framework (no ASP.NET Core, no EF Core, no provider SDKs), so
persistence and identity are swappable without touching business rules. Swapping Keycloak
for Entra ID is a configuration change, not a code change.

## Running Locally

Prerequisites: .NET SDK 10, PostgreSQL 14+, Docker, and the EF Core CLI
(`dotnet tool install --global dotnet-ef`).

```bash
git clone <repo-url> && cd personal-expense-tracker

# 1. Identity provider
docker run -d --name keycloak -p 8080:8080 \
  -e KC_BOOTSTRAP_ADMIN_USERNAME=admin -e KC_BOOTSTRAP_ADMIN_PASSWORD=admin \
  quay.io/keycloak/keycloak:26.7 start-dev

# 2. Config, then edit ConnectionStrings:FinanceDb to match your PostgreSQL user
cp src/Finance.Api/appsettings.Example.json src/Finance.Api/appsettings.json

# 3. Database + run
dotnet ef database update --project src/Finance.Infrastructure --startup-project src/Finance.Api
dotnet run --project src/Finance.Api
```

API on `http://localhost:5048`, Keycloak admin console on `http://localhost:8080`.
`appsettings.json` is gitignored; `appsettings.Example.json` is the committed template.

In Keycloak (admin console → `admin` / `admin`), create:

- A realm named `finance`
- A client `finance-api`, the API's audience; it logs nobody in
- A public client `finance-web` with **Direct access grants** enabled, and an
  **audience mapper** adding `finance-api` to the token's `aud`
- A user with a password (**Temporary off**) and a complete profile: first name, last
  name and email. Without them, Keycloak's default *Verify Profile* action blocks token
  issuance with `400 Account is not fully set up`

Migrations seed the 9 fixed categories. Exercise the API with the REST Client suites in `api-tests/`: `phase1.http` (CRUD),
`phase2.http` (validation, filtering, paging), `phase3.http` (auth, including the token
request). OpenAPI document at `/openapi/v1.json` in Development.

## Roadmap

- [x] **Phase 1, Core Backend.** Clean Architecture, EF Core, PostgreSQL, CRUD, ProblemDetails
- [x] **Phase 2, Real API.** Validation, filtering, sorting, pagination, dashboard aggregation
- [x] **Phase 3, Security.** Keycloak, OIDC, JWT bearer, per-user ownership
- [ ] **Phase 4, Frontend.** React, TypeScript, OIDC login, expense UI, charts
- [ ] **Phase 5, Quality.** xUnit, Testcontainers integration tests, structured logging, health checks
- [ ] **Phase 6, Infrastructure.** Dockerfiles, Compose for the full stack, GitHub Actions CI
- [ ] **Phase 7, Optional.** Azure Container Apps, Entra ID, Redis, OpenTelemetry, rate limiting

Phase 6 makes `docker compose up` the single entry point for API, PostgreSQL, Keycloak and
frontend.

## License

MIT. See [LICENSE](LICENSE).

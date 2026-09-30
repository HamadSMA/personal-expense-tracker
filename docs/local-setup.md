# Local Setup

Instructions for running the API directly on your machine, outside Docker Compose, with
Keycloak in a container. The [README](../README.md) covers the full Docker Compose stack.

## Prerequisites

- .NET SDK 10
- PostgreSQL 14+
- Docker (for Keycloak)
- EF Core CLI: `dotnet tool install --global dotnet-ef`

## 1. Start Keycloak

Run from the repository root:

```bash
docker run -d --name keycloak -p 8080:8080 \
  -e KC_BOOTSTRAP_ADMIN_USERNAME=admin -e KC_BOOTSTRAP_ADMIN_PASSWORD=admin \
  -v "$(pwd)/keycloak/finance-realm.json:/opt/keycloak/data/import/finance-realm.json:ro" \
  quay.io/keycloak/keycloak:26.7 start-dev --import-realm
```

On first start, Keycloak imports the `finance` realm from
[`keycloak/finance-realm.json`](../keycloak/finance-realm.json): the `finance-api` audience
client, and the public `finance-web` client with **Direct access grants** and an audience
mapper adding `finance-api` to the token's `aud`.

The admin console is on `http://localhost:8080` (login `admin` / `admin`).

## 2. Create a Keycloak user

The realm export contains no users. In the admin console, under the `finance` realm, create a
user with a password (**Temporary** off) and a complete profile: first name, last name and
email. Without them, Keycloak's default *Verify Profile* action blocks token issuance with
`400 Account is not fully set up`.

## 3. Configure the API

```bash
cp src/Finance.Api/appsettings.Example.json src/Finance.Api/appsettings.json
```

Edit `ConnectionStrings:FinanceDb` to match your PostgreSQL user. The `Jwt` section already
points at the `finance` realm and the `finance-api` audience.

`appsettings.json` is gitignored; `appsettings.Example.json` is the committed template.

## 4. Create the database and run

```bash
dotnet ef database update --project src/Finance.Infrastructure --startup-project src/Finance.Api
dotnet run --project src/Finance.Api
```

Migrations create the schema and seed the 9 fixed categories. The API listens on
`http://localhost:5048`.

## Exercising the API

- **Scalar UI:** [http://localhost:5048/scalar/v1](http://localhost:5048/scalar/v1). Paste an
  access token into the auth section and every request sent from the UI carries it
- **OpenAPI document:** `http://localhost:5048/openapi/v1.json`
- **REST Client suites** in [`api-tests/`](../api-tests): `phase1.http` (CRUD), `phase2.http`
  (validation, filtering, paging), `phase3.http` (auth, including the token request)
- **Postman collection:** [`Finance API.postman_collection.json`](Finance%20API.postman_collection.json),
  imported from the OpenAPI document

Scalar and the OpenAPI document are only mapped in the Development environment.

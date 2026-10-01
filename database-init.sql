CREATE TABLE IF NOT EXISTS "__EFMigrationsHistory" (
    "MigrationId" character varying(150) NOT NULL,
    "ProductVersion" character varying(32) NOT NULL,
    CONSTRAINT "PK___EFMigrationsHistory" PRIMARY KEY ("MigrationId")
);

START TRANSACTION;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260907125149_InitialCreate') THEN
    CREATE TABLE categories (
        "Id" integer NOT NULL,
        "Name" character varying(50) NOT NULL,
        "CreatedAt" timestamp with time zone NOT NULL,
        CONSTRAINT "PK_categories" PRIMARY KEY ("Id")
    );
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260907125149_InitialCreate') THEN
    CREATE TABLE users (
        "Id" uuid NOT NULL,
        "ExternalIdentityId" character varying(200) NOT NULL,
        "Email" character varying(256) NOT NULL,
        "CreatedAt" timestamp with time zone NOT NULL,
        CONSTRAINT "PK_users" PRIMARY KEY ("Id")
    );
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260907125149_InitialCreate') THEN
    CREATE TABLE expenses (
        "Id" uuid NOT NULL,
        "UserId" uuid NOT NULL,
        "CategoryId" integer NOT NULL,
        "Amount" numeric(18,2) NOT NULL,
        "Description" character varying(500) NOT NULL,
        "ExpenseDate" date NOT NULL,
        "CreatedAt" timestamp with time zone NOT NULL,
        "UpdatedAt" timestamp with time zone NOT NULL,
        CONSTRAINT "PK_expenses" PRIMARY KEY ("Id"),
        CONSTRAINT "FK_expenses_categories_CategoryId" FOREIGN KEY ("CategoryId") REFERENCES categories ("Id") ON DELETE RESTRICT,
        CONSTRAINT "FK_expenses_users_UserId" FOREIGN KEY ("UserId") REFERENCES users ("Id") ON DELETE CASCADE
    );
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260907125149_InitialCreate') THEN
    INSERT INTO categories ("Id", "CreatedAt", "Name")
    VALUES (1, TIMESTAMPTZ '2026-01-01T00:00:00Z', 'Food');
    INSERT INTO categories ("Id", "CreatedAt", "Name")
    VALUES (2, TIMESTAMPTZ '2026-01-01T00:00:00Z', 'Transport');
    INSERT INTO categories ("Id", "CreatedAt", "Name")
    VALUES (3, TIMESTAMPTZ '2026-01-01T00:00:00Z', 'Housing');
    INSERT INTO categories ("Id", "CreatedAt", "Name")
    VALUES (4, TIMESTAMPTZ '2026-01-01T00:00:00Z', 'Shopping');
    INSERT INTO categories ("Id", "CreatedAt", "Name")
    VALUES (5, TIMESTAMPTZ '2026-01-01T00:00:00Z', 'Entertainment');
    INSERT INTO categories ("Id", "CreatedAt", "Name")
    VALUES (6, TIMESTAMPTZ '2026-01-01T00:00:00Z', 'Bills');
    INSERT INTO categories ("Id", "CreatedAt", "Name")
    VALUES (7, TIMESTAMPTZ '2026-01-01T00:00:00Z', 'Healthcare');
    INSERT INTO categories ("Id", "CreatedAt", "Name")
    VALUES (8, TIMESTAMPTZ '2026-01-01T00:00:00Z', 'Travel');
    INSERT INTO categories ("Id", "CreatedAt", "Name")
    VALUES (9, TIMESTAMPTZ '2026-01-01T00:00:00Z', 'Other');
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260907125149_InitialCreate') THEN
    INSERT INTO users ("Id", "CreatedAt", "Email", "ExternalIdentityId")
    VALUES ('11111111-1111-1111-1111-111111111111', TIMESTAMPTZ '2026-01-01T00:00:00Z', 'dev@example.com', 'dev-user');
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260907125149_InitialCreate') THEN
    CREATE UNIQUE INDEX "IX_categories_Name" ON categories ("Name");
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260907125149_InitialCreate') THEN
    CREATE INDEX "IX_expenses_CategoryId" ON expenses ("CategoryId");
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260907125149_InitialCreate') THEN
    CREATE INDEX "IX_expenses_ExpenseDate" ON expenses ("ExpenseDate");
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260907125149_InitialCreate') THEN
    CREATE INDEX "IX_expenses_UserId" ON expenses ("UserId");
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260907125149_InitialCreate') THEN
    CREATE INDEX "IX_expenses_UserId_ExpenseDate" ON expenses ("UserId", "ExpenseDate");
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260907125149_InitialCreate') THEN
    CREATE UNIQUE INDEX "IX_users_Email" ON users ("Email");
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260907125149_InitialCreate') THEN
    CREATE UNIQUE INDEX "IX_users_ExternalIdentityId" ON users ("ExternalIdentityId");
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260907125149_InitialCreate') THEN
    INSERT INTO "__EFMigrationsHistory" ("MigrationId", "ProductVersion")
    VALUES ('20260907125149_InitialCreate', '10.0.11');
    END IF;
END $EF$;
COMMIT;


---
description: Comprehensive testing patterns for Igniter.js applications including browser, unit, integration, and E2E testing
globs: []
alwaysApply: false
---

# Testing Patterns for Igniter.js

This guide provides comprehensive testing strategies for Igniter.js applications, from browser-based UI testing to backend API testing.

## 1. Testing Strategy Overview

### 1.1. Testing Pyramid

```
        /\
       /  \      E2E Tests (Browser)
      /----\
     /      \    Integration Tests (API + DB)
    /--------\
   /          \  Unit Tests (Functions, Utils)
  /____________\
```

### 1.2. Test Types by Layer

| Layer              | Tool                | Purpose                           | Frequency    |
| ------------------ | ------------------- | --------------------------------- | ------------ |
| **Frontend UI**    | `agent-browser`     | User workflows, visual regression | Per feature  |
| **Backend API**    | `bun test`          | Controller/procedure logic        | Per endpoint |
| **Database**       | `bun test` + Prisma | Repository operations, migrations | Per query    |
| **Business Logic** | `bun test`          | Pure functions, utilities         | Per function |

## 2. Browser Testing (UI)

**See [browser.md](./browser.md) for complete browser testing patterns.**

### 2.1. Quick Reference

```bash
# Test complete user flow
agent-browser --headed open http://localhost:3000/users/create
agent-browser snapshot -i
agent-browser fill @e1 "John Doe"
agent-browser fill @e2 "john@example.com"
agent-browser click @e3
agent-browser wait --url "**/users/*"
agent-browser screenshot ./success.png
```

## 3. Backend API Testing

### 3.1. Controller/Action Testing

```typescript
// tests/features/users/controllers/users.controller.test.ts
import { describe, it, expect, beforeEach } from "bun:test";
import { createTestApp } from "@/tests/helpers/test-app";

describe("Users Controller", () => {
  let app: TestApp;

  beforeEach(async () => {
    app = await createTestApp();
    await app.db.seed.users();
  });

  it("should create a new user - POST /api/v1/users", async () => {
    const response = await app.request("/api/v1/users", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: "John Doe",
        email: "john@example.com",
        password: "password123",
      }),
    });

    expect(response.status).toBe(201);

    const data = await response.json();
    expect(data.name).toBe("John Doe");
    expect(data.email).toBe("john@example.com");
    expect(data.passwordHash).toBeUndefined(); // Security check
  });

  it("should return validation error for invalid email - POST /api/v1/users", async () => {
    const response = await app.request("/api/v1/users", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: "John Doe",
        email: "invalid-email", // Invalid
        password: "password123",
      }),
    });

    expect(response.status).toBe(400);

    const error = await response.json();
    expect(error.code).toBe("VALIDATION_ERROR");
  });

  it("should list users with pagination - GET /api/v1/users", async () => {
    const response = await app.request("/api/v1/users?page=1&limit=10");

    expect(response.status).toBe(200);

    const data = await response.json();
    expect(Array.isArray(data.data)).toBe(true);
    expect(data.pagination).toBeDefined();
    expect(data.pagination.page).toBe(1);
    expect(data.pagination.limit).toBe(10);
  });

  it("should return user by id - GET /api/v1/users/:id", async () => {
    const user = await app.db.seed.user({ name: "Test User" });

    const response = await app.request(`/api/v1/users/${user.id}`);

    expect(response.status).toBe(200);

    const data = await response.json();
    expect(data.id).toBe(user.id);
    expect(data.name).toBe("Test User");
  });

  it("should return 404 for non-existent user - GET /api/v1/users/:id", async () => {
    const response = await app.request("/api/v1/users/non-existent-id");

    expect(response.status).toBe(404);

    const error = await response.json();
    expect(error.code).toBe("USER_NOT_FOUND");
  });

  it("should update user - PUT /api/v1/users/:id", async () => {
    const user = await app.db.seed.user({ name: "Old Name" });

    const response = await app.request(`/api/v1/users/${user.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: "New Name" }),
    });

    expect(response.status).toBe(200);

    const data = await response.json();
    expect(data.name).toBe("New Name");
  });

  it("should delete user - DELETE /api/v1/users/:id", async () => {
    const user = await app.db.seed.user();

    const response = await app.request(`/api/v1/users/${user.id}`, {
      method: "DELETE",
    });

    expect(response.status).toBe(204);

    // Verify deletion
    const checkResponse = await app.request(`/api/v1/users/${user.id}`);
    expect(checkResponse.status).toBe(404);
  });
});
```

### 3.2. Authentication Testing

```typescript
// tests/features/auth/controllers/auth.controller.test.ts
import { describe, it, expect } from "bun:test";
import { createTestApp } from "@/tests/helpers/test-app";

describe("Auth Controller", () => {
  it("should sign up a new user - POST /api/v1/auth/sign-up", async () => {
    const app = await createTestApp();

    const response = await app.request("/api/v1/auth/sign-up", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: "John Doe",
        email: "john@example.com",
        password: "password123",
      }),
    });

    expect(response.status).toBe(201);

    const setCookie = response.headers.get("set-cookie");
    expect(setCookie).toContain("x-session-token");
    expect(setCookie).toContain("HttpOnly");
  });

  it("should sign in with valid credentials - POST /api/v1/auth/sign-in", async () => {
    const app = await createTestApp();
    await app.db.seed.user({
      email: "john@example.com",
      passwordHash: await app.services.password.hashPassword("password123"),
    });

    const response = await app.request("/api/v1/auth/sign-in", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: "john@example.com",
        password: "password123",
      }),
    });

    expect(response.status).toBe(200);

    const setCookie = response.headers.get("set-cookie");
    expect(setCookie).toContain("x-session-token");
  });

  it("should reject invalid credentials - POST /api/v1/auth/sign-in", async () => {
    const app = await createTestApp();

    const response = await app.request("/api/v1/auth/sign-in", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: "john@example.com",
        password: "wrong-password",
      }),
    });

    expect(response.status).toBe(401);

    const error = await response.json();
    expect(error.code).toBe("INVALID_CREDENTIALS");
  });

  it("should access protected route with valid session", async () => {
    const app = await createTestApp();
    const session = await app.auth.createSession({ email: "john@example.com" });

    const response = await app.request("/api/v1/users/me", {
      headers: { Cookie: `x-session-token=${session.token}` },
    });

    expect(response.status).toBe(200);
  });

  it("should reject protected route without session", async () => {
    const app = await createTestApp();

    const response = await app.request("/api/v1/users/me");

    expect(response.status).toBe(401);

    const error = await response.json();
    expect(error.code).toBe("UNAUTHORIZED");
  });
});
```

## 4. Repository/Database Testing

### 4.1. Repository Tests

```typescript
// tests/features/users/repositories/users.repository.test.ts
import { describe, it, expect, beforeEach } from "bun:test";
import { createTestDatabase } from "@/tests/helpers/test-database";
import { UsersRepository } from "@/features/users/repositories/users.repository";

describe("UsersRepository", () => {
  let db: TestDatabase;
  let repository: UsersRepository;

  beforeEach(async () => {
    db = await createTestDatabase();
    repository = new UsersRepository(db.prisma);
  });

  it("should create a user", async () => {
    const user = await repository.create({
      name: "John Doe",
      email: "john@example.com",
      passwordHash: "hashed-password",
    });

    expect(user.id).toBeDefined();
    expect(user.name).toBe("John Doe");
    expect(user.email).toBe("john@example.com");
  });

  it("should find user by email", async () => {
    await repository.create({
      name: "John Doe",
      email: "john@example.com",
      passwordHash: "hashed-password",
    });

    const user = await repository.findByEmail("john@example.com");

    expect(user).toBeDefined();
    expect(user?.name).toBe("John Doe");
  });

  it("should return null for non-existent email", async () => {
    const user = await repository.findByEmail("nonexistent@example.com");

    expect(user).toBeNull();
  });

  it("should list users with pagination", async () => {
    // Seed multiple users
    for (let i = 0; i < 15; i++) {
      await repository.create({
        name: `User ${i}`,
        email: `user${i}@example.com`,
        passwordHash: "hashed-password",
      });
    }

    const page1 = await repository.list({ page: 1, limit: 10 });
    const page2 = await repository.list({ page: 2, limit: 10 });

    expect(page1.data.length).toBe(10);
    expect(page2.data.length).toBe(5);
    expect(page1.pagination.total).toBe(15);
  });

  it("should update user", async () => {
    const user = await repository.create({
      name: "John Doe",
      email: "john@example.com",
      passwordHash: "hashed-password",
    });

    const updated = await repository.update(user.id, { name: "Jane Doe" });

    expect(updated.name).toBe("Jane Doe");
    expect(updated.email).toBe("john@example.com"); // Unchanged
  });

  it("should delete user", async () => {
    const user = await repository.create({
      name: "John Doe",
      email: "john@example.com",
      passwordHash: "hashed-password",
    });

    await repository.delete(user.id);

    const found = await repository.findById(user.id);
    expect(found).toBeNull();
  });
});
```

## 5. Procedure Testing

### 5.1. Business Logic Procedures

```typescript
// tests/features/users/procedures/users.procedure.test.ts
import { describe, it, expect } from "bun:test";
import { createTestContext } from "@/tests/helpers/test-context";
import { usersProcedure } from "@/features/users/procedures/users.procedure";

describe("usersProcedure", () => {
  it("should inject user methods into context", async () => {
    const ctx = await createTestContext();

    const extendedContext = usersProcedure.handler({}, ctx);

    expect(extendedContext.procedures.users).toBeDefined();
    expect(extendedContext.procedures.users.create).toBeFunction();
    expect(extendedContext.procedures.users.list).toBeFunction();
  });

  it("should create user via procedure method", async () => {
    const ctx = await createTestContext();
    const { procedures } = usersProcedure.handler({}, ctx);

    const user = await procedures.users.create({
      name: "John Doe",
      email: "john@example.com",
      password: "password123",
    });

    expect(user.id).toBeDefined();
    expect(user.name).toBe("John Doe");
    // Password should be hashed
    expect(user.passwordHash).toBeDefined();
    expect(user.passwordHash).not.toBe("password123");
  });

  it("should hash password before creating user", async () => {
    const ctx = await createTestContext();
    const { procedures } = usersProcedure.handler({}, ctx);

    const user = await procedures.users.create({
      name: "John Doe",
      email: "john@example.com",
      password: "password123",
    });

    // Verify password can be validated
    const isValid = await ctx.context.fractal.password.comparePassword(
      "password123",
      user.passwordHash,
    );
    expect(isValid).toBe(true);
  });
});
```

## 6. Utility/Helper Testing

### 6.1. Pure Function Tests

```typescript
// tests/utils/date-formatter.test.ts
import { describe, it, expect } from "bun:test";
import { formatDate, parseDate, addDays } from "@/utils/date-formatter";

describe("Date Formatter Utils", () => {
  it("should format date to ISO string", () => {
    const date = new Date("2024-01-15T10:30:00.000Z");
    const formatted = formatDate(date, "iso");

    expect(formatted).toBe("2024-01-15T10:30:00.000Z");
  });

  it("should format date to human-readable string", () => {
    const date = new Date("2024-01-15T10:30:00.000Z");
    const formatted = formatDate(date, "human");

    expect(formatted).toBe("January 15, 2024");
  });

  it("should parse ISO date string", () => {
    const parsed = parseDate("2024-01-15T10:30:00.000Z");

    expect(parsed).toBeInstanceOf(Date);
    expect(parsed.getFullYear()).toBe(2024);
    expect(parsed.getMonth()).toBe(0); // January = 0
    expect(parsed.getDate()).toBe(15);
  });

  it("should add days to date", () => {
    const date = new Date("2024-01-15");
    const result = addDays(date, 5);

    expect(result.getDate()).toBe(20);
    expect(result.getMonth()).toBe(0); // Still January
  });
});
```

## 7. E2E Testing (Complete Flows)

### 7.1. User Registration Flow

```bash
#!/bin/bash
# tests/e2e/user-registration.sh

set -e

echo "🧪 Testing: User Registration Flow"

# 1. Open registration page
agent-browser --headed open http://localhost:3000/auth/sign-up
agent-browser snapshot -i

# 2. Fill registration form
agent-browser fill @e1 "John Doe"
agent-browser fill @e2 "john@example.com"
agent-browser fill @e3 "password123"
agent-browser screenshot ./screenshots/registration-form-filled.png

# 3. Submit form
agent-browser click @e4
agent-browser wait --url "**/dashboard"

# 4. Verify success
agent-browser snapshot -i
agent-browser get text @e5 | grep -q "Welcome, John Doe"
agent-browser screenshot ./screenshots/registration-success.png

# 5. Verify session saved
agent-browser state save ./auth-state.json

# 6. Test logout
agent-browser click @e6  # Logout button
agent-browser wait --url "**/login"

# 7. Test login with saved credentials
agent-browser snapshot -i
agent-browser fill @e1 "john@example.com"
agent-browser fill @e2 "password123"
agent-browser click @e3
agent-browser wait --url "**/dashboard"

echo "✅ User Registration Flow: PASSED"
```

## 8. Test Helpers & Utilities

### 8.1. Test App Factory

```typescript
// tests/helpers/test-app.ts
import { createIgniterApp } from "@/igniter";
import { createTestDatabase } from "./test-database";

export async function createTestApp() {
  const db = await createTestDatabase();
  const app = await createIgniterApp({
    database: db.prisma,
    env: "test",
  });

  return {
    request: app.request.bind(app),
    db: db,
    services: app.context.fractal,
    auth: {
      createSession: async (user: { email: string }) => {
        const dbUser = await db.prisma.user.findUnique({
          where: { email: user.email },
        });
        const token = app.context.fractal.jwt.generateToken({
          userId: dbUser!.id,
        });
        return { token, user: dbUser };
      },
    },
  };
}
```

### 8.2. Test Database Factory

```typescript
// tests/helpers/test-database.ts
import { PrismaClient } from "@prisma/client";

export async function createTestDatabase() {
  const prisma = new PrismaClient({
    datasources: {
      db: { url: process.env.TEST_DATABASE_URL },
    },
  });

  // Reset database before each test
  await prisma.$executeRawUnsafe("DROP SCHEMA public CASCADE");
  await prisma.$executeRawUnsafe("CREATE SCHEMA public");
  await prisma.$executeRaw`SET search_path TO public`;

  // Run migrations
  await runMigrations();

  return {
    prisma,
    seed: {
      user: async (data?: Partial<User>) => {
        return await prisma.user.create({
          data: {
            name: data?.name || "Test User",
            email: data?.email || `test-${Date.now()}@example.com`,
            passwordHash: data?.passwordHash || "hashed-password",
          },
        });
      },
      users: async (count = 10) => {
        const users = [];
        for (let i = 0; i < count; i++) {
          users.push(await seed.user({ name: `User ${i}` }));
        }
        return users;
      },
    },
  };
}
```

## 9. CI/CD Testing Workflow

### 9.1. GitHub Actions Example

```yaml
# .github/workflows/test.yml
name: Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest

    services:
      postgres:
        image: postgres:15
        env:
          POSTGRES_PASSWORD: postgres
          POSTGRES_DB: test
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5

    steps:
      - uses: actions/checkout@v3

      - uses: oven-sh/setup-bun@v1
        with:
          bun-version: latest

      - name: Install dependencies
        run: bun install

      - name: Run migrations
        run: bunx prisma migrate deploy
        env:
          DATABASE_URL: postgresql://postgres:postgres@localhost:5432/test

      - name: Run unit tests
        run: bun test

      - name: Run API tests
        run: bun test tests/features/**/*.test.ts

      - name: Run E2E tests (browser)
        run: bash tests/e2e/*.sh

      - name: Upload screenshots
        if: failure()
        uses: actions/upload-artifact@v3
        with:
          name: test-screenshots
          path: screenshots/
```

## 10. Best Practices

### 10.1. Test Organization

✅ **DO:**

- Mirror `src/` structure in `tests/`
- One test file per source file
- Group related tests with `describe()`
- Use descriptive test names

```typescript
describe("UserController", () => {
  describe("POST /api/v1/users", () => {
    it("should create user with valid data", async () => {});
    it("should reject invalid email", async () => {});
    it("should reject duplicate email", async () => {});
  });
});
```

### 10.2. Test Isolation

✅ **DO:**

- Reset database between tests
- Clear caches between tests
- Use unique identifiers (timestamps, UUIDs)

❌ **DON'T:**

- Share state between tests
- Depend on test execution order
- Use hardcoded IDs from prod data

### 10.3. Assertion Best Practices

```typescript
// ✅ CORRECT - Specific assertions
expect(user.name).toBe("John Doe");
expect(user.email).toBe("john@example.com");
expect(user.passwordHash).toBeUndefined();

// ❌ WRONG - Vague assertions
expect(user).toBeTruthy();
expect(Object.keys(user).length).toBeGreaterThan(0);
```

---

**Remember:** Comprehensive testing ensures confidence in your Igniter.js application. Test behavior, not implementation.

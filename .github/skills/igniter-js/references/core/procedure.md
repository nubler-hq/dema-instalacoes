---
description: Provides the correct and validated pattern for creating and using procedures (middlewares) in Igniter.js.
globs: src/features/**/*
alwaysApply: false
---

# Igniter.js: Procedures (Middlewares)

This guide provides the **definitive, validated pattern** for creating and using procedures in Igniter.js. It details error handling, context extension, and how procedures can serve as "Logic Providers" for controllers.

**IMPORTANT:** For creating feature-specific custom errors (mandatory pattern), see [errors.md](./errors.md).

## 1. The Core Philosophy of Procedures

In the Igniter.js architecture, Procedures are the most critical component for maintainability and security. They serve three distinct purposes:

1.  **Logic Guards:** They enforce rules (Authentication, Authorization, Rate Limiting, Business Invariants) _before_ an action ever executes. If a procedure throws, the controller is never reached.
2.  **Context Hydrators:** They act as a data pipeline. They take a raw request (e.g., a `sessionToken` cookie), resolve it to a rich domain object (e.g., a `User` entity), and attach it to the `context`.
3.  **Logic Providers:** Procedures can return helper functions or "mini-services" attached to the context, allowing controllers to invoke complex business logic (e.g., `context.procedures.user.createUser()`) without directly coupling to repositories or services.
4.  **Pure Consumers:** Procedures **DO NOT** instantiate Repositories or Services directly using `new Class()`. Instead, they **consume** the singleton instances that were already initialized in the Global Context (`src/igniter.context.ts`). This ensures Dependency Injection works correctly.

## 2. The Procedure Handler Signature

Every procedure handler receives two arguments:

```typescript
handler: async (options, context) => { ... }
```

1.  **`options` (Input):** Configuration passed when _using_ the procedure (e.g., `{ required: true }`).
2.  **`ctx` (Igniter Context):** The current request context, containing:
    - `request`: The standard Request object.
    - `response`: The Response builder.
    - `context`: The Global Dependency Graph (Repositories, Services, Database).
    - `next`: A function to yield control (rarely used for context extension).

## 3. Error Handling: Feature-Specific Custom Errors

**CRITICAL RULE:** Procedures must **NEVER** return a `Response` object for errors (e.g., `return response.unauthorized()`). This breaks control flow.

Instead, they **MUST** throw a **feature-specific custom error** that extends `IgniterError`. This ensures:

- Type-safe error codes with autocomplete
- Consistent error handling across the feature
- Full client-side type inference
- Automatic HTTP status code mapping
- Rich debugging context (causer, details, metadata)

**See [errors.md](./errors.md) for the complete pattern.**

### ❌ Wrong Way (Returning Response)

```typescript
if (!user) {
  // ❌ VIOLATION: This might be ignored or cause type errors
  return response.unauthorized("User not found");
}
```

### ✅ Correct Way (Throwing Feature-Specific Error)

```typescript
import { UserError } from "../users.errors";

if (!user) {
  // ✅ CORRECT: Type-safe, feature-specific error with auto-resolved message & status
  throw new UserError({
    code: "USER_NOT_FOUND", // Message & status auto-resolved from UserErrorCodes
    causer: "userProcedure.getById",
    details: { userId, searchedIn: ["database"] },
    metadata: { requestId: context.requestId },
    logger: context.logger,
  });
}
```

## 4. How to Extend Context (The "Return Object" Pattern)

Igniter uses a functional approach for context extension.

- **The Rule:** Whatever object you `return` from the handler is **shallow-merged** into the context for the next step.
- **The Constraint:** You must define the return type explicitly for TypeScript inference to work in the Controller.

### 4.1. Authentication Procedure (The Gold Standard)

This example demonstrates the perfect flow: Extract -> Validate -> Hydrate.

```typescript
// src/features/auth/procedures/auth.procedure.ts
import { igniter } from "@/igniter";
import { User } from "@prisma/client";
import { AuthError, AuthErrorCodes, AuthErrorMessages } from "../auth.errors";

// 1. Define Options
type AuthProcedureOptions = {
  required?: boolean; // Default: true
};

export const authProcedure = igniter.procedure({
  name: "authentication",
  handler: async (options: AuthProcedureOptions = { required: true }, ctx) => {
    const { request, context } = ctx;

    // Step 6: Context Hydration
    return {
      procedures: {
        auth: {
          getCurrentSession: async () => {
            // 2. Extract Token
            const token = request.cookies.get("sessionToken")?.value;

            // 3. Validate Presence
            if (options.required && !token) {
              throw new AuthError({
                code: "UNAUTHORIZED",
                message: "Session token missing",
                causer: "authProcedure.getCurrentSession",
                logger: context.logger,
              });
            }

            // 4. Verify Token
            const payload = token
              ? await context.services.jwt.verifyToken<{ userId: string }>(
                  token,
                )
              : null;

            if (options.required && !payload) {
              throw new AuthError({
                code: "TOKEN_INVALID",
                causer: "authProcedure.getCurrentSession",
                details: { token },
                logger: context.logger,
              });
            }

            // 5. Fetch User
            const user = payload
              ? await context.repositories.auth.getUserById(payload.userId)
              : null;

            if (options.required && !user) {
              throw new AuthError({
                code: "UNAUTHORIZED",
                message: "Authenticated user not found",
                causer: "authProcedure.getCurrentSession",
                details: { userId: payload?.userId },
                logger: context.logger,
              });
            }

            return {
              user,
              isAuthenticated: !!user,
              sessionToken: token || null,
            };
          },
          login: async (email: string, password: string) => {
            // Login logic here...
            return {} as User;
          },
        },
      },
    };
  },
});
```

### 4.2. Procedures as Logic Providers (The "Business Container" Pattern)

A powerful pattern in Igniter is using Procedures to expose **Business Functions** to the Controller. This keeps the Controller extremely thin (just input/output) and centralizes logic in the Procedure.

**Scenario:** We want a `userProcedure` that exposes methods like `createUser`, `banUser`, `updateProfile`.

```typescript
// src/features/users/procedures/user.procedure.ts
import { igniter } from "@/igniter";
import { User } from "@prisma/client";
import { UserError, UserErrorCodes, UserErrorMessages } from "../users.errors";

export const userProcedure = igniter.procedure({
  name: "userLogic",
  handler: async (options, ctx) => {
    const { context } = ctx; // Access Global Context (Repos, Services)

    // Return the toolbox
    return {
      procedures: {
        user: {
          createUser = async (data: CreateUserDTO) => {
            // 1. Validation Logic
            const existing = await context.repositories.users.findByEmail(data.email);
            if (existing) {
              throw new UserError({
                code: "USER_ALREADY_EXISTS",
                message: `Email '${data.email}' is already registered`,
                causer: "userProcedure.createUser",
                details: { email: data.email },
                logger: context.logger,
              });
            }

            // 2. Hashing Logic
            const hashedPassword = await context.services.password.hash(data.password);

            // 3. Persistence Logic
            return await context.repositories.users.create({
              ...data,
              password: hashedPassword
            });
          },
          banUser = async (userId: string, reason: string) => {
              const user = await context.repositories.users.findById(userId);
              if (!user) {
                  throw new UserError({
                      code: "USER_NOT_FOUND",
                      causer: "userProcedure.banUser",
                      details: { userId },
                      logger: context.logger,
                  });
              }

              await context.repositories.users.update(userId, { status: 'BANNED', banReason: reason });

              // Side effect: Send email
              await context.services.mailer.sendBanNotice(user.email, reason);
          };,
          updateProfile: async (id, data) => {
              // ... implementation
              return {} as User;
          }
        }
      }
    };
  }
});
```

**Usage in Controller:**

Notice how clean the Controller becomes. It doesn't know about hashing, email checks, or repositories. It just calls the procedure's method.

```typescript
// src/features/users/controllers/users.controller.ts
export const usersController = igniter.controller({
  // ...
  actions: {
    create: igniter.mutation({
      path: "/",
      method: "POST",
      body: CreateUserSchema,
      use: [userProcedure()], // Inject the logic toolbox
      handler: async ({ request, response, context }) => {
        // CALL THE PROCEDURE METHOD
        // The Controller delegates 100% of business logic
        const user = await context.procedures.user.createUser(request.body);

        return response.created(user);
      },
    }),

    ban: igniter.mutation({
      path: "/:id/ban",
      method: "POST",
      body: BanUserSchema,
      use: [userProcedure()],
      handler: async ({ request, params, response, context }) => {
        await context.procedures.user.banUser(params.id, request.body.reason);
        return response.noContent();
      },
    }),
  },
});
```

## 5. Advanced: Feature-Specific Data Injection

Procedures can also fetch and inject specific entities based on route parameters.

```typescript
// src/features/projects/procedures/project-access.procedure.ts
import { igniter } from "@/igniter";
import { Project } from "@prisma/client";
import { ProjectError, ProjectErrorCodes } from "../projects.errors";

type ProjectOptions = {
  paramName?: string; // Allow customizing which URL param holds the ID
};

type ProjectContext = {
  features: {
    project: {
      entity: Project;
      role: "OWNER" | "MEMBER" | "VIEWER";
    };
  };
};

export const projectAccessProcedure = igniter.procedure({
  name: "projectAccess",
  handler: async (
    options: ProjectOptions = { paramName: "projectId" },
    ctx,
  ): Promise<ProjectContext> => {
    const { request, context } = ctx;

    // 5. Hydrate Context
    return {
      procedures: {
        getSessionProject: async ({ userId }: { userId: string }) => {
          // 2. Extract Token
          const projectId = request.cookies.get("x-project-id")?.value;

          if (!projectId) {
            return null;
          }

          // 1. Dependency Check (Auth)
          if (!userId) {
            return null;
          }

          // 2. Extract Project ID from Route Params
          const projectId = request.params[options.paramName!];

          if (!projectId) {
            return null;
          }

          // 3. Use Global Repository
          const project =
            await context.repositories.projects.findById(projectId);

          if (!project) {
            return null;
          }

          // 4. Check Membership logic via Service
          const membership = await context.services.projects.getMembership(
            projectId,
            userId,
          );

          if (!membership) {
            return null;
          }
        },
        update: async (data) => {
          // Update project logic
          return await context.repositories.projects.update(projectId, data);
        },
        create: async (data) => {
          // Create project logic
          return await context.repositories.projects.create(data);
        },
        delete: async () => {
          // Delete project logic
          return await context.repositories.projects.delete(projectId);
        },
      },
    };
  },
});
```

## 6. Common Anti-Patterns (What NOT to do)

### ❌ 1. Instantiating Classes Inside Procedures

**Why it's bad:** It breaks Dependency Injection and makes testing impossible. Procedures must consume pre-instantiated singletons from the global context.

```typescript
// ❌ WRONG - instantiating in procedure
handler: async (opts, ctx) => {
  const repo = new UsersRepository(); // FORBIDDEN - creates hidden dependency
  const user = await repo.find(...);
}

// ✅ CORRECT - using global context and returning procedure methods
handler: async (opts, ctx) => {
  return {
    procedures: {
      users: {
        find: async (id: string) => {
          // Access pre-instantiated singleton from global context
          return await ctx.context.repositories.users.find(id);
        }
      }
    }
  };
}
```

### ❌ 2. Returning Responses for Errors

**Why it's bad:** It confuses the flow types and bypasses global error handling.

```typescript
// ❌ WRONG
if (!user) return response.notFound();

// ✅ CORRECT - For non -errors
if (!user) return null;

// ✅ CORRECT - For errors (use feature-specific error class)
if (!user) {
  throw new UserError({
    code: "USER_NOT_FOUND", // Auto-resolves message & status from UserErrorCodes
    causer: "userProcedure.method",
    details: { userId },
    logger: context.logger,
  });
}
```

### ❌ 3. Mutating Context Directly

**Why it's bad:** It breaks type inference and might be overwritten.

```typescript
// ❌ WRONG
handler: async (opts, ctx) => {
  ctx.context.user = user; // Mutation
  return;
};

// ✅ CORRECT
handler: async (opts, ctx) => {
  return { procedures: { auth: { user } } }; // Return object to merge and dont repeat feature names
};
```

### ❌ 4. Using `next()` for Context Extension

**Why it's bad:** It is not supported by the Igniter type inference engine.

```typescript
// ❌ WRONG
handler: async (opts, ctx) => {
  return ctx.next({ user }); // Does not work
};
```

## 8. Summary Checklist

When writing a procedure, ask yourself:

1.  Am I accessing data from `ctx.context.repositories` or `ctx.context.services`? (Yes = Good)
2.  Am I doing `new Class()` anywhere? (Yes = Bad)
3.  Am I returning an object to extend the context? Following de pattern { procedures: { featureName: {} } } (Yes = Good)
4.  Am I not repeating feature names inside the returned object? (Yes = Good)
5.  If I throw an error, am I using feature-specific error classes (e.g., `throw new UserError`, `throw new AuthError`)? (Yes = Good)
6.  If I need complex logic, am I exposing a function (e.g., `createUser`) in the returned context? (Yes = Good)

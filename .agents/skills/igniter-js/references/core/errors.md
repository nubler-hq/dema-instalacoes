---
description: Definitive guide for creating type-safe, feature-specific errors in Igniter.js with full client-side type safety.
globs: src/features/**/*
alwaysApply: true
---

# Igniter.js: Feature-Specific Error Handling (Type-Safe Pattern)

This guide establishes the **mandatory pattern** for creating custom, type-safe error classes per feature, ensuring consistent error handling from backend to frontend with full TypeScript inference.

## 1. The Philosophy: Errors as Domain Contracts

In Igniter.js, errors are not just exceptions—they are **documented contracts** between your API and its consumers. Each feature should:

1. **Define its error codes** as a typed constant object
2. **Export error types** for client-side inference
3. **Provide helper classes** that extend `IgniterError` with feature-specific defaults
4. **Document common error scenarios** for both agents and developers

## 2. File Structure

Every feature MUST have an `errors.ts` file alongside its interfaces:

```
src/features/users/
  ├── users.interfaces.ts    # Schemas, types, constants
  ├── users.errors.ts         # ✅ Error codes & classes
  ├── users.controller.ts
  ├── procedures/
  └── repositories/
```

## 3. The Complete Error Pattern (Reference Implementation)

### 3.1. Error Codes Definition (Unified Mapping)

**File**: `src/features/users/users.errors.ts`

````typescript
import { IgniterError } from "@igniter-js/core";
import type { IgniterLogger } from "@igniter-js/core";

/**
 * @const UserErrorCodes
 * @description Centralized error codes for the Users feature with HTTP status codes and default messages.
 * Used for type-safe error handling in both backend procedures and frontend client.
 * Each error code includes its HTTP status and a default message that can be overridden.
 */
export const UserErrorCodes = {
  USER_NOT_FOUND: {
    statusCode: 404,
    message: "User was not found in the system",
  },
  USER_ALREADY_EXISTS: {
    statusCode: 409,
    message: "A user with this email already exists",
  },
  INVALID_CREDENTIALS: {
    statusCode: 401,
    message: "The provided email or password is incorrect",
  },
  EMAIL_NOT_VERIFIED: {
    statusCode: 403,
    message: "Please verify your email before proceeding",
  },
  ACCOUNT_SUSPENDED: {
    statusCode: 403,
    message: "Account has been suspended",
  },
  WEAK_PASSWORD: {
    statusCode: 400,
    message:
      "Password must be at least 8 characters with uppercase, lowercase, and numbers",
  },
  SESSION_EXPIRED: {
    statusCode: 401,
    message: "Your session has expired. Please log in again",
  },
} as const;

/**
 * @typedef {UserErrorCode}
 * @description Union type of all possible user error codes.
 * Enables exhaustive switch-case handling on the client.
 */
export type UserErrorCode = keyof typeof UserErrorCodes;

/**
 * @class UserError
 * @description Custom error class for the Users feature.
 * Extends IgniterError with feature-specific metadata and automatic defaults from UserErrorCodes.
 *
 * @example
 * ```typescript
 * // With default message and status
 * throw new UserError({
 *   code: "USER_NOT_FOUND",
 *   causer: "UserRepository.findById",
 *   details: { userId: "123" },
 * });
 *
 * // With custom message (overrides default)
 * throw new UserError({
 *   code: "USER_NOT_FOUND",
 *   message: "User with ID 123 does not exist in tenant ABC",
 *   causer: "UserRepository.findById",
 *   details: { userId: "123", tenantId: "ABC" },
 * });
 * ```
 */
export class UserError extends IgniterError {
  constructor(params: {
    code: UserErrorCode;
    message?: string;
    statusCode?: number;
    causer?: string;
    details?: unknown;
    metadata?: Record<string, unknown>;
    logger?: IgniterLogger;
  }) {
    // Auto-resolve message and statusCode from UserErrorCodes if not provided
    const errorConfig = UserErrorCodes[params.code];

    super({
      message: params.message ?? errorConfig.message,
      code: params.code,
      statusCode: params.statusCode ?? errorConfig.statusCode,
      causer: params.causer,
      details: params.details,
      metadata: params.metadata,
      logger: params.logger,
    });
  }
}
````

## 4. Usage in Procedures

**File**: `src/features/users/procedures/user.procedure.ts`

```typescript
import { igniter } from "@/igniter";
import { UserError, UserErrorCodes } from "../users.errors";

export const userProcedure = igniter.procedure({
  name: "userLogic",
  handler: async (options, ctx) => {
    const { context } = ctx;

    return {
      procedures: {
        user: {
          getById: async (userId: string) => {
            const user = await context.repositories.users.findById(userId);

            if (!user) {
              // ✅ Uses default message and status from UserErrorCodes
              throw new UserError({
                code: "USER_NOT_FOUND",
                causer: "userProcedure.getById",
                details: {
                  userId,
                  searchedIn: ["database"],
                  timestamp: Date.now(),
                },
                metadata: {
                  requestId: context.requestId,
                  tenantId: context.tenant?.id,
                },
                logger: context.logger,
              });
            }

            return user;
          },

          register: async (data: {
            email: string;
            password: string;
            name: string;
          }) => {
            // Check if user exists
            const existingUser = await context.repositories.users.findByEmail(
              data.email,
            );

            if (existingUser) {
              // ✅ Custom message overrides default
              throw new UserError({
                code: "USER_ALREADY_EXISTS",
                message: `The email '${data.email}' is already registered in the system`,
                causer: "userProcedure.register",
                details: { email: data.email },
                logger: context.logger,
              });
            }

            // Validate password strength
            if (data.password.length < 8) {
              // ✅ Uses default message from UserErrorCodes
              throw new UserError({
                code: "WEAK_PASSWORD",
                causer: "userProcedure.register",
                details: { passwordLength: data.password.length },
              });
            }

            // Create user...
            const passwordHash = await context.fractal.password.hashPassword(
              data.password,
            );
            const user = await context.repositories.users.create({
              ...data,
              passwordHash,
            });

            return user;
          },
        },
      },
    };
  },
});
```

## 5. Usage in Authentication Procedures

**File**: `src/features/auth/auth.errors.ts`

```typescript
import { IgniterError } from "@igniter-js/core";
import type { IgniterLogger } from "@igniter-js/core";

/**
 * @const AuthErrorCodes
 * @description Centralized error codes for the Auth feature with HTTP status codes and default messages.
 */
export const AuthErrorCodes = {
  UNAUTHORIZED: {
    statusCode: 401,
    message: "Authentication is required to access this resource",
  },
  TOKEN_EXPIRED: {
    statusCode: 401,
    message: "Your session has expired. Please log in again",
  },
  TOKEN_INVALID: {
    statusCode: 401,
    message: "Invalid authentication token provided",
  },
  INSUFFICIENT_PERMISSIONS: {
    statusCode: 403,
    message: "You do not have sufficient permissions to perform this action",
  },
  MFA_REQUIRED: {
    statusCode: 401,
    message: "Multi-factor authentication is required",
  },
} as const;

export type AuthErrorCode = keyof typeof AuthErrorCodes;

export class AuthError extends IgniterError {
  constructor(params: {
    code: AuthErrorCode;
    message?: string;
    statusCode?: number;
    causer?: string;
    details?: unknown;
    metadata?: Record<string, unknown>;
    logger?: IgniterLogger;
  }) {
    // Auto-resolve message and statusCode from AuthErrorCodes if not provided
    const errorConfig = AuthErrorCodes[params.code];

    super({
      message: params.message ?? errorConfig.message,
      code: params.code,
      statusCode: params.statusCode ?? errorConfig.statusCode,
      causer: params.causer,
      details: params.details,
      metadata: params.metadata,
      logger: params.logger,
    });
  }
}
```

**File**: `src/features/auth/procedures/auth.procedure.ts`

```typescript
import { igniter } from "@/igniter";
import { AuthError, AuthErrorCodes } from "../auth.errors";

export const authProcedure = igniter.procedure({
  name: "authentication",
  handler: async (
    options: { required?: boolean } = { required: true },
    ctx,
  ) => {
    const { request, context } = ctx;

    return {
      procedures: {
        auth: {
          getCurrentSession: async () => {
            const sessionToken = request.cookies.get("x-session-token")?.value;

            // If required and no token
            if (options.required && !sessionToken) {
              throw new AuthError({
                code: "UNAUTHORIZED",
                causer: "authProcedure.getCurrentSession",
                logger: context.logger,
              });
            }

            if (!sessionToken) {
              return { user: null };
            }

            // Verify token
            let userId: string | undefined;
            try {
              const decoded = context.fractal.jwt.verifyToken(sessionToken);
              userId = decoded.userId;
            } catch (error) {
              throw new AuthError({
                code: "TOKEN_INVALID",
                causer: "authProcedure.getCurrentSession",
                details: { error: error.message },
                logger: context.logger,
              });
            }

            // Find user
            const user = await context.repositories.auth.getUserById(userId);

            if (options.required && !user) {
              throw new AuthError({
                code: "UNAUTHORIZED",
                message: "Authenticated user not found in database",
                causer: "authProcedure.getCurrentSession",
                details: { userId },
                logger: context.logger,
              });
            }

            return { user };
          },
        },
      },
    };
  },
});
```

## 6. Client-Side Type Safety

With the error pattern in place, the client automatically infers error types:

### 6.1. Server-Side Usage (.query / .mutate)

```typescript
// Server Component or API Route
import { api } from "@/igniter.client";

// Query (GET)
const { data, error } = await api.users.getById.query({
  params: { id: "123" },
});

if (error) {
  console.log(error.code); // "USER_NOT_FOUND"
  console.log(error.message); // "User not found"
  console.log(error.statusCode); // 404
  console.log(error.details); // { userId: "123" }
  console.log(error.metadata); // { requestId: "...", tenantId: "..." }
}

// Mutation (POST/PUT/DELETE)
const { data, error } = await api.users.create.mutate({
  body: { name: "John", email: "john@example.com" },
});

if (error) {
  switch (error.code) {
    case "USER_ALREADY_EXISTS":
      // Handle duplicate user
      break;
    case "WEAK_PASSWORD":
      // Handle password validation
      break;
  }
}
```

### 6.2. Client-Side Usage (React Hooks)

#### 6.2.1. Query Hooks (.useQuery)

```typescript
'use client'

import { api } from '@/igniter.client'

export function UserProfile({ userId }: { userId: string }) {
  const { data, error, isLoading, refetch } = api.users.getById.useQuery({
    params: { id: userId }
  });

  // ✅ Loading state
  if (isLoading) {
    return <div>Loading user...</div>;
  }

  // ✅ Error handling with type-safe error codes
  if (error) {
    switch (error.code) {
      case "USER_NOT_FOUND":
        return (
          <div className="error">
            <p>User not found</p>
            <button onClick={() => router.push("/users")}>
              Back to Users
            </button>
          </div>
        );

      case "UNAUTHORIZED":
        return (
          <div className="error">
            <p>Please log in to view this profile</p>
            <button onClick={() => router.push("/login")}>
              Login
            </button>
          </div>
        );

      case "ACCOUNT_SUSPENDED":
        return (
          <div className="error">
            <p>{error.message}</p>
            {error.details?.reason && (
              <p className="text-sm">Reason: {error.details.reason}</p>
            )}
          </div>
        );

      default:
        return (
          <div className="error">
            <p>Error: {error.message}</p>
            <button onClick={() => refetch()}>Try Again</button>
          </div>
        );
    }
  }

  // ✅ Success state
  if (!data) {
    return <div>No data available</div>;
  }

  return (
    <div>
      <h1>{data.name}</h1>
      <p>{data.email}</p>
    </div>
  );
}
```

#### 6.2.2. Mutation Hooks (.useMutation)

```typescript
'use client'

import { api } from '@/igniter.client'
import { useState } from 'react'
import { toast } from 'sonner'

export function CreateUserForm() {
  const [formData, setFormData] = useState({ name: '', email: '', password: '' });

  const { mutate: createUser, isLoading, error } = api.users.create.useMutation({
    onSuccess: (data) => {
      toast.success("User created successfully!");
      router.push(`/users/${data.id}`);
    },
    onError: (error) => {
      // ✅ Type-safe error handling with specific codes
      switch (error.code) {
        case "USER_ALREADY_EXISTS":
          toast.error(`The email ${formData.email} is already registered`);
          break;

        case "WEAK_PASSWORD":
          toast.error("Password is too weak. Use at least 8 characters.");
          break;

        case "INVALID_INPUT":
          toast.error(error.message);
          // Show field-specific errors
          if (error.details?.field) {
            console.log(`Field error: ${error.details.field}`);
          }
          break;

        case "INSUFFICIENT_PERMISSIONS":
          toast.error("You don't have permission to create users");
          router.push("/unauthorized");
          break;

        default:
          toast.error(error.message ?? "Failed to create user");
      }
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createUser({ body: formData });
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        value={formData.name}
        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
        placeholder="Name"
      />
      <input
        value={formData.email}
        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
        placeholder="Email"
      />
      <input
        type="password"
        value={formData.password}
        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
        placeholder="Password"
      />

      {/* ✅ Show inline errors */}
      {error && (
        <div className="error-banner">
          {error.message}
        </div>
      )}

      <button type="submit" disabled={isLoading}>
        {isLoading ? "Creating..." : "Create User"}
      </button>
    </form>
  );
}
```

#### 6.2.3. Optimistic Updates with Error Rollback

```typescript
'use client'

import { api, useQueryClient } from '@/igniter.client'
import { toast } from 'sonner'

export function TodoItem({ todo }: { todo: Todo }) {
  const { invalidate } = useQueryClient();

  const { mutate: toggleTodo } = api.todos.toggle.useMutation({
    // Optimistic update
    onMutate: async (variables) => {
      // Cancel outgoing refetches
      await invalidate(['todos.list']);

      // Snapshot the previous value for rollback
      return { previousTodos };
    },

    onError: (error, variables, context) => {
      // ✅ Rollback on error
      if (context?.previousTodos) {
        // Restore previous state
      }

      // ✅ Type-safe error handling
      switch (error.code) {
        case "TODO_NOT_FOUND":
          toast.error("This todo was deleted");
          break;
        case "INSUFFICIENT_PERMISSIONS":
          toast.error("You can't modify this todo");
          break;
        default:
          toast.error(error.message ?? "Failed to update todo");
      }
    },

    onSuccess: () => {
      toast.success("Todo updated!");
    },

    onSettled: () => {
      // Refetch after error or success
      invalidate(['todos.list']);
    }
  });

  return (
    <div onClick={() => toggleTodo({ params: { id: todo.id } })}>
      {todo.title}
    </div>
  );
}
```

### 6.3. Global Error Handler

```typescript
// app/providers.tsx
'use client'

import { IgniterProvider } from '@igniter-js/core/client'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'

export function Providers({ children }: { children: React.ReactNode }) {
  const router = useRouter();

  return (
    <IgniterProvider
      options={{
        onError: (error) => {
          // ✅ Global error handling with type-safe codes
          console.error('API Error:', error);

          // Handle authentication errors globally
          if (error.code === "UNAUTHORIZED" || error.code === "TOKEN_EXPIRED") {
            toast.error("Session expired. Please log in again.");
            router.push("/login");
            return;
          }

          // Handle permission errors globally
          if (error.code === "INSUFFICIENT_PERMISSIONS") {
            toast.error("You don't have permission for this action");
            router.push("/unauthorized");
            return;
          }

          // Handle server errors globally
          if (error.statusCode >= 500) {
            toast.error("Server error. Please try again later.");
            return;
          }

          // Let component-level handlers deal with other errors
        },

        onSuccess: (data, action) => {
          // Optional: Global success handling
          console.log(`${action} succeeded:`, data);
        }
      }}
    >
      {children}
    </IgniterProvider>
  );
}
```

### 6.4. Error Boundary Integration

```typescript
'use client'

import { ErrorBoundary } from 'react-error-boundary'
import { api } from '@/igniter.client'

function ApiErrorFallback({ error, resetErrorBoundary }: any) {
  // ✅ Handle API errors in error boundary
  if (error.code) {
    switch (error.code) {
      case "UNAUTHORIZED":
        return (
          <div>
            <h1>Authentication Required</h1>
            <button onClick={() => router.push("/login")}>
              Login
            </button>
          </div>
        );

      case "NOT_FOUND":
        return (
          <div>
            <h1>Resource Not Found</h1>
            <button onClick={resetErrorBoundary}>Go Back</button>
          </div>
        );

      default:
        return (
          <div>
            <h1>Error: {error.message}</h1>
            <button onClick={resetErrorBoundary}>Try Again</button>
          </div>
        );
    }
  }

  // Non-API error
  return (
    <div>
      <h1>Something went wrong</h1>
      <button onClick={resetErrorBoundary}>Try Again</button>
    </div>
  );
}

export function SafeApiComponent({ children }: { children: React.ReactNode }) {
  return (
    <ErrorBoundary FallbackComponent={ApiErrorFallback}>
      {children}
    </ErrorBoundary>
  );
}
```

## 7. Best Practices Checklist

When creating feature errors, ensure:

- [ ] Error codes are defined as objects with `statusCode` and `message` (unified mapping)
- [ ] Error codes use `as const` for type safety
- [ ] Error type is exported as `keyof typeof ErrorCodes`
- [ ] Custom error class extends `IgniterError`
- [ ] Constructor auto-resolves `message` and `statusCode` from error codes if not provided
- [ ] `causer` field identifies the throwing function for debugging
- [ ] `logger` is passed for telemetry integration
- [ ] Error codes are imported and used in procedures
- [ ] Client-side switch cases cover all error codes
- [ ] Default messages are clear and actionable
- [ ] Custom messages can override defaults when needed

## 8. Common Error Patterns by Feature

### 8.1. Resource Not Found (404)

```typescript
// Define in [feature].errors.ts
export const FeatureErrorCodes = {
  RESOURCE_NOT_FOUND: {
    statusCode: 404,
    message: "Resource not found",
  },
  // ... other codes
} as const;

// Usage
throw new FeatureError({
  code: "RESOURCE_NOT_FOUND",
  message: `Resource '${resourceId}' not found`, // Optional: override default
  causer: "procedure.method",
  details: { resourceId },
});
```

### 8.2. Resource Already Exists (409 Conflict)

```typescript
// Define in [feature].errors.ts
export const FeatureErrorCodes = {
  RESOURCE_ALREADY_EXISTS: {
    statusCode: 409,
    message: "Resource already exists",
  },
  // ... other codes
} as const;

// Usage
throw new FeatureError({
  code: "RESOURCE_ALREADY_EXISTS",
  message: `Resource with identifier '${identifier}' already exists`,
  causer: "procedure.create",
  details: { identifier },
});
```

### 8.3. Validation Error (400 Bad Request)

```typescript
// Define in [feature].errors.ts
export const FeatureErrorCodes = {
  INVALID_INPUT: {
    statusCode: 400,
    message: "The provided input is invalid",
  },
  // ... other codes
} as const;

// Usage
throw new FeatureError({
  code: "INVALID_INPUT",
  message: "Validation failed for field 'email'",
  causer: "procedure.validate",
  details: {
    field: "email",
    reason: "Invalid email format",
    provided: invalidEmail,
  },
});
```

### 8.4. Authorization Error (403 Forbidden)

```typescript
// Define in [feature].errors.ts
export const FeatureErrorCodes = {
  INSUFFICIENT_PERMISSIONS: {
    statusCode: 403,
    message: "Insufficient permissions to perform this action",
  },
  // ... other codes
} as const;

// Usage
throw new FeatureError({
  code: "INSUFFICIENT_PERMISSIONS",
  message: `User lacks required permission: ${requiredPermission}`,
  causer: "procedure.method",
  details: {
    userId: user.id,
    requiredPermission,
    userPermissions: user.permissions,
  },
});
```

## 9. Anti-Patterns to Avoid

### ❌ Using Generic Error Codes

```typescript
// ❌ BAD: No type safety, error-prone
throw new IgniterError({
  code: "ERROR", // Too generic
  message: "Something went wrong",
  statusCode: 500,
});
```

### ❌ Hardcoding Error Messages and Status Codes

```typescript
// ❌ BAD: Unnecessarily overriding default message and status
throw new UserError({
  code: "USER_NOT_FOUND",
  message: "User not found", // Unnecessary - default message already defined
  statusCode: 404, // Unnecessary - default status already defined
});
```

### ❌ Separating Error Codes, Messages, and Status Codes

```typescript
// ❌ BAD: Three separate objects to maintain
export const ErrorCodes = { USER_NOT_FOUND: "USER_NOT_FOUND" };
export const ErrorMessages = { USER_NOT_FOUND: "User not found" };
export const ErrorStatus = { USER_NOT_FOUND: 404 };
```

### ❌ Not Providing Context

```typescript
// ❌ BAD: Minimal debugging information
throw new UserError({
  code: "USER_NOT_FOUND",
  // Missing: causer, details for debugging
});
```

### ✅ Correct Pattern (Unified Mapping)

```typescript
// ✅ GOOD: Everything in one place - UserErrorCodes
export const UserErrorCodes = {
  USER_NOT_FOUND: {
    statusCode: 404,
    message: "User was not found in the system",
  },
} as const;

// ✅ GOOD: Using default message (no message override needed)
throw new UserError({
  code: "USER_NOT_FOUND", // Message & status auto-resolved from UserErrorCodes
  causer: "userProcedure.getById",
  details: { userId },
  logger: context.logger,
});

// ✅ GOOD: Custom message when needed (overrides default)
throw new UserError({
  code: "USER_NOT_FOUND",
  message: `User with ID '${userId}' was not found in tenant '${tenantId}'`,
  causer: "userProcedure.getById",
  details: { userId, tenantId },
  logger: context.logger,
});
```

## 10. Migration Guide

If you have existing code using `IgniterResponseError` or generic `IgniterError` instances:

### Step 1: Create the `[feature].errors.ts` file

```typescript
// src/features/users/users.errors.ts
import { IgniterError } from "@igniter-js/core";
import type { IgniterLogger } from "@igniter-js/core";

export const UserErrorCodes = {
  USER_NOT_FOUND: {
    statusCode: 404,
    message: "User was not found in the system",
  },
  USER_ALREADY_EXISTS: {
    statusCode: 409,
    message: "A user with this email already exists",
  },
} as const;

export type UserErrorCode = keyof typeof UserErrorCodes;

export class UserError extends IgniterError {
  constructor(params: {
    code: UserErrorCode;
    message?: string;
    statusCode?: number;
    causer?: string;
    details?: unknown;
    metadata?: Record<string, unknown>;
    logger?: IgniterLogger;
  }) {
    const errorConfig = UserErrorCodes[params.code];

    super({
      message: params.message ?? errorConfig.message,
      code: params.code,
      statusCode: params.statusCode ?? errorConfig.statusCode,
      causer: params.causer,
      details: params.details,
      metadata: params.metadata,
      logger: params.logger,
    });
  }
}
```

### Step 2: Replace old error throws

```typescript
// ❌ Before (Old Pattern)
throw new IgniterResponseError({
  code: "ERR_UNAUTHORIZED",
  message: "User not found",
});

// OR

throw new IgniterError({
  message: "User not found",
  code: "USER_NOT_FOUND",
  statusCode: 404,
});

// ✅ After (New Unified Pattern)
throw new UserError({
  code: "USER_NOT_FOUND", // Auto-resolves to 404 + default message
  causer: "userProcedure.getById",
  details: { userId },
  logger: context.logger,
});

// ✅ With custom message (optional)
throw new UserError({
  code: "USER_NOT_FOUND",
  message: `User with ID '${userId}' was not found in tenant '${tenantId}'`,
  causer: "userProcedure.getById",
  details: { userId, tenantId },
  logger: context.logger,
});
```

### Step 3: Update imports in procedures

```typescript
// ❌ Before
import { IgniterResponseError } from "@igniter-js/core";

// ✅ After
import { UserError, UserErrorCodes } from "../users.errors";
```

---

**Remember**: Well-defined errors are the API's documentation. Invest time in creating clear, type-safe error contracts with unified error code mappings and your future self (and your users) will thank you.

---
alwaysApply: true
---

# Igniter.js Controller & API Development Standards (Optimized for LLMs)

This guide provides a **COMPLETE, ACCURATE, and MANDATORY** reference for creating controllers and actions in Igniter.js. It incorporates established architectural patterns, coding best practices, and lessons learned from real-world implementations, ensuring strict adherence for all future development.

**CRITICAL:** For feature-specific error handling (mandatory pattern), see [errors.md](./errors.md). All features MUST define custom error classes instead of using generic `IgniterResponseError`.

## 🚨 CRITICAL ARCHITECTURAL PRINCIPLES

### 1. Separation of Concerns (SoC)

- **Controllers**: Responsible _only_ for handling HTTP requests, validating input, orchestrating business logic (via procedures/repositories), and constructing HTTP responses.
- **Procedures**: Responsible for extending the request context, injecting dependencies (like repositories), handling cross-cutting concerns (e.g., authentication, logging), and pre-processing requests.
- **Repositories**: Responsible _only_ for direct data access operations (e.g., Prisma calls). They abstract the database layer from the business logic.
- **Interfaces**: Centralize all shared definitions (constants, Zod schemas, types, interfaces) for a given feature.

### 2. Type Safety & Documentation First

- **End-to-End Type Safety**: Leverage TypeScript and Zod to ensure type consistency from request body to database operations.
- **Comprehensive TSDoc**: All exposed components (controllers, actions, procedures, repositories, interfaces, schemas, types, constants) _MUST_ be fully documented with TSDoc in English.

### 3. Immutability & Context Extension

- **Context is Extended, Not Mutated**: Procedures extend the Igniter context by returning an object, which is then shallow-merged. Direct mutation of the `context` object in procedures is forbidden.
- **Pattern: Always use `context.procedures.[feature].[method]`**: All procedure returns must follow the hierarchical structure `{ procedures: { [feature]: { [method]: () => {} } } }`. Never inject repositories directly into context - they must be instantiated in the global context (`igniter.context.ts`).
- **Special Case: `next()` for Response Processing**: The `next()` function is supported and should **only** be used in middleware-style procedures that need to inspect or modify the response after the controller executes (e.g., logging, auditing, response transformation). When using `next()`, you CANNOT extend the context with new properties as type inference is lost. For context extension, always return an object with the `procedures` key.
- **Default Behavior: Context Extension**: Procedures should return an object following the pattern `{ procedures: { [feature]: { [methods] } } }` to inject business logic methods into the controller context.
- **Never Instantiate in Procedures**: Procedures must NEVER instantiate repositories or services using `new ClassName()`. They should only access pre-instantiated singletons from the global context via `context.fractal` or `context.repositories`.

### 4. No Modification of Default Igniter Files

- **CRITICAL**: Never modify default Igniter files such as `src/igniter.ts`, `src/igniter.context.ts`, or `src/igniter.router.ts`. These files are designed for automatic type inference and core configuration. Any custom context or setup _MUST_ be handled in feature-specific procedures that extend the existing context.

## 🚨 CRITICAL: API Response Patterns - The ONLY Valid API

### ❌ WHAT DOESN'T WORK (Forbidden Methods/Patterns):

```typescript
// ❌ INCORRECT - These methods DO NOT EXIST on the response object
return response.ok(data);
return response.error(code, message);
return response.response(data);
return new IgniterResponseError({...});     // Use response.error(...) instead

// ❌ INCORRECT - Wrong parameter structure or type
return response.badRequest(code, message);  // Parameter order is (message, data)
return response.unauthorized(code, message); // Parameter order is (message, data)

// ❌ INCORRECT - Using generic IgniterResponseError instead of feature-specific errors
throw new IgniterResponseError({ code: "ERR_NOT_FOUND", message: "..." }); // Use feature errors!
```

### ✅ WHAT ACTUALLY WORKS (Mandatory Correct API):

- **ALWAYS** finalize the response chain with a method call that returns `Response` (e.g., `.toResponse()`, `.created(data)`, etc.).

```typescript
// ✅ CORRECT - Success responses (Always 2xx status codes)
return response.success(data); // 200 OK
return response.created(data); // 201 Created
return response.noContent(); // 204 No Content (No body expected)
return response.json(data); // Custom JSON response, defaults to 200 OK

// ✅ CORRECT - Error responses (Always 4xx or 5xx status codes)
return response.badRequest(message, data); // 400 Bad Request
return response.unauthorized(message, data); // 401 Unauthorized
return response.forbidden(message, data); // 403 Forbidden
return response.notFound(message, data); // 404 Not Found

// ✅ CORRECT - Custom status or headers
return response
  .status(418) // Set custom HTTP status code
  .setHeader("X-Custom", "value") // Set custom HTTP header
  .setCookie("session", token, {
    // Set HTTP cookie
    httpOnly: true,
    secure: true,
    maxAge: 3600,
  })
  .success(data); // MANDATORY: Finalize the response

// ✅ CORRECT - Cache Revalidation (for Next.js App Router)
return response.success(data).revalidate(["users", "posts"]);
```

## 🔍 MANDATORY: Development & Documentation Protocols

### 1. Source Code Analysis First

**BEFORE** implementing any Igniter.js functionality, **YOU MUST**:

1.  **Analyze the source code directly**: Use `explore_source` to understand the actual API. Example:
    ```typescript
    await explore_source({
      filePath: "node_modules/@igniter-js/core/dist/index.d.ts",
      symbol: "IgniterResponseProcessor",
    });
    ```
2.  **Read the complete TSDoc/JSDoc documentation** in the `.d.ts` files.
3.  **Never assume methods exist** based on intuitive naming.
4.  **Test with minimal examples** before full implementation.

### 2. Procedures Naming Convention

- **ALWAYS use concise and clear names** for procedures, matching the file name (e.g., `name: "authProcedure"` for `auth.procedure.ts`). This improves readability, maintainability, and debuggability.

### 3. Documentation Standard for Interfaces, Schemas & Constants (`*.interfaces.ts`)

- **CRITICAL**: All exported constants, Zod schemas, types, and interfaces within `src/features/[feature]/[feature].interfaces.ts` files **MUST** include comprehensive TSDoc comments in English. This promotes clarity, type safety, and auto-generated documentation.

```typescript
// src/features/auth/auth.interfaces.ts (Example)
import { z } from "zod";

/**
 * @constant SALT_ROUNDS
 * @description The number of salt rounds to use when hashing passwords with bcrypt.
 * A higher number increases security but also computation time.
 */
export const SALT_ROUNDS = 10;

/**
 * @schema SignUpBodySchema
 * @description Zod schema for validating the request body when a new user signs up.
 * Ensures name, email, and password meet specified criteria.
 */
export const SignUpBodySchema = z.object({
  name: z.string().min(3, "Name must be at least 3 characters"),
  email: z.string().email("Invalid email format"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

/**
 * @typedef {import("zod").infer<typeof SignUpBodySchema>} SignUpBody
 * @description Type definition for the sign-up request body, inferred from SignUpBodySchema.
 */
export type SignUpBody = z.infer<typeof SignUpBodySchema>;
```

### 4. Inline Comments for Business Logic

- **MANDATORY**: Every significant line of business logic, observation, or rule in controllers, procedures, and repository methods **MUST** be accompanied by an inline comment in English. Use the following structured prefix system:
  - `// Business Rule: [message]` - Explains a specific business requirement, validation, or constraint.
  - `// Observation: [message]` - Notes an observed state, data extraction, or pre-condition.
  - `// Business Logic: [message]` - Describes a core operation, calculation, or data transformation.
  - `// Security Rule: [message]` - Highlights a security-related control, check, or mechanism (e.g., password hashing, JWT).
  - `// Session Management: [message]` - Details actions related to user sessions (e.g., cookie setting/clearing, JWT generation).
  - `// Data Transformation: [message]` - Explains data formatting, mapping, or conversion steps.
  - `// Context Extension: [message]` - Describes how the Igniter context is being extended by a procedure.
  - `// Response: [message]` - Explains the content, status, and side-effects (e.g., cookies) of the HTTP response.

### 5. `zod` Import in Controllers

- **MANDATORY**: Keep `import { z } from "zod";` in controller files, even if the `z` object is not directly used within the handler function. This ensures clarity regarding schema definitions and project consistency.

### 6. `as const` for Path Parameters

- **CRITICAL**: For all action `path` definitions that include parameters (e.g., `/:id`), **ALWAYS** use `as const` (e.g., `path: '/:id' as const`). This enables powerful TypeScript type inference for `request.params` in the handler, preventing `unknown` types and improving code safety.

## 🚨 CRITICAL: Error Handling Pattern

**MANDATORY:** Every feature MUST define its own error codes and error class. See [errors.md](./errors.md) for the complete pattern.

### Required File Structure

```
src/features/users/
  ├── users.interfaces.ts    # Schemas, types, constants
  ├── users.errors.ts        # ✅ Error codes & custom error class (REQUIRED)
  ├── controllers/
  ├── procedures/
  └── repositories/
```

### Quick Reference

```typescript
// src/features/users/users.errors.ts
export const UserErrorCodes = {
  USER_NOT_FOUND: {
    statusCode: 404,
    message: "User not found",
  },
  USER_ALREADY_EXISTS: {
    statusCode: 409,
    message: "User already exists",
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

// Usage in procedures:
throw new UserError({
  code: "USER_NOT_FOUND", // Message & status auto-resolved from UserErrorCodes
  causer: "userProcedure.getById",
  details: { userId },
  logger: context.logger,
});
```

## ✅ Core Architectural Pattern: Business Logic Injection via Procedures

Procedures inject business logic methods into the controller context, keeping controllers thin and focused. Repositories and services are ALWAYS instantiated in the global context (`igniter.context.ts`), never in procedures.

### 1. Repository Definition (`src/features/[feature]/repositories/[feature].repository.ts`)

- **Purpose**: Encapsulate all direct Prisma ORM calls related to a specific entity or feature.
- **Location**: `src/features/[feature]/repositories/[feature].repository.ts`
- **TSDoc**: Every repository class and _all_ its public methods **MUST** have comprehensive TSDoc comments in English.

```typescript
// src/features/events/repositories/events.repository.ts
import { PrismaClient, Event } from "@prisma/client";
import { CreateEventBody } from "../events.interfaces";

/**
 * @class EventsRepository
 * @description Repository for managing event-related data operations with Prisma.
 */
export class EventsRepository {
  private prisma: PrismaClient;

  constructor(prisma: PrismaClient) {
    this.prisma = prisma;
  }

  async create(data: CreateEventBody & { userId: string }): Promise<Event> {
    return this.prisma.event.create({ data });
  }

  async list(userId: string): Promise<Event[]> {
    return this.prisma.event.findMany({ where: { userId } });
  }
}
```

### 2. Global Context Injection (`src/igniter.context.ts`)

- **Purpose**: Instantiate ALL repositories and services as singletons in the global context.
- **Pattern**: Repositories under `repositories.*`, services under `services.*`

```typescript
// src/igniter.context.ts
import { EventsRepository } from "@/features/events/repositories/events.repository";

export const createIgniterAppContext = async () => {
  const { database } = await import("@/services/database");
  const { PasswordService } = await import("@/services/password.service");
  const { JwtService } = await import("@/services/jwt.service");

  // Instantiate repositories (singletons)
  const eventsRepository = new EventsRepository(database);

  // Instantiate services (singletons)
  const passwordService = new PasswordService();
  const jwtService = new JwtService();

  return {
    services: {
      database,
      password: passwordService,
      jwt: jwtService,
    },
    repositories: {
      events: eventsRepository,
    },
  };
};
```

### 3. Procedure for Business Logic Injection

- **Purpose**: Inject business logic methods that use the global repositories/services.
- **Pattern**: Return `{ procedures: { [feature]: { [methods] } } }`
- **NEVER**: Instantiate repositories or services using `new`

```typescript
// src/features/events/procedures/events.procedure.ts
import { igniter } from "@/igniter";
import { CreateEventBody } from "../events.interfaces";

export const eventsProcedure = igniter.procedure({
  name: "eventsProcedure",
  handler: async (options, ctx) => {
    const { context } = ctx;

    return {
      procedures: {
        events: {
          create: async (data: CreateEventBody, userId: string) => {
            // Use global repository from context
            return await context.repositories.events.create({
              ...data,
              userId,
            });
          },
          list: async (userId: string) => {
            // Use global repository from context
            return await context.repositories.events.list(userId);
          },
        },
      },
    };
  },
});
```

### 4. Controller Usage

- **Pattern**: Access via `context.procedures.[feature].[method]()`
- **Never**: Access `context.repositories` directly from controllers

```typescript
// src/features/events/controllers/events.controller.ts
import { igniter } from "@/igniter";
import { z } from "zod";
import { authProcedure } from "../../auth/procedures/auth.procedure";
import { eventsProcedure } from "../procedures/events.procedure";
import { CreateEventBodySchema } from "../events.interfaces";

export const eventsController = igniter.controller({
  name: "events",
  path: "/events",
  description: "Manage user event types",
  actions: {
    create: igniter.mutation({
      name: "Create",
      description: "Create new event type",
      path: "/",
      method: "POST",
      use: [authProcedure({ required: true }), eventsProcedure()],
      body: CreateEventBodySchema,
      handler: async ({ request, response, context }) => {
        const { title, description, duration } = request.body;
        const session = await context.procedures.auth.getSession();

        // ✅ CORRECT: Use procedure method
        const event = await context.procedures.events.create(
          { title, description, duration },
          session.user!.id,
        );

        return response.created(event);
      },
    }),
    list: igniter.query({
      name: "List",
      description: "List all user events",
      path: "/",
      use: [authProcedure({ required: true }), eventsProcedure()],
      handler: async ({ response, context }) => {
        const session = await context.procedures.auth.getSession();

        // ✅ CORRECT: Use procedure method
        const events = await context.procedures.events.list(session.user!.id);

        return response.success(events);
      },
    }),
  },
});
```

## ✅ Core Architectural Pattern: Service Injection via Procedures

This pattern centralizes external library interactions (e.g., hashing, token generation) and injects them into the Igniter context via procedures, making them readily available to downstream controllers and promoting reusability and testability.

### 1. Service Definition (`src/services/[service-name].service.ts`)

- **Purpose**: Encapsulate all direct external library calls or complex business logic related to a specific domain (e.g., password management, JWT operations, external API integrations).
- **Location**: `src/services/` (or `src/services/[domain]/` for larger projects).
- **TSDoc**: Every service class and _all_ its public methods **MUST** have comprehensive TSDoc comments in English, detailing their purpose, parameters, and return types.

```typescript
// src/services/password.service.ts (Example)
import bcrypt from "bcryptjs";
import { SALT_ROUNDS } from "@/features/auth/auth.interfaces";

/**
 * @class BCryptPasswordService
 * @description Encapsulates password hashing and comparison logic using bcrypt.
 * Provides a clean interface for securely managing user passwords.
 */
export class BCryptPasswordService extends IFractalPasswordService {
  private readonly saltRounds: number;

  constructor(saltRounds: number = SALT_ROUNDS) {
    this.saltRounds = saltRounds;
  }

  /**
   * @method hashPassword
   * @description Hashes a plain text password using bcrypt.
   * @param {string} password - The plain text password to hash.
   * @returns {Promise<string>} A promise that resolves to the hashed password string.
   */
  async hashPassword(password: string): Promise<string> {
    // Business Logic: Hash the password with the configured salt rounds.
    return bcrypt.hash(password, this.saltRounds);
  }

  /**
   * @method comparePassword
   * @description Compares a plain text password with a hashed password.
   * @param {string} password - The plain text password to compare.
   * @param {string} hash - The hashed password to compare against.
   * @returns {Promise<boolean>} A promise that resolves to true if passwords match, false otherwise.
   */
  async comparePassword(password: string, hash: string): Promise<boolean> {
    // Business Logic: Compare the provided password with the stored hash.
    return bcrypt.compare(password, hash);
  }
}
```

```typescript
// src/services/jwt.service.ts (Example)
import jwt from "jsonwebtoken";
import { JWT_SECRET } from "@/features/auth/auth.interfaces";

/**
 * @class JwtService
 * @description Encapsulates JWT token generation and verification logic.
 * Provides a secure interface for handling authentication tokens.
 */
export class JwtService extends IFractalJwtService {
  private readonly secret: string;

  constructor(secret: string = JWT_SECRET) {
    this.secret = secret;
  }

  /**
   * @method generateToken
   * @description Generates a new JWT token.
   * @param {object} payload - The payload to include in the token (e.g., userId).
   * @param {object} [options={ expiresIn: '1h' }] - Options for token generation (e.g., expiration time).
   * @returns {string} The generated JWT token string.
   */
  generateToken(
    payload: object,
    options: object = { expiresIn: "1h" },
  ): string {
    // Security Rule: Sign the JWT token with the configured secret and options.
    return jwt.sign(payload, this.secret, options);
  }

  /**
   * @method verifyToken
   * @description Verifies a JWT token.
   * @param {string} token - The JWT token string to verify.
   * @returns {object | string} The decoded payload if verification is successful, or throws an error.
   */
  verifyToken(token: string): object | string {
    // Security Rule: Verify the JWT token with the configured secret.
    return jwt.verify(token, this.secret);
  }
}
```

### 2. Procedure for Service Injection (`src/features/[feature]/procedures/[feature].procedure.ts`)

- **Purpose**: Instantiate the feature's services and inject them into the Igniter context, making them available to downstream controllers/actions.
- **Location**: `src/features/[feature]/procedures/[feature].procedure.ts`
- **TSDoc**: The procedure's `handler` and its associated `Context` type **MUST** have TSDoc comments.

```typescript
// src/features/auth/procedures/auth.procedure.ts (Example - Refactored)
import { igniter } from "@/igniter";
import { User } from "@prisma/client";
import { JWT_SECRET } from "../auth.interfaces";
import { AuthRepository } from "../repositories/auth.repository"; // Import here for instantiation within procedure

// Define the type for the options that can be passed when using the procedure.
/**
 * @typedef {object} AuthProcedureOptions
 * @property {boolean} [required=true] - Indicates if authentication is mandatory for the route.
 */
type AuthProcedureOptions = {
  required?: boolean;
};

// Define the shape of the extended context we are adding.
/**
 * @typedef {object} AuthContext
 * @property {object} procedures - Procedures context object.
 * @property {object} procedures.auth - Authentication context object.
 * @property {object} procedures.auth.session - User session details.
 * @property {User | null} procedures.auth.session.user - The authenticated user object or null if unauthenticated.
 * @property {function} procedures.auth.login - Method to log in a user, returning a JWT token.
 */
type AuthContext = {
  procedures: {
    auth: {
      getSession: () => Promise<{
        user: User | null;
      }>;
      signIn: (
        email: string,
        password: string,
      ) => Promise<{
        token: string;
        user: User;
      }>;
      signUp: (
        name: string,
        email: string,
        password: string,
      ) => Promise<{
        token: string;
        user: User;
      }>;
    };
  };
};

/**
 * @method handler
 * @description
 * Procedure responsible for authenticating the user by validating the JWT token from the request cookies.
 * Instantiates the AuthRepository and injects it into the context at `auth.repository`.
 * If `options.required` is true, authentication is enforced: if the session token is missing, invalid, or the user is not found, a 401 Unauthorized response is returned.
 * If `options.required` is false, unauthenticated access is allowed and the user in context may be null.
 *
 * @param {AuthProcedureOptions} [options={ required: true }] - Options for the procedure. If `required` is true, authentication is mandatory.
 * @param {object} ctx - The context object provided by Igniter.js.
 * @param {object} ctx.request - The incoming request object.
 * @param {object} ctx.response - The response builder object.
 * @param {object} ctx.context - The current application context.
 * @returns {AuthContext} Returns the extended context with user info and AuthRepository if authentication passes or is not required.
 */
export const authProcedure = igniter.procedure({
  name: "authentication",
  handler: async (options: AuthProcedureOptions = { required: true }, ctx) => {
    const { request, response, context } = ctx;

    // Response: Return the extended context with user session and repository.
    return {
      procedures: {
        auth: {
          getSession: async () => {
            // Observation: Extract the session token from request cookies.
            const sessionToken = request.cookies.get("x-session-token")?.value;

            // Business Rule: Instantiate AuthRepository using the database client from the context.
            const authRepository = new AuthRepository(
              context.fractal.database,
            );

            // Security Rule: If authentication is required and there is no session token, return 401 Unauthorized.
            if (options.required && !sessionToken) {
              throw new IgniterResponseError({
                code: "ERR_UNAUTHORIZED",
                message:
                  "Authentication required. Please provide a valid session token.",
              });
            }

            let userId: string | undefined;

            // Security Rule: If a session token exists, attempt to verify it and extract the user ID.
            if (sessionToken) {
              const decoded = context.fractal.jwt.verifyToken(sessionToken);
              if (decoded) userId = decoded.userId;
            }

            // Business Rule: Attempt to find the user by ID using the AuthRepository.
            const user = await authRepository.getUserById(userId);

            // Security Rule: If authentication is required but the user is not found, return 401 Unauthorized.
            if (options.required && !user) {
              throw new IgniterResponseError({
                code: "ERR_UNAUTHORIZED",
                message: "Authenticated user not found.",
              });
            }
          },
          signIn: async (email: string, password: string) => {
            // Business Logic: Find the user by email.
            const user = await authRepository.getUserByEmail(email);
            if (!user) {
              throw new IgniterResponseError({
                code: "ERR_UNAUTHORIZED",
                message: "Invalid email or password.",
              });
            }

            // Business Logic: Compare the provided password with the stored hash.
            const isPasswordValid =
              await context.fractal.password.comparePassword(
                password,
                user.passwordHash,
              );
            if (!isPasswordValid) {
              throw new IgniterResponseError({
                code: "ERR_UNAUTHORIZED",
                message: "Invalid email or password.",
              });
            }

            // Security Rule: Generate and return a JWT token for the authenticated user.
            const token = context.fractal.jwt.generateToken(
              { userId: user.id },
              { expiresIn: "1h" },
            );

            // Response: Return the token and user object.
            return {
              token,
              user,
            };
          },
          signUp: async (name: string, email: string, password: string) => {
            // Business Logic: Hash the provided password.
            const passwordHash =
              await context.fractal.password.hashPassword(password);

            // Business Logic: Create a new user record using the AuthRepository.
            const newUser = await authRepository.createUser({
              name,
              email,
              passwordHash,
            });

            // Security Rule: Generate and return a JWT token for the newly registered user.
            const token = context.fractal.jwt.generateToken(
              { userId: newUser.id },
              { expiresIn: "1h" },
            );

            // Response: Return the token and new user object.
            return {
              token,
              user: newUser,
            };
          },
        },
      },
    };
  },
});
```

### 3. Controller Usage (`src/features/[feature]/controllers/[feature].controller.ts`)

- **Purpose**: Use the injected service methods to perform logic, keeping the controller focused on request handling and business logic orchestration.

```typescript
// src/features/auth/controllers/auth.controller.ts (Example - Refactored)
import { igniter } from "@/igniter";
import { SALT_ROUNDS, JWT_SECRET, SignUpBodySchema, SignInBodySchema } from "../auth.interfaces";
import { authProcedure } from "../procedures/auth.procedure";

export const authController = igniter.controller({
  name: "auth",
  path: "/auth",
  description: "User authentication endpoints including secure sign-up, sign-in, and session management with password hashing and validation.",
  actions: {
    signUp: igniter.mutation({
      name: "SignUp",
      description: "Create new user account",
      path: "/sign-up",
      method: "POST",
      use: [authProcedure({ required: false })],
      body: SignUpBodySchema,
      handler: async ({ request, context, response }) => {
        // Observation: Extract user details from the request body.
        const { name, email, password } = request.body;

        // Business Logic: Register the new user using the auth procedure's signUp method.
        const { token, user } = await context.procedures.auth.signUp(name, email, password);

        // Response: Return the created user's public data and set the session cookie.
        return response
          .setCookie("x-session-token", token, {
            httpOnly: true, // Security Rule: Prevent client-side JavaScript access to the cookie.
            secure: process.env.NODE_ENV === "production", // Security Rule: Only send cookie over HTTPS in production.
            maxAge: 3600 * 1000, // Session Management: Cookie expires in 1 hour.
            path: "/", // Access Control: Cookie is valid for all paths on the domain.
          });
          .created({
            token,
            user
          })
      },
    }),

    signIn: igniter.mutation({
      name: "SignIn",
      description: "Authenticate user credentials",
      path: "/sign-in",
      method: "POST",
      use: [authProcedure({ required: false })],
      body: SignInBodySchema,
      handler: async ({ request, context, response }) => {
        // Observation: Extract email and password from the request body.
        const { email, password } = request.body;

        // Business Logic: Authenticate the user using the auth procedure's signIn method.
        const { token, user } = await context.procedures.auth.signIn(email, password

        // Response: Return the authenticated user's public data and set the session cookie.
        return response
          .setCookie("sessionToken", token, {
            httpOnly: true, // Security Rule: Prevent client-side JavaScript access to the cookie.
            secure: process.env.NODE_ENV === "production", // Security Rule: Only send cookie over HTTPS in production.
            maxAge: 3600 * 1000, // Session Management: Cookie expires in 1 hour.
            path: "/", // Access Control: Cookie is valid for all paths on the domain.
          });
          .success(userWithoutPassword)
      },
    }),

    signOut: igniter.mutation({
      name: "SignOut",
      description: "Log out user and clear session",
      path: "/sign-out",
      method: "POST",
      handler: async ({ response }) => {
        // Session Management: Clear the session token cookie by setting its maxAge to 0.
        return response
          .setCookie("sessionToken", "", {
            httpOnly: true, // Security Rule: Prevent client-side JavaScript access to the cookie.
            secure: process.env.NODE_ENV === "production", // Security Rule: Only send cookie over HTTPS in production.
            maxAge: 0, // Session Management: Immediately expires the cookie.
            path: "/", // Access Control: Cookie is valid for all paths on the domain.
          });
          .success({ message: "Logged out successfully." })
      },
    }),
  },
});

```

## 7. Best Practices Summary (Refined for LLM Adherence)

1.  **MANDATORY: Follow Architectural Principles**: Adhere strictly to Separation of Concerns, Type Safety, Immutability, and the rule against modifying default Igniter files.
2.  **CRITICAL: TSDoc Everywhere**: Provide comprehensive TSDoc comments (in English) for all controllers, actions, procedures, repositories, interfaces, schemas, types, and constants.
3.  **MANDATORY: Structured Inline Comments**: Use the defined prefix system (Business Rule:, Observation:, etc.) for every significant line of logic in controllers, procedures, and repositories.
4.  **MANDATORY: Centralize Data Definitions**: Store all constants, Zod schemas, types, and interfaces within `src/features/[feature]/[feature].interfaces.ts`.
5.  **MANDATORY: Repository Pattern & Procedure Injection**: Implement repositories for all data access, and **always inject them via dedicated procedures** to make them available in controllers. Do not attempt to inject them directly into `src/igniter.context.ts` or other core Igniter files.
6.  **MANDATORY: Global Service Injection**: Centralize global utility services (e.g., password hashing, JWT operations) by injecting them into `src/igniter.context.ts` under the `services` key. Access these via `context.fractal.[serviceName]`.
7.  **MANDATORY: Use `as const` for Path Parameters**: Ensure `path: '/:id' as const` for correct type inference.
8.  **MANDATORY: `zod` Import in Controllers**: Keep `import { z } from "zod";` in controller files.
9.  **MANDATORY: Explicit Procedure Handler Return Type**: Always explicitly define the return type for procedure handlers (e.g., `Promise<AuthContext | Response | void>`) for enhanced type safety and clarity.
10. **Use Appropriate HTTP Methods & Status Codes**: Align API actions with standard REST conventions.
11. **Implement Robust Error Handling**: Return meaningful error messages and appropriate HTTP status codes.
12. **Exclude Sensitive Data**: Use `select` statements in Prisma queries to prevent exposing sensitive information (e.g., `passwordHash`).
13. **Validate Input Thoroughly**: Use Zod schemas for all request bodies and query parameters.
14. **Test Endpoints Rigorously**: Verify functionality, schema validation, success/error scenarios, and authentication after every implementation.

This refined guide provides the absolute necessary clarity and detail for LLMs to consistently apply the established development patterns.

## ✅ Core Architectural Pattern: Service and Repository Injection Decision

This pattern defines the intelligent decision-making process for where to inject services and repositories to maintain a clean, organized, and scalable codebase, adhering to dependency injection best practices.

### 1. Decision Criteria

- **Global Services/Repositories**: Dependencies that are used in _multiple features_ or are considered _low-level utilities_ without strong coupling to a single feature (e.g., `PasswordService`, `JwtService`).
- **Contextual/Feature-Specific Services/Repositories**: Dependencies that are _specific to a single feature_ or require _specific procedure state_ (e.g., an `EventsRepository` that operates only in the context of events, or the authenticated `user` within the `auth.procedure`). `UserRepository` is also considered a feature-specific repository in this context, instantiated within `auth.procedure` to manage user-related database operations relevant to authentication.

### 2. Injection Locations

- **`src/igniter.context.ts` (Global Injection)**:
  - **Purpose**: For global services that are always needed and are not tied to a specific request context.
  - **Advantages**: Immediate availability throughout the Igniter.js context, guaranteed singletons, easy access from any controller or procedure.
  - **Examples**: `PasswordService`, `JwtService`, `DatabaseService`.

- **Feature-Specific Procedures (`src/features/[feature]/procedures/[feature].procedure.ts`)**:
  - **Purpose**: For contextual or feature-specific dependencies. Instantiated and injected into the context _only when the procedure is used_ under a hierarchical structure.
  - **Advantages**: Lazy loading of dependencies (only created if the procedure is executed), encapsulation of complex injection logic, access to request data for instantiation (e.g., `context.fractal.database` for a repository).
  - **Examples**: `EventsRepository` (injected under `context.events.repository`), `BookingsRepository` (injected under `context.bookings.repository`), `AvailabilityRepository` (injected under `context.availability.repository`).

### 3. Updated Context Structure (Example from `src/igniter.context.ts`)

```typescript
export const createIgniterAppContext = async () => {
  const { database } = await import("@/services/database");
  const { PasswordService } = await import("@/services/password.service");
  const { JwtService } = await import("@/services/jwt.service");
  const { AppConfigServer } = await import("@/configs/app-config.server");

  // Instantiate global services
  const passwordService = new PasswordService(
    AppConfigServer.services.auth.saltRounds,
  );
  const jwtService = new JwtService(AppConfigServer.services.auth.jwtSecret);

  // Instantiate feature-specific repositories here if they are global,
  const userRepository = new UserRepository(database);
  const authRepository = new AuthRepository(database);

  return {
    services: {
      // Global services - always available
      database,
      password: passwordService,
      jwt: jwtService,
    },
    repositories: {
      user: userRepository,
      auth: authRepository,
    },
    // Note: Feature-specific resources are injected by procedures
    // e.g., context.procedures.auth.getSession (from authProcedure)
  };
};

export type IgniterAppContext = ReturnType<typeof createIgniterAppContext>;
```

### 5. Best Practices for New Patterns

1. **Use Direct Structure**: Always use `context.procedures.{featureName}.{resourceType}.{resourceName}` for new features
2. **Global Services**: Keep global services in `context.fractal.{serviceName}`
3. **Global Repositories**: Keep global repositories in `context.repositories.{repositoryName}`
4. **Consistent Naming**: Use `repository`, `service`, etc. as resource type names
5. **Lazy Loading**: Feature-specific resources are only loaded when procedures are executed
6. **Type Safety**: Leverage TypeScript's structural typing for better inference

---
globs: src/features/**/*
alwaysApply: false
---

This guide provides a **COMPLETE and ACCURATE** reference for creating controllers and actions in Igniter.js, based on direct analysis of the source code and real-world implementation experience.

## 🚨 CRITICAL: API Response Patterns - What I Learned the Hard Way

### **❌ WHAT DOESN'T WORK (Common Mistakes):**

```typescript
// ❌ INCORRECT - These methods DO NOT EXIST
return response.ok(data);                    // Method doesn't exist
return response.error(code, message);        // Method doesn't exist
return response.response(data);              // Method doesn't exist
return new IgniterResponseError({...});     // Wrong approach

// ❌ INCORRECT - Wrong parameter structure
return response.badRequest(code, message);  // Wrong parameter order
return response.unauthorized(code, message); // Wrong parameter order
```

### **✅ WHAT ACTUALLY WORKS (Correct API):**

```typescript
// ✅ CORRECT - Success responses
return response.success(data); // 200 OK
return response.created(data); // 201 Created
return response.noContent(); // 204 No Content
return response.json(data); // Custom JSON

// ✅ CORRECT - Error responses
return response.badRequest(message, data); // 400 Bad Request
return response.unauthorized(message, data); // 401 Unauthorized
return response.forbidden(message, data); // 403 Forbidden
return response.notFound(message, data); // 404 Not Found

// ✅ CORRECT - Custom error
return response.error({
  code: "CUSTOM_ERROR_CODE",
  message: "Custom error message",
  data: additionalData,
});
```

## 🔍 MANDATORY: Source Code Analysis Protocol

**BEFORE implementing any Igniter.js functionality, you MUST:**

1. **Analyze the source code directly:**

```typescript
// Use explore_source to understand the actual API
await explore_source({
  filePath: "node_modules/@igniter-js/core/dist/index.d.ts",
  symbol: "IgniterResponseProcessor",
});
```

2. **Read the complete JSDoc documentation** in the `.d.ts` files
3. **Never assume methods exist** based on intuitive naming
4. **Test with minimal examples** before full implementation

## 1. Controllers (`igniter.controller`)

### 1.1. Definition

```typescript
import { igniter } from "@/igniter";
import { z } from "zod";

export const authController = igniter.controller({
  name: "auth", // ✅ REQUIRED - Descriptive name
  path: "/auth", // ✅ REQUIRED - Base URL path
  description:
    "User authentication endpoints including sign-up, sign-in, and session management.", // ✅ REQUIRED for OpenAPI
  actions: {
    // ... actions defined here
  },
});
```

### 1.2. Controller Properties

| Property      | Type     | Required | Description                                                                                              |
| :------------ | :------- | :------- | :------------------------------------------------------------------------------------------------------- |
| `name`        | `string` | **Yes**  | A descriptive name for the controller, used in documentation and debugging.                              |
| `path`        | `string` | **Yes**  | The base URL segment for all actions within this controller (e.g., `/auth`).                             |
| `actions`     | `object` | **Yes**  | An object containing all the API endpoints (actions) for this controller.                                |
| `description` | `string` | **Yes**  | A detailed description for OpenAPI documentation generation. Explain the controller's purpose and scope. |
| `use`         | `array`  | No       | An array of procedures (middlewares) to be executed for every action in this controller.                 |

## 1.3. Procedures Naming Convention

- **Always use concise and clear names** for procedures, matching the file name (e.g., `name: "authProcedure"` for `auth.procedure.ts`). This improves readability and maintainability.

## 1.4. Architectural Rule: No Modification of Default Igniter Files

- **CRITICAL**: Never modify default Igniter files such as `src/igniter.ts`, `src/igniter.context.ts`, or `src/igniter.router.ts`. These files are designed for automatic type inference and configuration. Any custom context or setup should be handled in feature-specific procedures that extend the existing context.

## 2. Actions (`igniter.query` & `igniter.mutation`)

### 2.1. Action Properties

Both `query` and `mutation` actions share a similar set of properties:

| Property      | Type         | Required               | Description                                                                                                 |
| :------------ | :----------- | :--------------------- | :---------------------------------------------------------------------------------------------------------- |
| `path`        | `string`     | Yes                    | The URL path segment for this action, appended to the controller's path. Supports parameters like `/:id`.   |
| `handler`     | `function`   | Yes                    | The function that contains the business logic for the endpoint.                                             |
| `method`      | `string`     | **Yes** for `mutation` | The HTTP method (`POST`, `PUT`, `PATCH`, `DELETE`). For `query`, it defaults to `GET`.                      |
| `body`        | `zod schema` | No                     | A Zod schema to validate the request body. Only for `mutation`.                                             |
| `query`       | `zod schema` | No                     | A Zod schema to validate the URL query parameters.                                                          |
| `use`         | `array`      | No                     | An array of procedures (middlewares) to be executed before the handler for this specific action.            |
| `name`        | `string`     | No                     | A short, descriptive name for the action, used in documentation.                                            |
| `description` | `string`     | **Yes**                | A detailed description of what the action does, including expected behavior, parameters, and return values. |

## 2.4. Architecture Integration (Context Injection)

- **Controller Responsibility**: The Controller is purely an HTTP adapter. It validates input (via Zod), calls a Procedure/Service, and formats the output.
- **NO Database Access in Controllers**: Controllers MUST NEVER access `prisma` or repositories directly.
- **Procedure Injection**: Business logic resides in Procedures. Procedures inject services/repositories into the context.
- **Usage**: Controllers should access logic via `context.procedures.[feature].[method]`.

## 2.5. Documentation Standard for Interfaces and Schemas

- **TSDoc for `*.interfaces.ts`**: All exported constants, Zod schemas, types, and interfaces within `src/features/[feature]/[feature].interfaces.ts` files **MUST** include TSDoc comments in English, following good practices.

## 2.6. Inline Comments for Business Logic

- **Structured Comments**: Every significant line of business logic, observation, or security rule in controllers and procedures **MUST** be accompanied by an inline comment in English. Use a clear prefix system:
  - `// Business Rule: [message]` - Explains a specific business requirement or validation.
  - `// Observation: [message]` - Notes an observed state or data extraction.
  - `// Business Logic: [message]` - Describes a core operation or transformation.
  - `// Security Rule: [message]` - Highlights a security-related control.
  - `// Session Management: [message]` - Details session-related actions.
  - `// Data Transformation: [message]` - Explains data formatting or conversion.
  - `// Context Extension: [message]` - Describes how the context is being extended.
  - `// Response: [message]` - Explains the content and status of the HTTP response.

## 2.7. `zod` Import in Controllers

- **Maintain `z` import**: Keep `import { z } from "zod";` in controller files, even if `z` is not directly used within the handler function, as it is integral to defining schemas that are then imported.

### 2.2. Query Action (`igniter.query`)

Used for fetching data, corresponding to `GET` requests.

```typescript
    list: igniter.query({
      name: 'List',
      description: 'List all users',
      path: '/',
      query: z.object({
        page: z.string().optional().transform(val => parseInt(val || '1')),
        limit: z.string().optional().transform(val => parseInt(val || '10')),
        role: z.enum(['user', 'admin']).optional(),
        search: z.string().optional(),
      }),
      use: [userProcedure()], // Injects context.procedures.user
      handler: async ({ request, response, context }) => {
        // Observation: Extract pagination and filtering parameters.
        const { page, limit, role, search } = request.query;

        // Business Logic: Delegate to the User Procedure/Service.
        // Controller does NOT query database directly.
        const result = await context.procedures.user.listUsers({
          page,
          limit,
          role,
          search
        });

        // Response: Return formatted response.
        return response.success(result);
      },
    }),

    getById: igniter.query({
      name: 'GetById',
      description: 'Get user by ID',
      path: '/:id' as const,  // ✅ CRITICAL: Use 'as const' for type inference
      use: [userProcedure()],
      handler: async ({ request, response, context, params }) => {
        const { id } = request.params;

        // Business Logic: Delegate to Procedure
        const user = await context.procedures.user.getUserById(id);

        if (!user) {
          return response.notFound('User not found');
        }

        return response.success(user);
      },
    })
```

### 2.3. Mutation Action (`igniter.mutation`)

Used for creating, updating, or deleting data. Corresponds to `POST`, `PUT`, `PATCH`, or `DELETE` requests.

```typescript
    create: igniter.mutation({
      name: 'Create',
      description: 'Create new user',
      path: '/',
      method: 'POST',
      body: CreateUserSchema,
      use: [userProcedure()],
      handler: async ({ request, response, context }) => {
        // Business Logic: Delegate to Procedure
        // Procedure handles password hashing, duplicate checks, and DB creation.
        const user = await context.procedures.user.createUser(request.body);

        // Response: Return the created user.
        return response.created(user);
      },
    }),
```

## 3. The Handler Context - COMPLETE REFERENCE

The `handler` function receives a single context object with these properties:

### 3.1. Request Object

```typescript
handler: async ({ request, response, context, params }) => {
  // request.body - Validated request body (from Zod schema)
  const { name, email, password } = request.body;

  // request.query - Validated query parameters (from Zod schema)
  const { page, limit } = request.query;

  // request.headers - HTTP headers
  const authHeader = request.headers.get("authorization");

  // request.cookies - HTTP cookies
  const sessionToken = request.cookies.get("session");

  // request.method - HTTP method
  const method = request.method;

  // request.path - Request path
  const path = request.path;
};
```

### 3.2. Response Object - COMPLETE API

```typescript
// ✅ SUCCESS RESPONSES
return response.success(data); // 200 OK
return response.created(data); // 201 Created
return response.noContent(); // 204 No Content
return response.json(data); // Custom JSON

// ✅ ERROR RESPONSES
return response.badRequest(message, data); // 400 Bad Request
return response.unauthorized(message, data); // 401 Unauthorized
return response.forbidden(message, data); // 403 Forbidden
return response.notFound(message, data); // 404 Not Found

// ✅ CUSTOM RESPONSES
return response
  .status(418) // Custom status code
  .setHeader("X-Custom", "value") // Set custom header
  .setCookie("session", token, {
    // Set cookie
    httpOnly: true,
    secure: true,
    maxAge: 3600,
  })
  .success(data);

// ✅ STREAMING RESPONSES
return response.stream({
  channelId: "notifications:user:123",
  initialData: { status: "connected" },
});

// ✅ CACHE REVALIDATION
return response.success(data).revalidate(["users", "posts"]);
```

### 3.3. Context Object

```typescript
handler: async ({ request, response, context, params }) => {
  // ✅ Procedure Access (Business Logic)
  const user = await context.procedures.user.getById(id);
  const event = await context.procedures.events.create(data);

  // ✅ Auth Access
  const userId = context.auth.session.user?.id;

  // ❌ NO DIRECT DATABASE ACCESS IN CONTROLLERS
  // const users = await context.fractal.database.user.findMany(); // FORBIDDEN
};
```

### 3.4. Params Object (with `as const`)

```typescript
// ✅ CORRECT: Use 'as const' for type inference
getById: igniter.query({
  path: "/:id" as const, // This enables params.id type inference
  handler: async ({ params }) => {
    // params.id is automatically typed as string
    const userId = params.id;
  },
});

// ❌ INCORRECT: Without 'as const', params.id is unknown
getById: igniter.query({
  path: "/:id", // Missing 'as const'
  handler: async ({ params }) => {
    // params.id is typed as unknown - TypeScript error!
    const userId = params.id; // Error: Type 'unknown' is not assignable to type 'string'
  },
});
```

## 4. Complete Working Example - Authentication Controller

```typescript
import { igniter } from "@/igniter";
import { z } from "zod";
import { SignUpBodySchema } from "../auth.interfaces";
import { authProcedure } from "../procedures/auth.procedure";

export const authController = igniter.controller({
  name: "auth",
  path: "/auth",
  description: "User authentication endpoints.",
  actions: {
    signUp: igniter.mutation({
      name: "SignUp",
      description: "Create new user account",
      path: "/sign-up",
      method: "POST",
      body: SignUpBodySchema,
      use: [authProcedure()],
      handler: async ({ request, response, context }) => {
        // Business Logic: Delegate entirely to procedure
        const result = await context.procedures.auth.signUp(request.body);

        // Response: Return result and set cookie
        return response
          .created(result.user)
          .setCookie("sessionToken", result.token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            maxAge: 3600 * 1000,
            path: "/",
          });
      },
    }),
  },
});
```

## 5. Common Pitfalls and Solutions

### 5.1. Response API Mistakes

```typescript
// ❌ WRONG - These don't exist
return response.ok(data);
return response.error(code, message);
return response.response(data);

// ✅ CORRECT - Use the actual API
return response.success(data);
return response.badRequest(message);
return response.created(data);
```

### 5.2. Type Inference Issues

```typescript
// ❌ WRONG - Missing 'as const'
path: '/:id',  // params.id will be 'unknown'

// ✅ CORRECT - With 'as const'
path: '/:id' as const,  // params.id will be 'string'
```

### 5.3. Missing Required Properties

```typescript
// ❌ WRONG - Missing required properties
export const controller = igniter.controller({
  path: "/users", // Missing 'name' and 'actions'
  actions: {},
});

// ✅ CORRECT - All required properties
export const controller = igniter.controller({
  name: "Users", // ✅ Required
  path: "/users", // ✅ Required
  description: "User management endpoints", // ✅ Required
  actions: {
    // ✅ Required
    // ... actions
  },
});
```

### 5.4. Architecture Violations

```typescript
// ❌ WRONG - Calling Database in Controller
handler: async ({ context }) => {
  const user = await context.fractal.database.user.create(...); // VIOLATION
}

// ✅ CORRECT - Calling Procedure
handler: async ({ context }) => {
  const user = await context.procedures.user.create(...); // OK
}
```

## 6. Testing and Validation Protocol

### 6.1. Mandatory Testing Checklist

After implementing any controller or action:

- [ ] **OpenAPI Generation**: Run `generate_docs()` and verify endpoint appears
- [ ] **Schema Validation**: Test with valid and invalid data
- [ ] **Success Scenarios**: Verify correct status codes and response structure
- [ ] **Error Scenarios**: Test validation errors and edge cases
- [ ] **Authentication**: Test protected endpoints with and without auth
- [ ] **Performance**: Verify response times are acceptable (<500ms)

### 6.2. Testing Commands

```bash
# Test success scenario - Auth Controller
await make_api_request(method="POST", url="http://localhost:3000/api/v1/auth/sign-up", headers={"Content-Type": "application/json"}, body={"name": "Test User", "email": "test@example.com", "password": "password123"})

# Test validation error - Auth Controller
await make_api_request(method="POST", url="http://localhost:3000/api/v1/auth/sign-up", headers={"Content-Type": "application/json"}, body={"name": "Jo", "email": "invalid-email", "password": "123"})
```

### 6.3. Validation Documentation Template

```markdown
## Controller Validation: {ControllerName}

### Endpoints Tested

- [ ] POST /api/v1/auth/sign-up - Status: 201, Response time: XXXms

### Validation Tests

- [ ] Invalid JSON body returns 400
- [ ] Missing required fields returns 400

### Security Validations

- [ ] Password hash not exposed in responses
- [ ] Sensitive data properly filtered
```

## 7. Best Practices Summary

1. **Always add descriptions** to controllers and actions for better API documentation
2. **Use `analyze_file`** before and after modifying controller files
3. **Test endpoints immediately** after implementation using API validation tools
4. **Store validation patterns** in memory for reuse and learning
5. **Use appropriate HTTP methods** and status codes
6. **Implement proper error handling** with meaningful error messages
7. **Add authentication/authorization** where appropriate using procedures
8. **Use `as const`** for routes with parameters to enable type inference
9. **Never assume methods exist** - always check the source code
10. **Use the correct response API** - success(), created(), badRequest(), etc.
11. **Always call ``** at the end of response chains
12. **Use hierarchical context structure** - `context.procedures.{feature}.{method}`
13. **Use global services** - `context.fractal.password`, `context.fractal.jwt`, `context.fractal.database`
14. **Exclude sensitive data** from responses using proper select statements
15. **Validate input thoroughly** with Zod schemas from interfaces
16. **Handle errors gracefully** with appropriate HTTP status codes
17. **Test with real HTTP requests** using curl or similar tools
18. **Use structured inline comments** with Business Rule:, Observation:, Security Rule: prefixes
19. **Apply procedures consistently** with `use: [authProcedure(), featureProcedure()]`
20. **Follow repository pattern** with hierarchical injection via procedures

## 8. Memory Storage for Patterns

Store successful patterns using:

```typescript
await store_memory({
  type: "api_mapping",
  title: "Igniter.js Controller Pattern - {Feature}",
  content: `# {Feature} Controller Implementation

## Endpoints
- POST /api/v1/{feature} - Create
- GET /api/v1/{feature} - List
- GET /api/v1/{feature}/:id - Get by ID
- PUT /api/v1/{feature}/:id - Update
- DELETE /api/v1/{feature}/:id - Delete

## Implementation Patterns
- Hierarchical context access: \`context.procedures.{feature}.{method}\`
- Global services: \`context.fractal.password\`, \`context.fractal.jwt\`, \`context.fractal.database\`
- Procedure injection with \`use: [authProcedure(), {feature}Procedure()]\`
- Inline comments: Business Rule:, Observation:, Security Rule:, etc.

## Validation Patterns
- Body validation with Zod schemas from interfaces
- Query parameter validation with \`as const\` for type inference
- Error handling with proper HTTP status codes
- Response formatting with consistent API patterns

## Security Considerations
- Data filtering to exclude sensitive fields (passwordHash)
- Authentication using injected auth procedures
- Input sanitization via Zod validation
- Cookie management for session tokens`,
  tags: [
    "igniter-js",
    "controller",
    "api",
    "pattern",
    "hierarchical-context",
    "services-injection",
  ],
  confidence: 0.95,
});
```

This comprehensive guide ensures consistent, type-safe controller implementation following Igniter.js best practices.

This comprehensive guide ensures consistent, type-safe controller implementation following Igniter.js best practices.

# Setup and Configuration

## Installation

Install the `@igniter-js/caller` package along with your preferred package manager.

```bash
# Using npm
npm install @igniter-js/caller

# Using pnpm
pnpm add @igniter-js/caller

# Using bun
bun add @igniter-js/caller
```

### Optional Dependencies

For runtime schema validation, you need a validation library that supports StandardSchemaV1 (Zod is recommended). For observability, you can install the telemetry package.

```bash
npm install zod @igniter-js/telemetry
```

## Basic Configuration

The HTTP client is configured using an immutable builder. This configuration creates an `IgniterCallerManager` instance.

```typescript
import { IgniterCaller } from '@igniter-js/caller';

const api = IgniterCaller.create()
  // Set the base URL for all requests
  .withBaseUrl('https://api.example.com')
  // Set default headers
  .withHeaders({
    'Accept': 'application/json',
    'Authorization': `Bearer ${process.env.API_TOKEN}`
  })
  // Finalize configuration
  .build();
```

## Advanced Configuration

### Adding Interceptors

Interceptors allow you to modify requests before they are sent and responses before they are returned.

```typescript
const api = IgniterCaller.create()
  .withBaseUrl('https://api.example.com')
  .withRequestInterceptor(async (request) => {
    // Modify request (e.g., add dynamic headers)
    return {
      ...request,
      headers: {
        ...request.headers,
        'X-Request-ID': crypto.randomUUID(),
      },
    };
  })
  .withResponseInterceptor(async (response) => {
    // Transform response
    if (response.data === '') {
      return { ...response, data: null as any };
    }
    return response;
  })
  .build();
```

### Schema Registry Configuration

To leverage end-to-end type safety, configure a schema registry and attach it to the client.

```typescript
import { IgniterCaller, IgniterCallerSchema } from '@igniter-js/caller';
import { z } from 'zod';

const UserSchema = z.object({
  id: z.string(),
  name: z.string(),
});

// 1. Build the schema registry
const apiSchemas = IgniterCallerSchema.create()
  .schema('User', UserSchema)
  .path('/users/:id', (path) =>
    path.get({
      responses: {
        200: path.ref('User').schema,
      },
    })
  )
  .build();

// 2. Attach schemas to the client
const api = IgniterCaller.create()
  .withBaseUrl('https://api.example.com')
  .withSchemas(apiSchemas, { mode: 'strict' }) // 'strict' | 'soft' | 'off'
  .build();
```

### Configuring Caching (Store Adapter)

You can configure persistent caching by providing a store adapter (e.g., Redis).

```typescript
import { IgniterCaller } from '@igniter-js/caller';
import { redisAdapter } from './my-redis-adapter'; // Your implementation

const api = IgniterCaller.create()
  .withStore(redisAdapter, {
    ttl: 3600, // Default TTL in seconds
    keyPrefix: 'api-cache:',
  })
  .build();
```

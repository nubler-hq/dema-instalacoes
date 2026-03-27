# Architectural Patterns and Best Practices

## 1. Immutable Builder Pattern

Always use the `.create()` factory method and chain configuration calls. Never attempt to mutate the builder state directly.

**✅ DO:**
```typescript
const api = IgniterCaller.create()
  .withBaseUrl('https://api.example.com')
  .withHeaders({ 'Content-Type': 'application/json' })
  .build();
```

**❌ DON'T:**
```typescript
// Don't try to mutate the internal state
const builder = IgniterCaller.create();
builder.state.baseURL = 'https://api.example.com'; // This won't work
```

## 2. Explicit Error Handling

The client returns a standardized `ApiResponse` object containing either `data` or `error`. Always check for the presence of `error` before accessing `data`.

**✅ DO:**
```typescript
const result = await api.get('/users').execute();
if (result.error) {
  // Handle the error appropriately
  console.error('Fetch failed:', result.error.message);
  throw result.error;
}
// TypeScript knows result.data is defined here
console.log(result.data);
```

**❌ DON'T:**
```typescript
const result = await api.get('/users').execute();
console.log(result.data); // Might be undefined if an error occurred
```

## 3. Schema-Driven API Contracts

Define Zod schemas for your API responses. This provides both TypeScript inference and runtime validation.

**✅ DO:**
```typescript
import { z } from 'zod';

const ProductSchema = z.object({ id: z.string(), price: z.number() });

const result = await api
  .get('/products/123')
  .responseType(ProductSchema)
  .execute();

// If the API returns { id: "123", price: "free" }, validation fails at runtime.
```

## 4. Resilience Patterns (Retry and Fallback)

For unreliable network calls or third-party APIs, use built-in retry mechanisms and fallbacks.

**✅ DO:**
```typescript
const result = await api
  .get('/unreliable-endpoint')
  .retry(3, {
    baseDelay: 500,
    backoff: 'exponential',
    retryOnStatus: [429, 502, 503, 504], // Only retry on server/rate-limit errors
  })
  .fallback(() => ({ default: 'value' }))
  .execute();
```

**❌ DON'T:**
```typescript
// Don't retry non-idempotent operations without careful consideration
const result = await api
  .post('/process-payment')
  .retry(3) // Dangerous: might charge the user multiple times!
  .execute();
```

## 5. Intelligent Caching

Use the `.stale()` modifier for read-heavy, slow-changing endpoints. Avoid caching mutations.

**✅ DO:**
```typescript
// Cache expensive GET requests
const result = await api
  .get('/expensive-report')
  .stale(300_000) // Cache for 5 minutes
  .execute();
```

**❌ DON'T:**
```typescript
// Do not cache state-changing methods
const result = await api
  .post('/users')
  .stale(60_000) // Post requests should not be cached
  .execute();
```

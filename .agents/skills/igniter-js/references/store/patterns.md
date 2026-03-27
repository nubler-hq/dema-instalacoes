# @igniter-js/store - Patterns & Best Practices

The primary value proposition of `@igniter-js/store` lies in its enforcement of strict patterns for distributed state.

## 1. Strict Prefixing & Namespacing

Every operation generated through the store API produces predictable keys prefixed by service and operation types.

```typescript
// Do not generate raw keys manually:
// ❌ redis.set('user:123')

// Do use the abstractions:
// ✅ await store.kv.set('user:123', userData)
```

By default, the builder prepends `igniter:store:<service>:kv:user:123`. This prevents key collisions across microservices sharing the same Redis instance.

## 2. Multi-Tenant Scoping

Never embed tenant identifiers manually into strings if you can avoid it. Use `.scope()` instead.

```typescript
// ❌ Anti-pattern: Hand-rolling tenant keys
await store.kv.set(`org_${orgId}:user_${userId}`, data)

// ✅ Best Practice: Using Scopes
const orgStore = store.scope('organization', orgId)
await orgStore.kv.set(`user:${userId}`, data)
// Resulting key: igniter:store:my-api:organization:org_123:kv:user:userId
```

**Type Safety:** Define your allowed scopes when building the store to catch invalid usage at compile time.

```typescript
const store = IgniterStore.create()
  .withService('api')
  .addScope('organization', { required: true })
  .build()

// ❌ TypeScript Error: 'tenant' is not a defined scope
store.scope('tenant', '123')

// ✅ Valid
store.scope('organization', '123')
```

## 3. Distributed Claims (Locks)

When running multiple instances of a background worker or chron job, you must coordinate to prevent duplicate execution. Use `store.claim`.

```typescript
// The 'once' method uses SETNX under the hood
const claimed = await store.claim.once('daily-report', 'worker-id-1', { ttl: 60 })

if (claimed) {
  try {
    // We are the only instance running this!
    await generateReport()
  } finally {
    // Release the claim when finished
    // You can also just let the TTL expire if the task is idempotent
    await store.kv.remove('claim:daily-report')
  }
} else {
  console.log('Another worker is already generating the report. Skipping.')
}
```

## 4. Typed Pub/Sub

Never use raw Redis Pub/Sub directly, as it lacks type safety and serialization guarantees. Define Zod schemas and use `store.events`.

```typescript
// 1. Define schemas
import { z } from 'zod'
import { IgniterStoreEvents } from '@igniter-js/store'

export const BillingEvents = IgniterStoreEvents
  .create('billing')
  .event('invoice.paid', z.object({ invoiceId: z.string(), amount: z.number() }))
  .build()

// 2. Register them during setup
const store = IgniterStore.create()
  /* ... */
  .addEvents(BillingEvents)
  .build()

// 3. Publish and Subscribe safely
await store.events.publish('billing:invoice.paid', { invoiceId: 'inv_1', amount: 100 })

await store.events.subscribe('billing:invoice.paid', (ctx) => {
  // ctx.data is strongly typed!
  console.log(`Invoice ${ctx.data.invoiceId} paid. Amount: $${ctx.data.amount}`)
  // ctx.timestamp and ctx.type are also available
})
```

## 5. Counters for Rate Limiting

Counters provide an atomic, thread-safe way to track usage.

```typescript
const LIMIT = 100
const userId = 'user_123'

// Increment returns the *new* value after atomic increment
const currentUsage = await store.counter.increment(`api_usage:${userId}`)

if (currentUsage > LIMIT) {
  throw new Error('Rate limit exceeded')
}

// Ensure the counter resets daily
if (currentUsage === 1) {
    // Only set TTL on the first increment
    await store.counter.expire(`api_usage:${userId}`, 86400)
}
```

## 6. Telemetry Integration

Store operations represent external IO boundaries, making them critical for debugging performance bottlenecks. Always enable telemetry in production.

```typescript
import { IgniterTelemetry } from '@igniter-js/telemetry'
import { IgniterStoreTelemetryEvents } from '@igniter-js/store/telemetry'

const telemetry = IgniterTelemetry.create()
  .addEvents(IgniterStoreTelemetryEvents)
  .build()

const store = IgniterStore.create()
  .withTelemetry(telemetry)
  .build()
```

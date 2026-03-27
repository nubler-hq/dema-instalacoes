# @igniter-js/store - Setup & Configuration

This guide covers how to install and configure `@igniter-js/store`.

## Installation

Install the package using your preferred package manager. If you intend to use the Redis backend (which is highly recommended for production), you must also install `ioredis`.

```bash
# Using npm
npm install @igniter-js/store ioredis

# Using pnpm
pnpm add @igniter-js/store ioredis

# Using yarn
yarn add @igniter-js/store ioredis

# Using bun
bun add @igniter-js/store ioredis
```

## Basic Configuration

Like all packages in the Igniter.js ecosystem, `@igniter-js/store` uses a fluent builder pattern for configuration.

```typescript
import { IgniterStore, IgniterStoreRedisAdapter } from '@igniter-js/store'
import Redis from 'ioredis'

// 1. Create your Redis client
const redis = new Redis({
  host: process.env.REDIS_HOST || 'localhost',
  port: Number(process.env.REDIS_PORT) || 6379,
  password: process.env.REDIS_PASSWORD
})

// 2. Build the store instance
const store = IgniterStore.create()
  // Required: The storage adapter
  .withAdapter(IgniterStoreRedisAdapter.create({ redis }))
  // Required: A service identifier. This forms the root prefix for all keys.
  .withService('my-api-service')
  .build()

export { store }
```

## Advanced Configuration

The builder exposes several advanced configuration options for serialization, scoping, events, and telemetry.

```typescript
import { IgniterStore, IgniterStoreRedisAdapter } from '@igniter-js/store'
import { IgniterTelemetry } from '@igniter-js/telemetry'
import { UserEvents } from './events/user.events'
import Redis from 'ioredis'

const redis = new Redis(process.env.REDIS_URL)

const store = IgniterStore.create()
  .withAdapter(IgniterStoreRedisAdapter.create({ redis }))
  .withService('billing-service')

  // Custom Serializer (Defaults to standard JSON.stringify / JSON.parse)
  // Useful if you need to serialize Dates, Maps, Sets, or use something like superjson
  .withSerializer({
    encode: (data) => JSON.stringify(data),
    decode: (str) => JSON.parse(str),
  })

  // Typed Scopes: Define multi-tenant boundaries at build time.
  // This enables type safety when calling `store.scope('organization', 'org_1')`
  .addScope('organization', { required: true, description: 'Tenant ID' })
  .addScope('workspace', { required: false })

  // Typed Events: Register Zod schemas for Pub/Sub validation
  .addEvents(UserEvents)

  // Observability: Wire up telemetry for automatic tracing of store operations
  .withTelemetry(IgniterTelemetry.create().withService('billing-service').build())

  .build()
```

## Migration Note

If you are upgrading from older versions of the Igniter ecosystem, note that the Redis adapter is now bundled directly within `@igniter-js/store/adapters`. You no longer need the separate `@igniter-js/adapter-redis` package.

```typescript
// Deprecated
import { createIgniterStoreRedisAdapter } from '@igniter-js/adapter-redis'

// Correct
import { IgniterStoreRedisAdapter } from '@igniter-js/store/adapters'
```

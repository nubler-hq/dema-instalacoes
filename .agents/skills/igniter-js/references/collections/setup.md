# Setup and Configuration

This guide covers the installation and basic configuration of `@igniter-js/collections`.

## Installation

Install the package alongside a schema validation library like `zod`.

```bash
# Using bun (Recommended)
bun add @igniter-js/collections zod

# Using npm
npm install @igniter-js/collections zod

# Using pnpm
pnpm add @igniter-js/collections zod
```

> **Note:** Most adapters and core logic in this package are **server-only**. Attempting to import them into a client-side bundle (e.g., a React component) will throw a descriptive "Server-only" error.

## Distribution Anatomy

To minimize bundle sizes, import only what you need:

*   **Core:** `import { IgniterCollections } from '@igniter-js/collections';`
*   **Adapters:** `import { BunFsAdapter, NodeFsAdapter } from '@igniter-js/collections/adapters';`
*   **Telemetry:** `import { ... } from '@igniter-js/collections/telemetry';`

## Basic Configuration (The Builder Pattern)

Configuration uses the **Immutable Builder Pattern**. Every `.with*()` method returns a new builder instance.

### 1. Initialize the Manager

You must provide an **Adapter** (e.g., `NodeFsAdapter` or `BunFsAdapter`) to interact with the storage layer.

```typescript
import { IgniterCollections } from '@igniter-js/collections';
import { BunFsAdapter } from '@igniter-js/collections/adapters';
import { z } from 'zod';

const docsManager = await IgniterCollections.create()
  .withAdapter(new BunFsAdapter())
  .withBasePath('./content')
  // ... configuration ...
  .build();
```

### 2. Define a Collection

You can manually register collections using `addCollection()`.

```typescript
import { IgniterCollectionModel } from '@igniter-js/collections';

const postsCollection = IgniterCollectionModel.create('posts')
  .withPatterns(['blog/{id}.md'])
  .withTemplate('templates/post.hbs') // Optional Handlebars template
  .withSchema(
    z.object({
      title: z.string(),
      date: z.string().date(),
      draft: z.boolean().default(false),
    })
  )
  .build();

const manager = await IgniterCollections.create()
  .withAdapter(new BunFsAdapter())
  .withBasePath('./content')
  .addCollection(postsCollection)
  .build();
```

### 3. Dynamic Schema Discovery

Instead of manually defining collections in code, you can use the Registry to discover them at runtime from `.schema.json` files.

```typescript
const manager = await IgniterCollections.create()
  .withAdapter(new BunFsAdapter())
  .withBasePath('./content')
  .withSchemaRegistry('./plugins/*/schemas/*.json', {
      autoWatch: process.env.NODE_ENV === 'development'
  })
  .build();
```

### 4. Adding Observability

Integrate with logging and telemetry seamlessly.

```typescript
const manager = await IgniterCollections.create()
  .withAdapter(new BunFsAdapter())
  // .withLogger(customLogger)
  // .withTelemetry(telemetryManager)
  .addCollection(postsCollection)
  .build();
```

## Selecting an Adapter

Choose the adapter that fits your environment:

*   **`BunFsAdapter`**: Native Bun filesystem integration. Optimized for high throughput. Use this when running on Bun.
*   **`NodeFsAdapter`**: Standard Node.js `fs/promises`. Ensures cross-runtime compatibility.
*   **`BunRedisAdapter`**: Bun-native Redis wrapper. Good for distributed state or caching.
*   **`BunS3Adapter`**: Object storage (AWS, R2, MinIO). Handles pagination automatically.
*   **`MockAdapter`**: In-memory adapter with call tracking, strictly for testing.

**Source References**
- `node_modules/@igniter-js/collections/dist/adapters/bun-fs.adapter.js:1` | **Bun Adapter** | Native implementation using `Bun.file` and `Bun.Glob`.
- `node_modules/@igniter-js/collections/dist/adapters/node-fs.adapter.js:1` | **Node.js Adapter** | Standard implementation using `fs/promises`.
- `node_modules/@igniter-js/collections/package.json:1` | **Package Config** | Dependency list (Handlebars, AJV, Zod) and export definitions.

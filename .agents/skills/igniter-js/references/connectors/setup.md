# @igniter-js/connectors - Setup

## Installation

Install the package and its dependencies. Zod is recommended for `StandardSchemaV1` validation.

```bash
# npm
npm install @igniter-js/connectors @igniter-js/common zod

# pnpm
pnpm add @igniter-js/connectors @igniter-js/common zod

# yarn
yarn add @igniter-js/connectors @igniter-js/common zod
```

## Configuration

The setup process requires three main steps:
1. Define your connectors (schemas, methods, webhooks).
2. Choose a storage adapter (e.g., Prisma).
3. Initialize the Manager (`IgniterConnectors`).

### Example Setup

```typescript
import { IgniterConnectors, PrismaConnectorAdapter } from '@igniter-js/connectors';
import { z } from 'zod';
import { prisma } from './prisma'; // Your Prisma client
import { myStripeConnector } from './connectors/stripe'; // Your predefined connector

// 1. Choose Adapter
const adapter = new PrismaConnectorAdapter(prisma);

// 2. Initialize the Manager
const manager = IgniterConnectors.create(adapter)
  // Optional: Add a telemetry sink
  // .withTelemetry(...)
  // Optional: Global encryption key for AES-256-GCM
  // .withEncryption('super_secret_32_byte_key_string_')
  // 3. Register Connectors
  .withConnector(myStripeConnector)
  .build();

export { manager };
```

## Environment Variables

### Encryption
If your connector configurations or states contain sensitive fields (like API keys or OAuth tokens), you should configure encryption.
The `withEncryption(key)` builder method expects a 32-byte string for AES-256-GCM.
Ensure this key is stored securely (e.g., in an environment variable).

```typescript
const ENCRYPTION_KEY = process.env.CONNECTOR_ENCRYPTION_KEY;
if (!ENCRYPTION_KEY) {
    throw new Error('CONNECTOR_ENCRYPTION_KEY is required for secure storage.');
}
```

### Prisma Schema (If using PrismaAdapter)

If you use the `PrismaConnectorAdapter`, you must have a model in your `schema.prisma` that matches the expected interface. The adapter requires a model named `Connector` by default, but you can configure the model name if needed.

```prisma
model Connector {
  id        String   @id @default(uuid())
  type      String   // e.g., 'stripe'
  context   String   // e.g., 'organization'
  contextId String   // e.g., 'org-123'
  config    String   // Encrypted JSON
  state     String?  // Encrypted JSON
  active    Boolean  @default(true)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@unique([type, context, contextId]) // Important for upsert operations
}
```
# @igniter-js/connectors - Patterns

## The Builders
`@igniter-js/connectors` relies heavily on the Immutable Builder Pattern. You should never mutate configuration objects directly. Instead, you use fluent builders to define your connectors and the manager.

- `IgniterConnectorBuilder.create('connector-id')`
- `IgniterConnectors.create(adapter)`

## Schema-First Design (Zod / StandardSchemaV1)
Always define the shape of your connector's `config` and `state` using Zod schemas. This ensures runtime safety and type inference throughout the package.

```typescript
import { z } from 'zod';
import { IgniterConnectorBuilder } from '@igniter-js/connectors';

const stripeConfigSchema = z.object({
  secretKey: z.string(), // Consider encrypting this
  publishableKey: z.string(),
  webhookSecret: z.string().optional(),
});

const stripeStateSchema = z.object({
  lastSync: z.string().datetime().optional(),
});
```

## Security: Encryption

For any sensitive data (API keys, access tokens, refresh tokens), you MUST enable encryption at the Manager level and specify which fields to encrypt in your connector schemas.

### 1. Global Encryption Key
You must provide a 32-byte key to the Manager to enable AES-256-GCM encryption.

```typescript
const manager = IgniterConnectors.create(adapter)
  .withEncryption(process.env.CONNECTOR_ENCRYPTION_KEY) // 32-byte string
  .withConnector(myConnector)
  .build();
```

### 2. Field-Level Encryption
The connector definition controls which fields are encrypted. Use the `.withEncryption(fields)` method.

```typescript
const myConnector = IgniterConnectorBuilder.create('stripe')
  .withConfigSchema(stripeConfigSchema)
  .withStateSchema(stripeStateSchema)
  // Encrypt sensitive fields:
  .withEncryption(['secretKey', 'webhookSecret'])
  .build();
```

## Scopes and Multi-Tenancy

You never interact with a global connector instance directly when performing operations. Instead, you always scope the interaction to a specific tenant (e.g., an organization, a user, a project).

```typescript
// 1. Get the manager instance
const manager = getManager();

// 2. Scope to a specific context
const orgConnectors = manager.scope('organization', 'org-123');

// 3. Perform operations within that scope
const installedStripe = await orgConnectors.install('stripe', {
    secretKey: 'sk_test_...',
    publishableKey: 'pk_test_...'
});

// The result is an IIgniterScopedConnector
// Which gives you access to the config, state, and methods
console.log(installedStripe.config.publishableKey);
```

## Methods and Lifecycle Hooks

Connectors should encapsulate their own logic using custom methods and lifecycle hooks. This keeps integration code localized and reusable.

```typescript
const myConnector = IgniterConnectorBuilder.create('github')
  // ... schemas ...
  .withMethod('createIssue', async (ctx, repo: string, title: string, body: string) => {
    // Access typed config and state from ctx
    const { token } = ctx.config;
    // Perform API call...
    return { issueId: 123 };
  })
  .onInstall(async (ctx) => {
    // E.g., setup webhooks on the provider side
    console.log(`Connector installed for context ${ctx.context.type} ${ctx.context.id}`);
  })
  .build();
```

The `ctx` parameter in methods and hooks contains:
- `config`: The validated, typed, and decrypted configuration.
- `state`: The validated, typed, and decrypted state.
- `context`: The tenant context (`type`, `id`).

## Webhook Pipelines

Connectors can define webhooks with validation and verification. This allows you to handle incoming events from third-party providers securely.

```typescript
const myConnector = IgniterConnectorBuilder.create('stripe')
  // ... schemas ...
  .withWebhook('payment.success', {
    schema: z.object({ id: z.string(), amount: z.number() }),
    verify: async (ctx, req) => {
      // e.g., Verify Stripe signature using ctx.config.webhookSecret
      return true; // Return false to reject
    },
    handler: async (ctx, payload) => {
      // Process the payload securely
      console.log(`Payment success: ${payload.id}`);
    }
  })
  .build();
```

## OAuth Flows

The connectors package provides utilities for managing OAuth flows, including PKCE (Proof Key for Code Exchange) and state management.

```typescript
const githubConnector = IgniterConnectorBuilder.create('github')
  // ... schemas for tokens ...
  .withOAuth({
    provider: 'github',
    clientId: '...',
    clientSecret: '...',
    authorizationUrl: 'https://github.com/login/oauth/authorize',
    tokenUrl: 'https://github.com/login/oauth/access_token',
    scopes: ['repo', 'user'],
    pkce: true, // Enable PKCE
  })
  .build();
```

The scoped connector then exposes OAuth methods:
- `generateAuthUrl()`: Returns the URL to redirect the user to.
- `handleCallback(code, state)`: Exchanges the code for tokens and saves them in the connector state.
- `refreshTokens()`: Uses the refresh token to get new tokens.
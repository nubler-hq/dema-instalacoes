# @igniter-js/connectors - API Reference

This document covers the public APIs exposed by the `@igniter-js/connectors` package.

## Core Classes

### `IgniterConnectors` (Manager)

The central manager for all connectors. It holds the registry of available connectors, the storage adapter, and provides access to scoped connectors.

#### Methods:
- `static create(adapter: IIgniterConnectorAdapter): IgniterConnectorsBuilder`
- `scope<TConfig, TState>(type: string, id: string): IIgniterScopedConnectors`
  - Returns a scoped manager instance for interacting with connectors within a specific context (tenant).
- `getConnector<C extends IIgniterConnector<any, any>>(id: string): C | undefined`
  - Retrieves a connector definition from the registry.
- `withEncryption(key: string): this`
  - Enables AES-256-GCM encryption with a 32-byte key string.
- `withTelemetry(sink: IIgniterTelemetrySink): this`
  - Attaches a telemetry sink to track connector events.
- `withConnector(connector: IIgniterConnector<any, any>): this`
  - Registers a connector definition with the manager.

### `IgniterConnectorBuilder<TConfig, TState>`

Fluent builder for defining a connector's behavior, schema, and lifecycle.

#### Methods:
- `static create(id: string): IgniterConnectorBuilder<any, any>`
- `withConfigSchema<TConfig>(schema: StandardSchemaV1<any, TConfig>): IgniterConnectorBuilder<TConfig, TState>`
- `withStateSchema<TState>(schema: StandardSchemaV1<any, TState>): IgniterConnectorBuilder<TConfig, TState>`
- `withEncryption(fields: Array<keyof TConfig | keyof TState>): this`
  - Specifies which fields in the config and state schemas should be encrypted at rest.
- `withMethod<TName extends string, TArgs extends any[], TReturn>(name: TName, handler: (ctx: IgniterConnectorContext<TConfig, TState>, ...args: TArgs) => Promise<TReturn>): this`
  - Defines a custom method for the connector. The first argument is always the context.
- `withWebhook<TEvent extends string, TPayload>(event: TEvent, config: IgniterConnectorWebhookConfig<TConfig, TState, TPayload>): this`
  - Registers a webhook endpoint and handler.
- `withOAuth(config: IgniterConnectorOAuthConfig): this`
  - Configures OAuth 2.0 flow properties.
- `onInstall(hook: (ctx: IgniterConnectorContext<TConfig, TState>) => Promise<void>): this`
- `onUninstall(hook: (ctx: IgniterConnectorContext<TConfig, TState>) => Promise<void>): this`
- `onUpdate(hook: (ctx: IgniterConnectorContext<TConfig, TState>) => Promise<void>): this`
- `build(): IIgniterConnector<TConfig, TState>`

### `IIgniterScopedConnectors`

The interface for interacting with connectors within a specific context (e.g., an organization or user).

#### Methods:
- `install<TConfig>(connectorId: string, config: TConfig): Promise<IIgniterScopedConnector<TConfig, any>>`
  - Installs a connector for this scope, triggering the `onInstall` hook.
- `uninstall(connectorId: string): Promise<void>`
  - Uninstalls a connector, triggering the `onUninstall` hook and removing its data.
- `get<TConfig, TState>(connectorId: string): Promise<IIgniterScopedConnector<TConfig, TState> | null>`
  - Retrieves the installed connector instance, decrypting any sensitive fields.
- `updateConfig<TConfig>(connectorId: string, config: Partial<TConfig>): Promise<IIgniterScopedConnector<TConfig, any>>`
  - Updates the connector's configuration, triggering the `onUpdate` hook.
- `updateState<TState>(connectorId: string, state: Partial<TState>): Promise<IIgniterScopedConnector<any, TState>>`
  - Updates the connector's internal state.

### `IIgniterScopedConnector<TConfig, TState>`

Represents an installed instance of a connector within a specific scope.

#### Properties:
- `id`: The connector ID (e.g., `'stripe'`).
- `config`: The decrypted, validated configuration object.
- `state`: The decrypted, validated state object.
- `context`: The scope context `{ type: string, id: string }`.
- `methods`: Record of custom methods defined on the connector.
- `oauth`: Utility methods for handling OAuth flows (`generateAuthUrl()`, `handleCallback()`, `refreshTokens()`).
- `webhooks`: Record of webhook handlers.

## Storage Adapters

### `PrismaConnectorAdapter`
Adapter for Prisma ORM. Expects a `Connector` model by default.
- `constructor(prisma: any, options?: PrismaAdapterOptions)`
- Options: `{ modelName?: string }`

### `MockConnectorAdapter`
In-memory adapter for testing and development.
- `constructor()`

## Types and Interfaces

### `IgniterConnectorContext<TConfig, TState>`
```typescript
interface IgniterConnectorContext<TConfig, TState> {
  config: TConfig;
  state: TState;
  context: {
    type: string; // e.g., 'organization'
    id: string;   // e.g., 'org-123'
  };
}
```

### `IgniterConnectorWebhookConfig<TConfig, TState, TPayload>`
```typescript
interface IgniterConnectorWebhookConfig<TConfig, TState, TPayload> {
  schema?: StandardSchemaV1<any, TPayload>; // Optional validation schema
  verify?: (ctx: IgniterConnectorContext<TConfig, TState>, req: Request) => Promise<boolean>; // Signature verification
  handler: (ctx: IgniterConnectorContext<TConfig, TState>, payload: TPayload) => Promise<void>; // Event processing
}
```

### `IgniterConnectorOAuthConfig`
```typescript
interface IgniterConnectorOAuthConfig {
  provider: string;
  clientId: string;
  clientSecret: string;
  authorizationUrl: string;
  tokenUrl: string;
  scopes?: string[];
  pkce?: boolean; // Enable Proof Key for Code Exchange
  redirectUri?: string;
}
```
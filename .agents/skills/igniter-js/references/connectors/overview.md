# @igniter-js/connectors - Overview

## What is it?
`@igniter-js/connectors` provides a type-safe, multi-tenant connector system for integrating third-party services. It unifies configuration, OAuth, encryption, webhooks, and observability under a single API.

## Core Capabilities
- **Type-safe connectors**: Define configuration and state using `StandardSchemaV1` (Zod-compatible).
- **Multi-tenant scopes**: Isolate configuration and access per organization, user, system, or custom contexts.
- **Secure by default**: Built-in AES-256-GCM encryption utilities and secrets handling for sensitive fields (API keys, tokens).
- **OAuth 2.0 Management**: Managed flows with PKCE and state verification.
- **Webhook pipelines**: Webhook validation, verification, and structured event routing.
- **Adapter-driven storage**: Pluggable storage implementations (e.g., Prisma, Mock).
- **Observable**: Unified event emission and deep telemetry integration.

## When to use it?

You should use `@igniter-js/connectors` when you need to:
1. Integrate with third-party APIs (e.g., Stripe, Slack, GitHub).
2. Manage OAuth flows and store refresh/access tokens securely.
3. Handle webhook payloads from external services securely and reliably.
4. Manage integration settings on a per-tenant (organization or user) basis.
5. Provide a standardized, type-safe interface for internal services to interact with external providers.

## Key Concepts

### Connectors (`IgniterConnectorBuilder`)
A Connector defines the *blueprint* for an integration. It specifies:
- `id` (e.g., `'stripe'`)
- `configSchema`: What settings are required to connect (e.g., API keys, environment).
- `stateSchema`: What state is maintained (e.g., OAuth tokens).
- Optional lifecycle hooks (`onInstall`, `onUninstall`, `onUpdate`).
- Custom methods extending the connector's functionality.

### Manager (`IgniterConnectors`)
The Manager is the central orchestrator. It holds the registry of all available connectors and the storage adapter. It is the main entry point for interacting with the system.

### Scopes (`IgniterScopedConnectors`)
To interact with a connector instance, you must scope it to a specific context (tenant). This ensures data isolation.
```typescript
const orgConnectors = manager.scope('organization', 'org-123');
// orgConnectors can now install, get, or interact with connectors for org-123
```

### Adapters (`IIgniterConnectorAdapter`)
Adapters handle the persistence layer. The package comes with:
- `PrismaConnectorAdapter`: For relational databases via Prisma.
- `MockConnectorAdapter`: For testing and development.
- Custom adapters can be implemented for other data stores.
# @igniter-js/telemetry Setup

This guide walks you through the installation and basic configuration of the `@igniter-js/telemetry` package.

## Installation

```bash
# npm
npm install @igniter-js/telemetry

# pnpm
pnpm add @igniter-js/telemetry

# yarn
yarn add @igniter-js/telemetry

# bun
bun add @igniter-js/telemetry
```

## Golden Path Setup

Configuration is done via fluent, immutable builders. Never mutate configuration objects directly; always chain methods and finish with `.build()`.

```typescript
import { IgniterTelemetry } from '@igniter-js/telemetry'
import { LoggerTransportAdapter } from '@igniter-js/telemetry/adapters'

export const telemetry = IgniterTelemetry.create()
  .withService('billing-service') // Your service name
  .withEnvironment('production')   // development, staging, production
  .withVersion('1.0.0')            // Optional version
  .addActor('user')                // Declare available actors
  .addScope('organization')        // Declare available scopes
  .addTransport(LoggerTransportAdapter.create({
    logger: console,
    format: 'json'
  }))
  .withRedaction({
    denylistKeys: ['password', 'token', 'secret']
  })
  .build()

// Emit a generic event (no custom typed event registry yet)
telemetry.emit('service.booted', {
  attributes: { 'ctx.uptime_ms': 1234 }
})
```

## Basic Concepts in Setup

### 1. `withService` & `withEnvironment`
Always define your service name (`billing-service`, `auth-api`, etc.) and the current environment (`production`, `development`). These fields are attached to every telemetry event envelope. By default, `service` is `igniter-app` and `environment` is `development`.

### 2. `addActor` & `addScope`
These declare the allowed actors (entities performing actions, like `user`, `system`, `bot`) and scopes (context boundaries, like `organization`, `workspace`, `project`). These must match exactly when you start a session.

### 3. `addTransport`
Transports are the destination for your telemetry. You can add multiple transports (e.g., Console for development, OTLP for Datadog, Slack for alerts). The package provides built-in adapters (exported via `@igniter-js/telemetry/adapters`).

### 4. `withRedaction`
Crucial for privacy. Define which keys should be scrubbed from the `attributes` payload before sending the event. It can remove keys (`denylistKeys`) or hash their values (`hashKeys`).

## Next Steps

After basic setup, you should define your typed event registries. See the [Patterns](./patterns.md) and [API](./api.md) documents for details on creating strongly typed events and managing sessions.

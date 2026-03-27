# @igniter-js/telemetry Patterns

This document describes the architectural patterns, best practices, and anti-patterns for `@igniter-js/telemetry`.

## 1. Immutable Builder Pattern
Configuration is almost always done via fluent, immutable builders.

*   **Pattern:** `IgniterTelemetry.create().withY().addX().build()`
*   **Rule:** Never mutate configuration objects directly. Always chain methods.

```typescript
// ✅ Correct
const telemetry = IgniterTelemetry.create()
  .withService('api')
  .build();

// ❌ Incorrect
const telemetry = new IgniterTelemetry();
telemetry.service = 'api';
```

## 2. Schema-First Design (Zod)
Runtime safety is enforced via Zod schemas (or StandardSchemaV1). Events should be strictly typed using `IgniterTelemetryEvents`.

```typescript
import { z } from 'zod';
import { IgniterTelemetryEvents } from '@igniter-js/telemetry';

const AuthEvents = IgniterTelemetryEvents
  .namespace('igniter.auth')
  .event('login.started', z.object({ 'ctx.user.id': z.string() }))
  .event('login.succeeded', z.object({ 'ctx.user.id': z.string() }))
  .event('login.failed', z.object({ 'ctx.auth.reason': z.string() }))
  .build();
```

## 3. Session-Aware Context Correlation
Events in isolation are noise. `IgniterTelemetrySession` correlates events across async boundaries without manual context threading.

*   **Pattern:** `session.run()` with `AsyncLocalStorage`.

```typescript
// Inside a middleware or request handler
await telemetry.session()
  .actor('user', req.user.id)
  .scope('organization', req.tenant.id)
  .run(async () => {
    // Both events below will automatically include actor='user' and scope='organization'
    telemetry.emit('request.received', { attributes: { 'ctx.request.path': req.path } });
    await next();
    telemetry.emit('request.completed', { attributes: { 'ctx.request.status': res.statusCode } });
  });
```

## 4. Privacy by Design (Redaction)
Redaction is applied before transport fan-out to prevent PII leaks.

```typescript
telemetry = IgniterTelemetry.create()
  // ...
  .withRedaction({
    denylistKeys: ['password', 'token', 'credit_card'],
    hashKeys: ['email'] // Hash the email instead of removing it entirely
  })
  .build();
```

## 5. Event Naming Rules
- No colons (`:`).
- No spaces.
- Prefer dot notation (`domain.feature.action`).
- Avoid reserved prefixes (`__`, `__internal`).

```typescript
// ✅ Correct
'auth.login.started'
'workspace.billing.updated'

// ❌ Incorrect
'auth:login'
'__system.boot'
```

## 6. Attribute Naming Rules (Context Keys)
- Always use the `ctx.` prefix for attribute keys to prevent collisions.
- Use dot notation to group domains.

```typescript
// ✅ Correct
'ctx.user.id'
'ctx.request.path'
'ctx.payment.transaction_id'

// ❌ Incorrect
'userId'
'path'
'transactionId'
```

## Best Practices vs Anti-Patterns

| ✅ Do | Why | Example |
| :--- | :--- | :--- |
| Use `ctx.` attribute keys | Prevent collisions | `'ctx.user.id'` |
| Define typed events | Enforce schema safety | `IgniterTelemetryEvents` |
| Use sessions in HTTP flows | Context correlation | `session.run()` |
| Redact PII | Prevent leakage | `withRedaction({ hashKeys: ['email'] })` |

| ❌ Don’t | Why | Example |
| :--- | :--- | :--- |
| Log raw secrets | Security risk | `{ token: '...' }` |
| Skip sampling in high volume | Cost blowout | No `withSampling()` |
| Use colon delimiters | Invalid names | `auth:login` |

## Domain-Scoped Guidance

- **High-frequency trading:** set `debugRate` to `0`, `infoRate` to `0.01` via sampling.
- **Public APIs:** add `source` metadata for traceability.
- **Mobile backends:** ship errors to Sentry, business events to OTLP.
- **Multi-tenant SaaS:** always set `scope` for every request using `session.scope()`.

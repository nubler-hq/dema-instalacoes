# @igniter-js/telemetry Overview

`@igniter-js/telemetry` is the mission-critical observability engine of the Igniter.js ecosystem. It unifies logs, metrics-like events, and error reporting under a **typed, session-aware, privacy-safe** model. This package is not just a logging facade—it is a deterministic telemetry pipeline that enforces structure across all event flows.

## Core Philosophy

The design of `@igniter-js/telemetry` is built upon four non-negotiable pillars:

1. **Type Safety as a First-Class Citizen:** Telemetry should be as robust as business logic. By using TypeScript's advanced type accumulation and Zod-based schemas, "telemetry drift" is eliminated. Events are strongly typed registries.
2. **Context-Aware Observability:** Events in isolation are noise. Our session-based system uses `AsyncLocalStorage` to ensure that every event is automatically correlated with its originating request, user, and tenant scope, without manual context threading.
3. **Privacy by Design:** Telemetry is often the primary source of PII leaks. This package enforces a redaction-first approach where sensitive data is either hashed or completely removed at the edge—before it ever hits a network transport or a disk.
4. **Operational Resilience:** Telemetry should never crash an application. Our pipeline is non-blocking, exception-swallowing (with internal logging), and sampling-aware to ensure high performance even under extreme load. Transport failures are isolated.

## The Problems It Solves

Developers building complex TypeScript applications often struggle with:
- **Fragmented Logging:** Mixing `console.log`, Sentry calls, and custom tracking.
- **Context Loss:** Losing the "trace" of a user request as it flows through async operations.
- **PII Leakage:** Accidentally logging passwords, tokens, or personal data in production logs.
- **Cost Blowout:** Sending unbounded telemetry volume to expensive providers (Datadog, Splunk).
- **Weak Contracts:** Inconsistent event naming and shape drift (logs that are strings, impossible to query reliably).

`@igniter-js/telemetry` provides a unified, structured, and governed solution to all these problems.

## When to use it?

You should use `@igniter-js/telemetry` whenever you need to:
- Track business metrics and events (e.g., `user.signed_up`, `order.completed`).
- Trace execution flows across async boundaries.
- Ship structured logs to external providers (Console, OTLP, Datadog, Slack, Sentry, Discord).
- Ensure sensitive data (PII) is automatically redacted from all outgoing telemetry.
- Apply sampling rules to reduce telemetry costs in high-volume environments.

## Architecture Highlights

- **Immutable Builders:** Configuration is done via fluent, immutable builders (`IgniterTelemetry.create().with...build()`).
- **Pipeline:** Sampling → Envelope Creation → Redaction → Transport Fan-out.
- **Server-Only:** Designed for Node.js backend environments (uses a `shim.ts` safeguard to prevent client-side imports).

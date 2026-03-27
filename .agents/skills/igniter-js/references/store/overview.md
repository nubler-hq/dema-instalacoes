# @igniter-js/store - Overview

**@igniter-js/store** is the mission-critical, high-performance distributed state management and event orchestration engine for the Igniter.js ecosystem. In the world of modern, cloud-native TypeScript applications, state is often the most significant source of complexity, runtime fragility, and latency.

`@igniter-js/store` provides a unified, type-safe abstraction over distributed data stores (primarily Redis), enabling developers to manage complex state, coordinate background processes, and synchronize events across multiple server instances with minimal friction and maximum reliability.

## Core Philosophy

The design of `@igniter-js/store` is guided by the principle of **Predictable Distributed State**. Distributed systems are notoriously difficult to debug because of race conditions, inconsistent data views, and lack of visibility into "what happened when." This package eliminates these uncertainties by enforcing:

- **Strict Prefixing**: Ensuring no two services ever accidentally overwrite each other's data through deterministic key generation.
- **Atomic Operations**: Providing primitives (like counters and claims) that work correctly across thousands of nodes.
- **Observable Lifecycle**: Emitting telemetry at every critical juncture.
- **Contract-First Events**: Ensuring that services communicate via strictly defined and validated schemas (using Zod or StandardSchemaV1).

## Key Capabilities

1. **Key-Value Storage**: Fast, typed get/set operations with TTL (Time To Live) support.
2. **Atomic Counters**: Thread-safe, atomic increment and decrement operations.
3. **Distributed Claims**: Distributed locking using SETNX to coordinate exclusive tasks across workers.
4. **Batch Operations**: Multi-key get and set operations to minimize network roundtrips.
5. **Typed Pub/Sub**: Real-time event broadcasting with end-to-end TypeScript inference and Zod schema validation.
6. **Redis Streams**: Reliable, append-only logs with consumer group support for robust background processing.
7. **Multi-Tenant Scoping**: Hierarchical key isolation with typed scope definitions, making multi-tenant SaaS architectures safe and easy.

## When to Use This Package

Use `@igniter-js/store` whenever you need to:
- Share state across multiple Node.js instances.
- Cache expensive database queries or API responses.
- Implement rate limiting or quotas (Counters).
- Ensure only one instance runs a specific background task (Claims/Locks).
- Broadcast real-time updates to connected clients or other services (Typed Pub/Sub).
- Build reliable event-driven architectures (Streams).
- Manage state securely in a multi-tenant environment (Scopes).

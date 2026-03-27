# Architectural Patterns & Best Practices

This document outlines the core architectural patterns and recommended practices for building robust and scalable background processing systems using `@igniter-js/jobs`.

## Core Philosophy

`@igniter-js/jobs` embraces **fluent builders**, **immutability**, and **type safety**. These principles guide how you interact with the library.

### Immutable Builders

All configuration—from creating a queue to defining a worker—is done via fluent builders (e.g., `IgniterJobs.create()`, `IgniterQueue.create()`).

**Key Rule:** These builders are strictly immutable. Every chain method (like `.addJob()`, `.withAdapter()`) copies the state and returns a new instance. They never mutate state in place.

*   **Why?** This ensures predictable configuration behavior, especially when sharing builder instances or accumulating complex types (like scopes or context requirements).

### Type Accumulation

The builder pattern is designed to accumulate TypeScript inference. As you chain methods (e.g., adding a queue or setting a context type), the resulting object's type reflects those additions. This provides full type safety when dispatching jobs or subscribing to events.

### Adapter Pattern

The core runtime acts as an orchestrator, while the heavy lifting (queuing, scheduling, retries) is delegated to an adapter.

*   **Production:** The `IgniterJobsBullMQAdapter` (built on top of BullMQ and Redis) provides features like rate limiting, scheduling (cron/repeat), and advanced management APIs. It must maintain feature parity with the standalone `@igniter-js/adapter-bullmq`.
*   **Testing:** An in-memory adapter is provided solely for testing purposes. It ensures your tests run quickly without requiring a Redis connection while maintaining API compatibility.

## Designing Queues and Jobs

### 1. Granular Queues

Divide your jobs into logical queues based on their purpose, resource requirements, or priority (e.g., `email`, `reports`, `cleanup`). This allows you to scale workers independently for different types of workloads.

### 2. Validation with Zod (or StandardSchemaV1)

Always define an `input` schema for your jobs using Zod (or a compatible validator). The runtime will automatically validate the payload before the job handler is executed.

```typescript
// Define expected input
input: z.object({
  userId: z.string().uuid(),
  templateData: z.record(z.string(), z.any()),
}),
handler: async ({ input, context }) => {
  // `input` is strictly typed and guaranteed to be valid
  await context.mailer.send(input.userId, input.templateData);
}
```

### 3. Context Injection

Avoid hardcoding dependencies (like database connections or mailers) directly into your job handlers. Instead, inject them via the `context` object provided during the `IgniterJobs` setup.

*   **Define the context type:** `IgniterQueue.create("email").withContext<{ mailer: Mailer }>()`
*   **Provide the context factory:** `IgniterJobs.create().withContext(async () => ({ mailer: new Mailer() }))`

This pattern makes your jobs highly testable, as you can easily mock dependencies in your tests.

## Managing Workers

Workers are responsible for consuming jobs from the queues.

### 1. Concurrency Control

Configure concurrency appropriately for the workload. High-concurrency workers are suitable for I/O-bound tasks (like making API requests), while CPU-bound tasks may require lower concurrency or dedicated worker processes.

```typescript
const worker = await jobs.worker
  .create()
  .addQueue("reports") // Specific queue
  .withConcurrency(2)  // Limit concurrent processing for CPU-intensive tasks
  .build();
```

### 2. Graceful Shutdown

Always implement a graceful shutdown mechanism to allow workers to finish processing active jobs before exiting.

```typescript
process.on('SIGINT', async () => {
  console.log('Shutting down workers...');
  await worker.close(); // Waits for active jobs to complete
  process.exit(0);
});
```

## Advanced Patterns

### Single-Scope (Multi-tenancy)

For multi-tenant applications, `@igniter-js/jobs` supports scoping. You can enforce that all jobs must be associated with a specific tenant (e.g., an `organization`).

1.  **Define Required Scopes:** `.addScope("organization", { required: true })`
2.  **Dispatch with Scope:**
    *   **Pre-bind:** `const orgJobs = jobs.scope("organization", "org_1"); await orgJobs.email.sendWelcome.dispatch(...)`
    *   **Per-dispatch:** `await jobs.email.sendWelcome.dispatch({ input: ..., scope: { type: "organization", id: "org_1" } })`

### Telemetry & Observability

Observability is a first-class concern but an optional dependency. Integrating `@igniter-js/telemetry` provides deep insights into job performance and failure rates.

*   **Fire-and-Forget:** Telemetry emission is best-effort. If the telemetry system fails, it will not crash the worker or fail the job execution.
*   **Stable Naming:** Event names (`igniter.jobs.<group>.<event>`) and attributes (prefixed with `ctx.`) are kept stable for reliable monitoring dashboards.

### Scheduling (Cron)

Use `queue.addCron()` for repeatable tasks (e.g., daily cleanup scripts). The underlying adapter (BullMQ) handles the scheduling logic. Advanced scheduling metadata (like skipping weekends or business hours) can be attached via `metadata.advancedScheduling`. The runtime ensures that repeat options are passed correctly to the adapter and that metadata survives serialization.

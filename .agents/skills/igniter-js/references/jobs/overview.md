# `@igniter-js/jobs` Overview

`@igniter-js/jobs` provides a fluent, type-safe API for defining background jobs, workers, queues, and scheduling within the Igniter.js ecosystem. It mirrors the developer experience (DX) of `@igniter-js/store` and `@igniter-js/telemetry`, offering a robust foundation for asynchronous task execution.

## Core Concepts

The package is built around several key concepts that work together to provide a seamless background job experience:

### 1. Fluent Builders (Immutability)
The API relies heavily on fluent builders (e.g., `IgniterJobs.create()`, `IgniterQueue.create()`, `worker.create()`). These builders are designed to be **immutable**. Every chain method (like `.addJob()`, `.withAdapter()`) copies the state and returns a new instance. They accumulate types along the chain to provide full TypeScript inference. The final configuration is realized when `.build()` is called.

### 2. Queues and Jobs
- **Queues (`IgniterQueue`)**: Logical groupings of jobs. They define the context and register specific job types and cron tasks.
- **Jobs**: Individual units of work defined within a queue. Each job has an expected input schema (validated via Zod or StandardSchemaV1) and a handler function.

### 3. Adapters
`@igniter-js/jobs` wraps adapter implementations to connect to actual job processing backends.
- **BullMQ Adapter** (`IgniterJobsBullMQAdapter`): The primary, production-ready adapter that wires queues and workers to Redis via BullMQ. It supports rate limiting, scheduling, retries, backoff, and management APIs.
- **Memory Adapter**: A minimal, API-compatible adapter intended purely for testing.

### 4. Workers
Workers consume jobs from the queues. They are configured via their own builder (`jobs.worker.create()`) and are responsible for executing the job handlers defined in the queues. They emit lifecycle events.

### 5. Scopes (Multi-tenancy)
The package supports "single-scope" multi-tenancy. You can define required scopes (e.g., an `organization` ID) at the builder level. When dispatching jobs, you must either pre-bind the scope (using `jobs.scope()`) or provide it per-dispatch.

### 6. Events and Telemetry
- **Events**: Typed events are emitted throughout the job and worker lifecycles. You can subscribe to these globally or at the individual job level.
- **Telemetry**: Optional integration with `@igniter-js/telemetry`. It provides lightweight, "fire-and-forget" observability. Event names follow the pattern `igniter.jobs.<group>.<event>` (e.g., `igniter.jobs.job.enqueued`).

### 7. Scheduling (Cron)
Repeatable tasks can be scheduled using `queue.addCron()`. The BullMQ adapter handles the actual execution based on the cron expression. Advanced scheduling metadata (like skipping weekends) can be attached.

## When to Use

Use `@igniter-js/jobs` when you need to:
- Offload heavy or long-running tasks from the main thread (e.g., sending emails, generating reports).
- Schedule recurring tasks (e.g., nightly cleanups, daily summaries).
- Ensure reliable task execution with retries and backoff strategies.
- Maintain strict type safety across your job definitions and payloads.
- Integrate background jobs smoothly into an existing Igniter.js architecture, especially if using `@igniter-js/telemetry` or needing multi-tenant scoped execution.

## Architecture Flow (Happy Path)

1.  **Definition**: You define your queues, jobs, and workers using the fluent builders.
2.  **Wiring**: The configured adapter (e.g., BullMQ) wires up the underlying infrastructure.
3.  **Dispatch**: A job is enqueued (either manually or via a cron schedule).
4.  **Processing**: The adapter schedules the job, and an available worker consumes it.
5.  **Lifecycle**: Events (internal and telemetry) are emitted as the job starts, progresses, and completes (or fails).
6.  **Error Handling**: Errors bubble up as `IgniterJobsError` instances with specific codes. The runtime ensures that telemetry or logging errors do not crash the workers.

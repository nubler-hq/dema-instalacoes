# Setup & Configuration

This guide covers how to install and configure `@igniter-js/jobs` for your application, including setting up the BullMQ adapter for production and integrating with telemetry.

## Installation

Install the core package and its dependencies. If you plan to use BullMQ (recommended for production), you must install the specific adapter and its peer dependencies.

```bash
# Core package
npm install @igniter-js/jobs @igniter-js/core

# For production (BullMQ + Redis)
npm install bullmq ioredis zod @igniter-js/adapter-bullmq
```

## Basic Configuration

The configuration relies on fluent builders to create Queues and the main Jobs instance.

### 1. Define a Queue

Use `IgniterQueue.create()` to define a queue and register its jobs.

```typescript
import { IgniterQueue } from "@igniter-js/jobs";
import { z } from "zod";

// Define the context your jobs will need (e.g., database connections, mailers)
type AppContext = { mailer: any };

const emailQueue = IgniterQueue.create("email")
  .withContext<AppContext>()
  .addJob("sendWelcome", {
    // Optional input validation schema
    input: z.object({ email: z.string().email() }),
    handler: async ({ input, context }) => {
      // Execute the job logic
      await context.mailer.send(input.email);
    },
  })
  .build();
```

### 2. Configure the Jobs Instance

Use `IgniterJobs.create()` to bring everything together. You need to attach an adapter, register your queues, and provide the context factory.

```typescript
import { IgniterJobs } from "@igniter-js/jobs";
import { IgniterJobsBullMQAdapter } from "@igniter-js/jobs/adapters";
import Redis from "ioredis";

// Setup Redis connection for BullMQ
const redis = new Redis(process.env.REDIS_URL);

// Create the main jobs instance
const jobs = IgniterJobs.create<AppContext>()
  .withAdapter(IgniterJobsBullMQAdapter.create({ redis }))
  .withService("my-api") // Identify the service
  .withEnvironment("development")
  // Provide the context instance that will be passed to job handlers
  .withContext(async () => ({ mailer: myMailerInstance }))
  // Register the queues
  .addQueue(emailQueue)
  .build();
```

## Configuring Telemetry (Optional)

To enable observability, integrate `@igniter-js/jobs` with `@igniter-js/telemetry`. This automatically emits OpenTelemetry events for job and worker lifecycles.

```typescript
import { IgniterTelemetry } from "@igniter-js/telemetry";
import { IgniterJobsTelemetryEvents } from "@igniter-js/jobs";

// 1. Configure the telemetry instance with jobs events
const telemetry = IgniterTelemetry.create()
  .withService("my-api")
  .addEvents(IgniterJobsTelemetryEvents)
  .build();

// 2. Attach telemetry to the jobs instance
const jobsWithTelemetry = IgniterJobs.create<AppContext>()
  .withAdapter(IgniterJobsBullMQAdapter.create({ redis }))
  .withTelemetry(telemetry)
  // ... other configuration
  .build();
```

## Configuring Scopes (Multi-tenancy)

If your application requires multi-tenancy (e.g., jobs must be associated with a specific organization), configure scopes during setup.

```typescript
const scopedJobs = IgniterJobs.create<AppContext>()
  .withAdapter(...)
  // Define required scopes
  .addScope("organization", { required: true })
  .addQueue(emailQueue)
  .build();
```

You must then provide this scope when dispatching jobs. See the Patterns or Examples documentation for details on dispatching scoped jobs.

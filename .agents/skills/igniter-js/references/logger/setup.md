# Logger Setup

This guide details how to install and configure the `@igniter-js/logger` for your project.

## Installation

Install the package using your preferred package manager:

```bash
npm install @igniter-js/logger
# or
pnpm add @igniter-js/logger
# or
yarn add @igniter-js/logger
# or
bun add @igniter-js/logger
```

## Basic Configuration

The logger uses a Builder pattern (`IgniterLogger.create()`) to configure transports, context, and log levels.

```typescript
import { IgniterLogger, IgniterLogLevel } from "@igniter-js/logger";

const logger = IgniterLogger.create()
	.withLevel(IgniterLogLevel.Info) // Default: Info
	.withAppName("my-api") // Adds app_name to all logs
	.withComponent("auth") // Adds component to all logs
	.withContext({ version: "1.0.0" }) // Base context applied globally
	.build(); // Returns an IgniterLoggerManager
```

## Configuring Built-in Transports

The logger supports multiple transports simultaneously. Use `addTransport()` during the build phase.

### Console Transport (Default)

Provides colorized, human-readable logging for development.

```typescript
const logger = IgniterLogger.create()
	.addTransport({
		target: "console",
		options: {
			pretty: true, // Pretty formatting (default: true)
			colorize: true, // Colors (default: true)
			destination: "stdout" // stdout or stderr
		},
	})
	.build();
```

> **Production Recommendation:** Disable `pretty` printing in production for better performance.

### File Transport

Writes logs to a file with optional rotation.

```typescript
const logger = IgniterLogger.create()
	.addTransport({
		target: "file",
		options: {
			path: "/var/log/app.log",
			mkdir: true, // Automatically create directories if missing
			rotation: {
				maxSizeBytes: 10_000_000, // Rotate every 10MB
				maxFiles: 10,             // Keep 10 rotated files
				intervalMs: 86_400_000,   // Rotate daily (in milliseconds)
			},
		},
	})
	.build();
```

### HTTP Transport

Sends logs to a remote ingest endpoint.

```typescript
const logger = IgniterLogger.create()
	.addTransport({
		target: "http",
		options: {
			url: "https://logs.myapp.com/ingest",
			headers: { "X-API-Key": process.env.LOG_API_KEY ?? "" },
			batchSize: 100, // Batch up to 100 entries before sending
			timeoutMs: 10_000,
		},
	})
	.build();
```

> **Note:** The current HTTP transport resolver internally maps to a Pino file target. Native HTTP delivery is under development. For production HTTP logging, we strongly recommend using external Pino transports like `@axiomhq/pino` or `@logtail/pino`.

## Configuring External Pino Transports

You can easily integrate any existing Pino transport by using its package name as the `target`.

```typescript
// First, install the transport: npm install pino-pretty
import { IgniterLogger } from "@igniter-js/logger";

const logger = IgniterLogger.create()
	.addTransport({
		target: "pino-pretty",
		options: {
			colorize: true,
			translateTime: "SYS:standard",
		},
	})
	.build();
```

## Advanced Setup: Type-Safe Scoped Loggers

One of the most powerful features is defining strong typing for your child loggers. This guarantees that specific components log specific context data.

```typescript
import { IgniterLogger } from "@igniter-js/logger";

const logger = IgniterLogger.create()
	.defineScopes<{
		// Define the exact shape required when creating a 'http' child logger
		http: { requestId: string; method: string };
		// Define the exact shape required for 'jobs'
		jobs: { jobId: string; queueName: string };
	}>()
	.build();

// Creating child loggers is now type-safe!

// ✅ Works perfectly
const httpLogger = logger.child("http", {
	requestId: "req-123",
	method: "POST",
});

// ❌ TypeScript Error: Property 'method' is missing
// const invalid = logger.child("http", { requestId: "req-123" });
```
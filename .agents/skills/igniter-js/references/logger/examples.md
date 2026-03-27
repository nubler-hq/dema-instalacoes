# Logger Examples

This section provides practical examples of integrating `@igniter-js/logger` into common frameworks and use cases.

## Basic Console Logging

The simplest setup for development, providing colorized output.

```typescript
import { IgniterLogger } from "@igniter-js/logger";

const logger = IgniterLogger.create()
	.withAppName("my-cli-tool")
	.build();

logger.info("Application started");
logger.success("Configuration loaded successfully");
logger.warn("Deprecated API usage detected", { endpoint: "/v1/users" });
logger.error("Failed to connect to database", new Error("Connection timeout"));
```

## Logging to a File with Rotation

Ideal for background workers or standalone Node.js services where you need persistent local logs.

```typescript
import { IgniterLogger, IgniterLogLevel } from "@igniter-js/logger";
import path from "path";

const logDir = path.join(process.cwd(), "logs");

const logger = IgniterLogger.create()
	.withLevel(IgniterLogLevel.Info)
	.addTransport({
		target: "file",
		options: {
			path: path.join(logDir, "application.log"),
			mkdir: true,
			rotation: {
				maxSizeBytes: 10 * 1024 * 1024, // 10MB
				maxFiles: 5,
				intervalMs: 24 * 60 * 60 * 1000 // Daily
			},
		},
	})
	// Optionally add console output as well during development
	.addTransport({
		target: "console",
		options: { pretty: true, colorize: true }
	})
	.build();

logger.info("Background worker started");
```

## Integrating with Next.js (App Router / API Routes)

For Next.js, create a single logger instance and export it, then create child loggers per request.

**`lib/logger.ts`**
```typescript
import { IgniterLogger, IgniterLogLevel } from "@igniter-js/logger";

// Create a singleton logger
export const rootLogger = IgniterLogger.create()
	.withAppName("nextjs-app")
	.withLevel(process.env.NODE_ENV === "production" ? IgniterLogLevel.Info : IgniterLogLevel.Debug)
	.addTransport({
		target: "console",
		options: {
			pretty: process.env.NODE_ENV !== "production",
			colorize: process.env.NODE_ENV !== "production"
		}
	})
	.defineScopes<{
		api: { requestId: string; path: string; method: string };
		db: { query: string; durationMs?: number };
	}>()
	.build();
```

**`app/api/users/route.ts`**
```typescript
import { NextResponse } from "next/server";
import { rootLogger } from "@/lib/logger";

export async function GET(request: Request) {
	// Generate a unique ID for tracing
	const requestId = request.headers.get("x-request-id") || crypto.randomUUID();
	const url = new URL(request.url);

	// Create a strongly-typed child logger for this request
	const reqLogger = rootLogger.child("api", {
		requestId,
		path: url.pathname,
		method: "GET"
	});

	reqLogger.info("Incoming GET request for users");

	try {
		// Simulate DB call
		const dbLogger = rootLogger.child("db", { query: "SELECT * FROM users" });
		dbLogger.debug("Executing query");

		// ... fetch data
		reqLogger.success("Users fetched successfully");
		return NextResponse.json({ users: [] });
	} catch (error) {
		reqLogger.error("Failed to fetch users", error as Error);
		return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
	}
}
```

## Integrating with Express

Use middleware to attach a scoped logger to the request object.

**`logger.ts`**
```typescript
import { IgniterLogger } from "@igniter-js/logger";

export const logger = IgniterLogger.create()
	.withAppName("express-api")
	.defineScopes<{
		request: { requestId: string; method: string; url: string };
	}>()
	.build();
```

**`server.ts`**
```typescript
import express from "express";
import { v4 as uuidv4 } from "uuid";
import { logger } from "./logger";

const app = express();

// Middleware to attach a child logger to every request
app.use((req, res, next) => {
	const requestId = req.headers["x-request-id"] as string || uuidv4();

	// Create child logger and attach it to the request (if using custom types)
	// Alternatively, just pass it down via standard means
	const reqLogger = logger.child("request", {
		requestId,
		method: req.method,
		url: req.url
	});

	// Example: Log the start of the request
	reqLogger.info("Request received");

	// Simple way to make it available to route handlers (requires type declaration merging in real apps)
	(req as any).log = reqLogger;

	next();
});

app.get("/health", (req, res) => {
	const log = (req as any).log;
	log.debug("Healthcheck pinged");
	res.json({ status: "ok" });
});

const PORT = 3000;
app.listen(PORT, () => {
	logger.info(`Server listening on port ${PORT}`);
});
```

## Using an External Transport (e.g., Logtail)

If you are using a third-party logging service like Axiom, Logtail, or Datadog, install their Pino transport and configure it via `@igniter-js/logger`.

```bash
npm install @logtail/pino @logtail/node
```

```typescript
import { IgniterLogger } from "@igniter-js/logger";

const logger = IgniterLogger.create()
	.withAppName("production-service")
	.addTransport({
		target: "@logtail/pino", // Use the package name
		options: {
			sourceToken: process.env.LOGTAIL_SOURCE_TOKEN // Required by the transport
		}
	})
	// Still keep console logging for the local developer running the server
	.addTransport({
		target: "console",
		options: { pretty: true }
	})
	.build();

logger.info("Logging to Logtail is active!");
```
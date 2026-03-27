# Logger Patterns & Best Practices

This guide outlines the recommended architectural patterns and best practices for implementing `@igniter-js/logger` in production environments.

## 1. Disable Pretty Printing in Production

Pretty printing significantly degrades performance because it requires formatting JSON into human-readable strings. In production, always log raw JSON strings. Log aggregators (Datadog, Splunk, Axiom, etc.) are built to ingest and parse JSON natively.

```typescript
// ✅ Good: Disable pretty printing in production environments
const isProduction = process.env.NODE_ENV === "production";

const logger = IgniterLogger.create()
	.addTransport({
		target: "console",
		options: {
			pretty: !isProduction, // False in production
			colorize: !isProduction // False in production
		}
	})
	.build();
```

## 2. Leverage Child Loggers for Context

Instead of manually injecting the same context (`requestId`, `userId`, `component`) into every log call within a specific function or module, create a scoped child logger. This ensures consistency and reduces boilerplate.

```typescript
// ❌ Bad: Manually injecting context repeatedly
app.post("/checkout", (req, res) => {
	const requestId = req.headers["x-request-id"];
	const userId = req.user.id;

	logger.info("Checkout started", { requestId, userId, action: "start" });
	// ... logic
	logger.info("Payment processing", { requestId, userId, paymentId: "pay_123" });
	// ... logic
	logger.info("Checkout completed", { requestId, userId, orderId: "ord_abc" });
});

// ✅ Good: Create a child logger for the request lifecycle
app.post("/checkout", (req, res) => {
	// Create a scoped logger immediately
	const reqLogger = logger.child("checkout", {
		requestId: req.headers["x-request-id"],
		userId: req.user.id
	});

	reqLogger.info("Checkout started", { action: "start" });
	// ... logic
	reqLogger.info("Payment processing", { paymentId: "pay_123" });
	// ... logic
	reqLogger.info("Checkout completed", { orderId: "ord_abc" });
});
```

## 3. Strongly Type Your Child Loggers

When using child loggers across different modules, utilize `defineScopes<T>()` during initialization. This guarantees that developers provide the correct required context for specific sub-systems.

```typescript
// Define global application logging scopes
const rootLogger = IgniterLogger.create()
	.defineScopes<{
		http: { requestId: string; method: string; path: string };
		database: { queryId: string; table: string };
		worker: { jobId: string; taskType: string };
	}>()
	.build();

// Enforces correct context shape when developers create child loggers
const dbLogger = rootLogger.child("database", {
    queryId: "q_456",
    table: "users"
});
```

## 4. Never Log Personally Identifiable Information (PII)

Logging PII (passwords, full credit card numbers, Social Security Numbers, raw emails) violates compliance standards (GDPR, CCPA, HIPAA) and poses a severe security risk.

```typescript
// ❌ Bad: Logging raw user data and credentials
logger.info("User registered", { email: "user@example.com", password: "plainTextPassword123!" });
logger.error("Payment failed", { creditCard: "4111-1111-1111-1111" });

// ✅ Good: Log opaque identifiers instead
logger.info("User registered", { userId: "usr_789abc" });
logger.error("Payment failed", { paymentMethodId: "pm_xyz123" });
```

## 5. Use Appropriate Log Levels

Choosing the correct log level prevents log spam and ensures critical issues are highlighted.

*   **`fatal`**: The application is crashing or in an unrecoverable state (e.g., database connection lost entirely). Requires immediate intervention.
*   **`error`**: A specific operation failed, but the application remains running (e.g., API request to a third party failed). Should trigger alerts.
*   **`warn`**: Something unexpected happened, but the system handled it, or a deprecated API was used. Doesn't require immediate action but needs investigation.
*   **`info`**: General operational events (e.g., user logged in, scheduled job started, request completed). Useful for auditing.
*   **`debug`**: Detailed information useful for diagnosing issues during development or troubleshooting. Often disabled in production.
*   **`trace`**: Extremely granular information (e.g., function entry/exit, specific variable states). Almost exclusively used during active debugging.

## 6. Implement File Rotation for Local Logs

If you are logging to the local filesystem, always configure file rotation to prevent log files from consuming all available disk space.

```typescript
const logger = IgniterLogger.create()
	.addTransport({
		target: "file",
		options: {
			path: "/var/log/myapp.log",
			mkdir: true,
			rotation: {
				maxSizeBytes: 50 * 1024 * 1024, // Rotate at 50MB
				maxFiles: 5,                    // Keep last 5 files
				// intervalMs: 86400000         // Alternatively rotate daily
			}
		}
	})
	.build();
```

## 7. Always Flush Before Exiting

The logger buffers writes for performance. If the application crashes or exits abruptly, pending logs might be lost. Ensure you call `logger.flush()` during graceful shutdown sequences.

```typescript
process.on("SIGTERM", async () => {
	logger.info("Received SIGTERM, initiating graceful shutdown...");
	// Close database connections, stop accepting requests, etc.
	await logger.flush();
	process.exit(0);
});

process.on("uncaughtException", async (error) => {
	logger.fatal("Uncaught Exception", error);
	await logger.flush(); // Crucial to ensure the fatal error is actually written
	process.exit(1);
});
```
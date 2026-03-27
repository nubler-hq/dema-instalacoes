# Logger Overview

The `@igniter-js/logger` is a high-performance logging library for Igniter.js applications, powered by [Pino](https://getpino.io/). It provides a robust, type-safe abstraction over Pino, ensuring a consistent logging structure across your applications while shielding you from direct Pino API exposure.

## Core Value Proposition

*   **Zero Pino API Exposure:** Work with clean, Igniter-specific abstractions.
*   **High Performance:** Built on Pino, making it 5-10x faster than traditional alternatives like Winston or Bunyan.
*   **Built-in Transports:** Out-of-the-box support for Console, File, and HTTP logging.
*   **External Transport Support:** Seamlessly integrate any Pino transport from the ecosystem (e.g., `pino-pretty`, `@logtail/pino`, `@axiomhq/pino`).
*   **Type-Safe Child Loggers:** Create scoped loggers with guaranteed context structures via TypeScript inference.
*   **Server-Only:** Protected against accidental imports in browser environments, preventing bundle bloat and sensitive data exposure.
*   **Production-Ready:** Features like file rotation, batching, and remote logging are built-in or easily configurable.

## When to Use

You should use `@igniter-js/logger` as the standard logging solution for any backend service, API, or CLI tool built within the Igniter.js ecosystem.

*   **Use it when:** Building Next.js API routes, Express applications, Fastify servers, or standalone Node.js/Bun scripts.
*   **Do NOT use it when:** Building frontend React/Vue/Svelte components that run in the browser. The library is explicitly designed for server-side environments.

## Architecture

The logger uses a Builder pattern to construct a Manager instance:

```
Builder (IgniterLogger)
	-> Configures transports
	-> Sets default context and log levels
	-> defineScopes<T>() for type safety
	-> build()
				|
				v
Manager (IgniterLoggerManager)
	-> Exposes log methods (info, error, debug, etc.)
	-> Creates scoped child loggers
	-> Provides runtime controls (setLevel, flush)
```

1.  **IgniterLogger (The Builder):** Used during application startup to configure how and where logs are written.
2.  **IgniterLoggerManager (The Instance):** The object passed around your application to actually record log entries.
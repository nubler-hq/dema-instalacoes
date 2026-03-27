# Caller Package Overview

The `@igniter-js/caller` package provides an end-to-end type-safe HTTP client built on `fetch`. It is designed to offer a seamless developer experience while ensuring runtime safety through schema validation, built-in retries, caching, and full observability.

## Core Concepts

### Immutable Builder Pattern
The library uses an immutable builder pattern for configuration. You start by configuring the client using `IgniterCaller.create()` and chaining configuration methods (`.withBaseUrl()`, `.withHeaders()`, etc.). Once configured, you call `.build()` to get an operational `IgniterCallerManager` instance. This ensures that the base configuration cannot be accidentally mutated.

### Type Safety and Schema Validation
A standout feature is its deep integration with schema validation libraries (like Zod) via the StandardSchemaV1 interface. By defining expected request and response schemas:
1.  **Build-time Safety:** TypeScript infers the correct types for query parameters, request bodies, and response data.
2.  **Runtime Safety:** The client automatically validates responses against the schema, preventing unexpected API changes from causing silent failures in your application.

### Fluent Request API
When making a request, the `IgniterCallerManager` creates a per-request `RequestBuilder`. This provides a fluent API for configuring specific request details like `.body()`, `.params()`, `.timeout()`, `.retry()`, and `.fallback()`.

### Execution Pipeline
The request execution follows a robust pipeline:
1.  Cache Check
2.  Request Interceptors
3.  Request Validation
4.  Fetch (with retry logic)
5.  Response Parsing
6.  Response Validation
7.  Response Interceptors
8.  Cache Store
9.  Fallback (on failure)
10. Telemetry & Event Emission

## When to Use `@igniter-js/caller`

You should use this package when you need to interact with internal or external HTTP APIs and require:
-   **Guaranteed Type Safety:** When you want to catch API contract mismatches during development rather than in production.
-   **Resilience:** When dealing with unreliable networks or external services that require timeouts, retries with exponential backoff, and fallback values.
-   **Observability:** When you need to monitor API calls, log performance metrics, or integrate with tracing systems (via `@igniter-js/telemetry`).
-   **Zero-Boilerplate Caching:** When you want to easily cache responses in-memory or via external stores (like Redis) using simple `.stale()` or `.cache()` modifiers.
-   **Clean Architecture:** When you prefer a fluent, immutable API design over mutating global configurations (like standard Axios instances).

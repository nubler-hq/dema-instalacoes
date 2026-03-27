# `@igniter-js/collections` Overview

> **Version:** 0.1.11
> **Status:** Stable Alpha

## What is it?

`@igniter-js/collections` is a **universal ORM for content-driven applications**. It provides a Prisma-like, type-safe API for managing unstructured or semi-structured content (Markdown, JSON, YAML) as well as data in key-value stores (Redis) and object storage (S3).

It bridges the gap between static content and dynamic data management, bringing database-like rigor to file-based or external storage systems.

## Core Philosophy

*   **Standardization:** Every collection follows a predictable contract, regardless of the underlying storage adapter (FileSystem, Redis, S3).
*   **Runtime Native:** Designed with zero-overhead adapters for modern runtimes like Bun, while maintaining full Node.js compatibility.
*   **Type-Safety First:** Built on TypeScript and `StandardSchemaV1` (Zod, JSON Schema). Access to collections is dynamically proxied and fully typed (e.g., `docs.posts` inherits the "posts" schema).
*   **Observability:** Built-in telemetry and logging trace the lifecycle of documents from creation to retrieval.
*   **Developer Experience:** A declarative, proxied API reduces boilerplate and feels like a native database client.

## When to use it?

Consider using `@igniter-js/collections` for:

*   **Static Site Generators & CMS:** Managing documentation, blogs, or content where querying Markdown/MDX files efficiently is required.
*   **Microservices:** As a lightweight, type-safe alternative to a full database for managing configuration or small datasets.
*   **High-Performance Content Apps:** Applications needing fast I/O using native Bun syscalls.
*   **AI Ecosystems:** Providing AI Agents with structured, version-controllable ways to store and retrieve memories, logs, or knowledge bases.

## Key Features

*   **Immutable Builder Pattern:** Configuration is declarative and side-effect free using fluent builders.
*   **Dynamic Proxy API:** Intuitive access to collections (e.g., `await manager.posts.findMany()`).
*   **Runtime Schema Discovery:** Automatically load collection schemas and hooks from JSON files based on glob patterns.
*   **Declarative Views:** Shape data for display using operations like `group`, `flatten`, and `pivot`, complete with stats calculation.
*   **Lifecycle Hooks:** Intercept operations (`onCreated`, `onRead`, `onUpdated`, `onDeleted`, `onList`) to add logic like timestamps, validation, or external triggers.
*   **Pluggable Adapters:** Write once, run anywhere with adapters for Bun FS, Node FS, Bun Redis, and Bun S3.

## Integration in the Igniter.js Ecosystem

`@igniter-js/collections` adheres to the core Igniter.js architectural pillars:
*   **Immutable Builders:** Uses `IgniterCollections.create()...build()`.
*   **Schema-First Design:** Relies heavily on Zod for document validation.
*   **Type-Safety:** Leverages advanced TypeScript inference for the proxied manager.
*   **Feature-Specific Error Handling:** Uses custom errors like `IgniterCollectionError` with specific codes.
*   **Telemetry:** Integrates natively with `@igniter-js/telemetry`.

**Source References**
- `node_modules/@igniter-js/collections/README.md:1` | **Package Overview** | Core vision, philosophy, and installation guide.
- `node_modules/@igniter-js/collections/AGENTS.md:1` | **Agent Manual** | Deep dive into architecture, internal flows, and operational procedures.

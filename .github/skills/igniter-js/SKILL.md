---
name: igniter-js
description: Mandatory workflow and expert guide for integrating the complete @igniter-js/* ecosystem. Enforces the "Read-First" protocol to leverage built-in AI-native documentation (AGENTS.md) for type-safe, architecturally correct implementations of Core, Store, Agents, Jobs, Mail, Connectors, Storage, and Telemetry.
---

# Igniter.js Ecosystem Expert

Igniter.js is the first **AI-Native Framework**, designed specifically to be mastered by Code Agents. Every package contains its own specialized instruction manual (`AGENTS.md`) that "trains" you on its specific architecture, patterns, and best practices.

## 🛑 The "Read-First" Protocol (MANDATORY)

Before writing **ANY** code involving an `@igniter-js/*` package, you must execute this sequence:

1.  **Identify:** Determine which package is needed (e.g., `@igniter-js/jobs` for queues, `@igniter-js/mail` for email).
2.  **Locate:** Confirm the package exists in `node_modules/@igniter-js/<package>/`.
3.  **Ingest:** Read the **`AGENTS.md`** file located in the package root.
    *   *If `AGENTS.md` is missing, fallback to `README.md` and then inspect `dist/` types if necessary.*
4.  **Align:** Adopt the architectural patterns (Builders, Immutability, Schemas) described in the docs.

> **Why?** These files contain context, architectural decisions, and edge-case handling that cannot be guessed. They are your "source of truth".

---

## 🧠 Core Architectural Pillars

All Igniter.js packages share a unified DNA. You must adhere to these principles across the entire ecosystem:

### 1. The Immutable Builder Pattern
Configuration is almost always done via fluent, immutable builders.
*   **Pattern:** `IgniterX.create().withY().build()`
*   **Rule:** Never mutate configuration objects directly. Always chain methods.
*   **Example:**
    ```typescript
    // ✅ Correct
    const agent = IgniterAgent.create('bot').withModel(model).build();
    
    // ❌ Incorrect
    const agent = new IgniterAgent();
    agent.model = model;
    ```

### 2. Schema-First Design (Zod)
Runtime safety is enforced via Zod schemas (or StandardSchemaV1).
*   **Rule:** Define schemas *before* implementation.
*   **Context:** Used in `Store` (events), `Agents` (tools), `Connectors` (config), and `Mail` (templates).

### 3. Type-Safety as a Priority
The framework leverages TypeScript's advanced type inference (generics, intersection types).
*   **Rule:** Trust the inference. Avoid `any` or manual casting unless absolutely necessary.

### 4. Feature-Specific Error Handling
Every feature MUST define custom error codes and error classes for type-safe error handling from backend to frontend.
*   **Rule:** Create a `[feature].errors.ts` file with error codes, custom error class extending `IgniterError`, and predefined messages.
*   **Pattern:** `throw new FeatureError({ code: FeatureErrorCodes.RESOURCE_NOT_FOUND, ... })`
*   **Benefits:** Client-side type safety, autocomplete for error codes, consistent error handling, rich debugging context.
*   **Docs:** `.claude/skills/igniter-js/references/core/errors.md`

### 5. Telemetry & Observability
Observability is built-in, not bolted on.
*   **Rule:** Always wire up telemetry if the builder exposes `.telemetry()`.

---

## 📦 Package-Specific Cheat Sheets

*Use these summaries to identify which package to investigate further.*

### `@igniter-js/core`
**Purpose:** The application backbone. Building APIs, Controllers, and Routers.
**Key Concepts:**
*   `Igniter.context<T>()`: Dependency Injection root.
*   `igniter.controller()`: Grouping related actions.
*   `igniter.query()` / `igniter.mutation()`: Defining endpoints.
*   **Docs:** `node_modules/@igniter-js/core/README.md`

### `@igniter-js/store`
**Purpose:** Distributed state, caching, locking, and events (Redis-backed).
**Key Concepts:**
*   **Namespaces:** `kv`, `counter`, `claim` (locks), `events` (pub/sub), `streams`.
*   **Scoping:** `.scope('org', '123')` for multi-tenancy.
*   **Typed Events:** `.addEvents(Registry)` for type-safe Pub/Sub.
*   **Docs:** `node_modules/@igniter-js/store/AGENTS.md`

### `@igniter-js/agents`
**Purpose:** Building type-safe AI agents with tools and memory.
**Key Concepts:**
*   **Tools:** `IgniterAgentTool.create()` with Zod input/output schemas.
*   **Memory:** `IgniterAgentMemory` adapters (In-Memory, File, Redis).
*   **Orchestration:** `IgniterAgentManager` for multi-agent systems.
*   **Docs:** `node_modules/@igniter-js/agents/AGENTS.md`

### `@igniter-js/jobs`
**Purpose:** Background job processing and scheduling (BullMQ wrapper).
**Key Concepts:**
*   **Builders:** `IgniterQueue.create()`, `IgniterWorker.create()`.
*   **Cron:** `queue.addCron('daily-report', ...)` for repeatable tasks.
*   **Telemetry:** deeply integrated lifecycle events (`enqueued`, `completed`, `failed`).
*   **Docs:** `node_modules/@igniter-js/jobs/AGENTS.md`

### `@igniter-js/mail`
**Purpose:** Transactional email with React templates and provider adapters.
**Key Concepts:**
*   **Templates:** Registry of React components with Zod payload schemas.
*   **Adapters:** Resend, Postmark, SendGrid, SMTP.
*   **Queues:** `mail.schedule()` integration with `@igniter-js/jobs`.
*   **Docs:** `node_modules/@igniter-js/mail/AGENTS.md`

### `@igniter-js/connectors`
**Purpose:** Multi-tenant integrations (OAuth, Webhooks) with third-party services.
**Key Concepts:**
*   **Encryption:** Field-level encryption for secrets (API keys, tokens).
*   **OAuth:** Managed flows with PKCE and state verification.
*   **Scopes:** `connector.scope('org', '123')` for tenant isolation.
*   **Docs:** `node_modules/@igniter-js/connectors/AGENTS.md`

### `@igniter-js/storage`
**Purpose:** Multi-cloud file storage abstraction (S3, GCS).
**Key Concepts:**
*   **Scopes:** Hierarchical path management (`/org/123/user/456/...`).
*   **Policies:** Pre-upload validation (size, mime-type).
*   **Adapters:** S3, Google Cloud, Mock (for testing).
*   **Docs:** `node_modules/@igniter-js/storage/AGENTS.md`

### `@igniter-js/telemetry`
**Purpose:** Observability, tracing, and logging.
**Key Concepts:**
*   **Session:** `AsyncLocalStorage` based context (`session.run()`).
*   **Redaction:** Automatic PII stripping.
*   **Transports:** Pluggable outputs (Console, OTLP, Sentry).
*   **Docs:** `node_modules/@igniter-js/telemetry/AGENTS.md`

### `@igniter-js/caller`
**Purpose:** Type-safe HTTP client.
**Key Concepts:**
*   **Immutable State:** Accumulates request config step-by-step.
*   **Integration:** Designed to consume APIs built with `@igniter-js/core`.
*   **Docs:** `node_modules/@igniter-js/caller/AGENTS.md`

---

## 🚀 Implementation Workflow Example

If asked to "Create a background job that sends an email when a user signs up":

1.  **Read:** `read node_modules/@igniter-js/jobs/AGENTS.md` to understand Queues and Workers.
2.  **Read:** `read node_modules/@igniter-js/mail/AGENTS.md` to understand Template registration.
3.  **Code:**
    *   Define the Email Template using `IgniterMail`.
    *   Define the Job Queue using `IgniterQueue`, adding a processor that calls `mail.send()`.
    *   Configure the `IgniterJobs` builder with the queue and adapter.
    *   Dispatch the job using `jobs.queue.dispatch()`.

## ⚠️ Anti-Patterns (Avoid at all costs)

*   **Guessing APIs:** Never assume method names. Igniter APIs are specific. Read the docs.
*   **Skipping Builders:** Do not try to instantiate classes (e.g., `new Manager()`) directly if a `.create()` factory exists.
*   **Ignoring Telemetry:** In production code, always ensure telemetry context is propagated.

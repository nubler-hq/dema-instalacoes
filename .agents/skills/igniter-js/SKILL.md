---
name: igniter-js
description: Master guide for the Igniter-js ecosystem. Trigger this skill AUTOMATICALLY whenever a task involves ANY `@igniter-js/*` package, or when building, refactoring, or understanding backend features, procedures, services, controllers, collections (database models), CLI commands, AI agents, Discord bots, background jobs, external API connectors, or whenever dealing with Zod schemas, tRPC, and Clean Architecture. If a specific package is mentioned in the prompt, you MUST read its references. You must load this skill before writing or modifying any architectural or backend code.
metadata: 
  rules:
    - type: always
      description: "Before writing or modifying any code that interacts with an `@igniter-js/*` package, you MUST trigger this skill to ensure you understand the specific architectural patterns, interfaces, and best practices of that package."
    - type: always
      description: "When a prompt mentions a specific `@igniter-js/*` package, you MUST read the corresponding reference documentation in `.fractal/skills/igniter-js/references/<package-name>/` before proceeding."
    - type: always
      description: "Use this skill as your primary resource for understanding how to implement features, write procedures, services, controllers, and interact with the Igniter-js ecosystem. This is your go-to guide for all things Igniter-js."
---

# Igniter-js Ecosystem Master Guide

Welcome to the **Igniter-js** ecosystem. This project does not use standard Node.js, Express, Fastify, NestJS, or generic MVC patterns. Instead, it utilizes a highly structured, bespoke framework built for Bun/Node.js based on strict Clean Architecture, Zod schema-driven development, context-injected procedures, and heavily decoupled `@igniter-js/*` packages.

As an AI agent, you must understand the philosophy, the architecture, and the discovery protocols outlined in this document before writing a single line of code. **Guessing the API syntax based on general web development knowledge will lead to broken code and severe architectural violations.**

---

## 🔬 MANDATORY RULE: Exploring the `dist/` Folder Source of Truth

While Markdown references provide excellent high-level patterns and overviews, they cannot always capture every single type definition, method signature, or rapidly evolving API change. 

To mitigate errors and ensure you are using the correct interfaces, **you MUST ALWAYS inspect the compiled source code of an `@igniter-js/*` package before using its functionality.** Never assume you know the API. 

### Why this matters
Igniter-js relies heavily on advanced TypeScript generics, Zod inference, and specific class extensions. If you guess a method name or an interface requirement, the build will fail. By reading the `.d.ts` declaration files in the `dist/` folder, you gain absolute certainty about the data flow, business rules, and expected payloads.

### How this affects your behavior
Before you write code that uses an `@igniter-js` package (e.g., creating a new collection, extending a base class, or calling a service):
1. Navigate to `node_modules/@igniter-js/<package-name>/dist/`.
2. Use tools like `cat`, `grep`, or `Read` to inspect `.d.ts` files (usually `index.d.ts`).
3. Analyze the exported interfaces, abstract classes, and method signatures relevant to your task.

### A Real-World Example
**Scenario:** You are asked to create a new database collection registry.
**Bad Behavior:** You assume it works like Mongoose and write `const User = new Schema({...})`.
**Correct Behavior:** 
1. You run `grep -A 10 "class.*Registry" node_modules/@igniter-js/collections/dist/index.d.ts`.
2. You discover the actual signature:
   ```typescript
   declare class IgniterCollectionSchemaRegistry {
       private readonly config;
       private readonly adapter;
       // ...
   }
   ```
3. You realize you need to interact with the registry differently based on the exact types defined in the source, perfectly matching the framework's expectations.

### ♻️ Organic Evolution of References
You are not just a coder; you are a maintainer of this ecosystem's knowledge base. 
1. **Explore:** After completing the `dist/` exploration and successfully implementing the task, compare what you learned from the source code against the local markdown files in `.fractal/skills/igniter-js/references/<package-name>/`.
2. **Patch:** If you find divergences, missing interfaces, or outdated rules in the markdown references, you **MUST** update them to reflect reality.
3. **Rule for Updating:** **NEVER rewrite the entire reference file.** Always use your `Edit` tool to make targeted patches (adding a missing section, updating a method signature). Follow the `skill-creator` philosophy: explain *why* something is done, rather than just imposing rigid ALL CAPS rules. Make the documentation better for the next agent.

---

## 🔍 Discovery Protocol: How to find what you need

To ensure you write code that perfectly aligns with the project's standards, use this multi-tiered discovery protocol:

### Tier 1: The Local Reference Library
Your first stop is the local curated documentation located at `.fractal/skills/igniter-js/references/<package-name>/`.
1. Read `overview.md` to understand the package's purpose.
2. Read `patterns.md` to see the expected architectural implementation.
3. Read `api.md` or `examples.md` for exact syntax.

### Tier 2: The `node_modules` Deep Dive (Proactive Discovery)
You are **highly encouraged** to proactively inspect the installed package inside `node_modules/@igniter-js/<package-name>/`.
*   **Read `AGENTS.md`**: Many packages contain an `AGENTS.md` file specifically written to give AI agents deep context.
*   **Read `README.md`**: For general usage and setup instructions.
*   **⚠️ CRITICAL EXCEPTION for `@igniter-js/core`**: Do **NOT** read the `README.md` or `AGENTS.md` for `@igniter-js/core` inside `node_modules`. That specific documentation is outdated. For core architecture, rely **exclusively** on `.fractal/skills/igniter-js/references/core/`.

### Tier 3: The `dist/` Folder Source of Truth
As detailed in the Mandatory Rule above, always read `node_modules/@igniter-js/<package-name>/dist/*.d.ts`.

### Tier 4: Feature-Specific `AGENTS.md`
Whenever you modify an existing feature (e.g., `src/features/template/`), you **MUST** read that feature's specific `AGENTS.md` file (e.g., `src/features/template/AGENTS.md`). It contains the bounded context rules and exact file mappings.

---

## 🏛️ The Igniter-js Clean Architecture Blueprint

The architecture is built around highly isolated Bounded Contexts (Features). Inside a feature folder, there is a strict data flow and separation of concerns. You must NEVER mix these layers.

**The Data Flow:**
`Transport (Controller / Command) -> Procedure (Context Extension) -> Service (Business Logic) -> Collection (Persistence)`

### 1. Zod as the Single Source of Truth (`[feature].interfaces.ts`)
We do not write manual TypeScript interfaces for API payloads. Everything starts with a Zod schema. Define schemas in `[feature].interfaces.ts` and export the inferred types using `export type User = z.infer<typeof UserSchema>;`.

### 2. Collections: The Persistence Layer (`collections/`)
This is where the database interaction lives using `@igniter-js/collections`. Do not confuse this with traditional "Repository" patterns.
*   **Registry:** Defines the collection name and connects the Zod schema.
*   **Views:** Pre-defined, read-only query projections for safe data retrieval.

### 3. Services: The Heavy Lifters (`services/`)
Services contain the actual, complex business logic. If you need to validate complex data, manipulate files, talk to third-party APIs, or orchestrate multiple collections, it belongs in a Service. Services are instantiated and registered into the global Dependency Injection container inside `src/igniter.context.ts`.

### 4. Procedures: The Context Extenders (`procedures/`)
**CRITICAL CONCEPT:** Procedures in Igniter-js are NOT just floating functions that execute logic. They are providers that **extend the global Context**.
*   **How it works:** You use `igniter.procedure(...)` to return an object that attaches methods to the global `context.procedures.<feature_name>`.
*   **Delegation:** Procedures act as a safe, typed bridge. They receive the injected `Context`, parse inputs, and **delegate** the actual work to `context.fractal.<feature_name>`.

### 5. Transport Layers: Controllers & Commands
These layers are exceptionally "dumb". They only map external requests to internal Procedures. No business `if/else` logic belongs here.

### 6. Domain Errors & CTAs (`[feature].errors.ts`)
We never throw raw `Error()` or leak HTTP status codes (like 404, 500) into our Procedures/Services. Every feature defines its own specific errors by extending base Igniter errors. Use `.cta()` (Call to Action) to return actionable context for CLI users.

---

## 🛠️ Step-by-Step Feature Implementation Lifecycle

When tasked with creating a new feature, follow this exact sequence:

1. **Define Schemas & Types**: `src/features/[feature]/[feature].interfaces.ts` (using Zod).
2. **Define Domain Errors**: `src/features/[feature]/[feature].errors.ts`.
3. **Implement Persistence**: `src/features/[feature]/collections/[feature].registry.ts`.
4. **Implement Services**: `src/features/[feature]/services/[feature].service.ts`.
5. **Implement Procedures**: `src/features/[feature]/procedures/[feature].procedure.ts`. (Register in `src/igniter.context.ts`).
6. **Implement Controllers / Commands**: `src/features/[feature]/controllers/[feature].controller.ts`. (Register in `src/igniter.router.ts`).
7. **Write Integration Tests**: `src/features/[feature]/tests/[action].test.ts`.

---

## 📦 Igniter-js Package Ecosystem Index

The Igniter-js ecosystem is composed of highly decoupled, domain-specific packages. To maintain architectural integrity, you must understand the exact capabilities and interfaces of each package before using it.

Below is the comprehensive index of all available packages. For each package, you will find its description, primary use cases, and a strictly defined list of resources. **You are required to consult these resources—starting with the local references and culminating in the compiled `dist/` types—whenever your task intersects with a package's domain.**

### `@igniter-js/core`
**Description:** The foundational framework package providing routing, Dependency Injection, Context management, and Error mapping.
**Use Cases:** Managing the global Context, creating AppRouters, defining Procedures, extending base errors.
**Resources:**
- **Local References Directory**
  - *Description:* The definitive, up-to-date documentation for the core architecture.
  - *Instructions:*
    - Read `architecture.md` when structuring a new feature.
    - Read `procedure.md` and `controllers.md` when exposing logic.
    - Read `errors.md` when creating domain-specific exceptions.
  - *Path:* `.fractal/skills/igniter-js/references/core/*.md`
- **Compiled Source Types (Source of Truth)**
  - *Description:* The compiled TypeScript declarations for the core framework.
  - *Instructions:* Read ALWAYS when verifying method signatures like `igniter.procedure` or Context injection constraints.
  - *Path:* `node_modules/@igniter-js/core/dist/*.d.ts`
*(Note: Do NOT read the README.md or AGENTS.md in node_modules for `core` as they are outdated.)*

### `@igniter-js/collections`
**Description:** Database abstraction layer for Document-based models, providing robust CRUD operations and query safety.
**Use Cases:** Defining database models, creating Registries, setting up query Views, and implementing Repositories.
**Resources:**
- **Local References Directory**
  - *Description:* High-level patterns and usage examples.
  - *Instructions:*
    - Read `overview.md` and `patterns.md` to understand how Registries and Views work.
    - Read `api.md` and `registry-and-views.md` for implementation details.
  - *Path:* `.fractal/skills/igniter-js/references/collections/*.md`
- **Package Documentation (node_modules)**
  - *Description:* Developer and Agent-specific documentation bundled with the package.
  - *Instructions:* Read `AGENTS.md` for AI-specific contextual rules, and `README.md` for baseline setup.
  - *Path:* `node_modules/@igniter-js/collections/AGENTS.md` and `node_modules/@igniter-js/collections/README.md`
- **Compiled Source Types (Source of Truth)**
  - *Description:* The actual compiled interfaces for the Collections package.
  - *Instructions:* Read ALWAYS when verifying the exact signatures of Registries, models, and adapters.
  - *Path:* `node_modules/@igniter-js/collections/dist/*.d.ts`

### `@igniter-js/agents`
**Description:** LLM orchestration layer providing Toolsets, Chat history management, and Provider adapters.
**Use Cases:** Building AI features, connecting to OpenAI/Anthropic, defining tools for LLMs.
**Resources:**
- **Local References**
  - *Description:* Local markdown guides for implementing agents.
  - *Instructions:*
    - Read `overview.md` and `patterns.md` for architectural concepts.
    - Read `api.md` and `examples.md` for toolset schemas.
  - *Path:* `.fractal/skills/igniter-js/references/agents/*.md`
- **Agent Guidelines**
  - *Description:* Agent-specific constraints bundled with the package.
  - *Instructions:* Read when modifying existing agent logic to ensure compliance with package rules.
  - *Path:* `node_modules/@igniter-js/agents/AGENTS.md` and `node_modules/@igniter-js/agents/README.md`
- **Compiled Source (dist)**
  - *Description:* The TypeScript declarations for Agent classes and Toolsets.
  - *Instructions:* Read ALWAYS to verify exact payload shapes before calling the LLM adapter.
  - *Path:* `node_modules/@igniter-js/agents/dist/*.d.ts`

### `@igniter-js/connectors`
**Description:** Extensible, typed HTTP wrapper for third-party API integrations.
**Use Cases:** Standardized fetch wrappers, API clients, authentication injection.
**Resources:**
- **Local References**
  - *Description:* Guides for connecting to external services safely.
  - *Instructions:* Read `overview.md`, `patterns.md`, and `api.md` before integrating a new third-party service.
  - *Path:* `.fractal/skills/igniter-js/references/connectors/*.md`
- **Package Documentation**
  - *Description:* Setup and agent context instructions.
  - *Instructions:* Read when bootstrapping a new connector.
  - *Path:* `node_modules/@igniter-js/connectors/AGENTS.md` and `README.md`
- **Compiled Source (dist)**
  - *Description:* Interface definitions for connector base classes.
  - *Instructions:* Read ALWAYS when extending a base connector class to ensure strict compliance.
  - *Path:* `node_modules/@igniter-js/connectors/dist/*.d.ts`

### `@igniter-js/bot`
**Description:** Robust abstraction for creating Discord bots, handling commands, and events.
**Use Cases:** Slash commands, Discord event listeners, interaction mappers.
**Resources:**
- **Local References**
  - *Description:* Architectural guidelines for Discord bot features.
  - *Instructions:* Read `overview.md` and `patterns.md` to see the structure of a Discord command.
  - *Path:* `.fractal/skills/igniter-js/references/bot/*.md`
- **Package Documentation**
  - *Description:* Agent context for the Discord bot domain.
  - *Instructions:* Read when troubleshooting Discord API mappings.
  - *Path:* `node_modules/@igniter-js/bot/AGENTS.md` and `README.md`
- **Compiled Source (dist)**
  - *Description:* The Discord API typings extended by Igniter.
  - *Instructions:* Read ALWAYS to ensure the payload format matches Discord's expectations exactly.
  - *Path:* `node_modules/@igniter-js/bot/dist/*.d.ts`

### `@igniter-js/jobs`
**Description:** Asynchronous task processing, queue orchestration, and cron jobs.
**Use Cases:** Sending bulk emails, processing heavy tasks, running scheduled routines.
**Resources:**
- **Local References**
  - *Description:* Patterns for async task handling without blocking HTTP flows.
  - *Instructions:* Read `patterns.md` and `overview.md` before scheduling a new job.
  - *Path:* `.fractal/skills/igniter-js/references/jobs/*.md`
- **Package Documentation**
  - *Description:* Guidelines for safe background execution.
  - *Instructions:* Read when establishing a new worker node or job queue.
  - *Path:* `node_modules/@igniter-js/jobs/AGENTS.md` and `README.md`
- **Compiled Source (dist)**
  - *Description:* The exact typings for the Job payload definitions.
  - *Instructions:* Read ALWAYS to verify job options like retry counts and backoff limits.
  - *Path:* `node_modules/@igniter-js/jobs/dist/*.d.ts`

### Observability (`@igniter-js/logger` & `@igniter-js/telemetry`)
**Description:** Tools for structured logging, metrics, and distributed tracing.
**Use Cases:** Instrumenting code, recording events, error tracking.
**Resources:**
- **Local References**
  - *Description:* Best practices for observability.
  - *Instructions:* Read `logger/patterns.md` and `telemetry/patterns.md` to learn what should be logged.
  - *Path:* `.fractal/skills/igniter-js/references/logger/*.md` and `.fractal/skills/igniter-js/references/telemetry/*.md`
- **Package Documentation**
  - *Description:* Context for structured output.
  - *Instructions:* Read before changing logger transports.
  - *Path:* `node_modules/@igniter-js/logger/AGENTS.md` and `node_modules/@igniter-js/telemetry/AGENTS.md`
- **Compiled Source (dist)**
  - *Description:* Typings for log levels and telemetry spans.
  - *Instructions:* Read ALWAYS when passing complex metadata to the logger to ensure compatibility.
  - *Path:* `node_modules/@igniter-js/logger/dist/*.d.ts` and `node_modules/@igniter-js/telemetry/dist/*.d.ts`

### Utilities (`mail`, `storage`, `store`, `caller`)
**Description:** Specialized helper packages for targeted infrastructure needs.
**Use Cases:** Sending emails (`mail`), saving blobs to S3 (`storage`), Key-Value operations (`store`), and inter-service HTTP calls (`caller`).
**Resources:**
- **Local References**
  - *Description:* General overviews and usage patterns.
  - *Instructions:* Read `overview.md` for the specific utility before invoking it.
  - *Path:* `.fractal/skills/igniter-js/references/{mail,storage,store,caller}/*.md`
- **Package Documentation**
  - *Description:* Detailed agent instructions for handling external utility state.
  - *Instructions:* Read before attempting file uploads, Redis queries, or internal network calls.
  - *Path:* `node_modules/@igniter-js/{mail,storage,store,caller}/AGENTS.md`
- **Compiled Source (dist)**
  - *Description:* The specific typings for the utility methods.
  - *Instructions:* Read ALWAYS to verify required parameters (e.g., SMTP configurations, S3 Bucket payload shapes).
  - *Path:* `node_modules/@igniter-js/{mail,storage,store,caller}/dist/*.d.ts`

### Best Practices & Local Patterns
**Description:** Shared guides for frontend and testing paradigms specific to this repository.
**Use Cases:** Writing tests, building React components with shadcn, automating browser actions.
**Resources:**
- **Local References**
  - *Description:* Project-wide standards that aren't tied to an npm package.
  - *Instructions:*
    - Read `testing.md` before writing ANY `bun:test` code.
    - Read `react.md` and `shadcn.md` before touching the frontend.
  - *Path:* `.fractal/skills/igniter-js/references/patterns/*.md`

---

## 🚫 Strict Anti-Patterns (Zero Tolerance)

1.  **Directly executing logic in Procedures without Services:** Procedures exist to bind Services to the Context.
2.  **Using `any` or `z.any()`:** Always define strict schemas.
3.  **Writing Database Queries in Controllers:** Controllers ONLY map transport data to Procedures.
4.  **Throwing generic `Error`:** Always use custom domain errors from `[feature].errors.ts`.
5.  **Bypassing Dependency Injection:** Never instantiate services directly inside a procedure. 
6.  **Skipping Documentation:** All new constants, schemas, interfaces, classes, and methods MUST have TSDoc comments in English.
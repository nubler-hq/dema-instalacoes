# @igniter-js/bot - Overview

## Purpose & Vision

`@igniter-js/bot` is a modern, type-safe, multi-platform bot framework within the Igniter.js ecosystem. It provides a unified API for building sophisticated chatbots across multiple platforms (Telegram, WhatsApp, Discord).

## Core Goals

- **Platform Freedom**: Build bots for any messaging platform with a unified API. Adapters handle the platform-specific details.
- **Type Safety First**: Full TypeScript inference, Zod validation for command arguments, compile-time checks. No `any` types in the public surface.
- **Excellent DX**: Fluent Builder Pattern, autocomplete, helpful errors. Organized imports for tree-shaking.
- **Extensibility**: Adapters, middlewares, plugins, session stores all pluggable.
- **Production Ready**: Built-in rate limiting, auth, logging, error handling, session management.

## Architectural Principles

1. **Builder Pattern Over Configuration Objects**
   - Fluent API (`IgniterBot.create().withX().build()`) for readability and discoverability.
   - Validation at build time, not runtime.
   - Never mutate configuration objects directly; always chain methods.

2. **Capabilities-First Design**
   - Adapters declare what they support (e.g., text, images, buttons, webhooks).
   - Framework validates actions against capabilities before execution.
   - Graceful degradation for unsupported features.

3. **Session-Aware by Default**
   - Every context (`ctx`) has session access (`ctx.session`).
   - Pluggable storage backends (Memory, Redis, Prisma).
   - Automatic cleanup and expiration.

4. **Middleware Pipeline**
   - Express-like middleware chain (`async (ctx, next) => { ... }`).
   - Clear execution order: pre → middleware → listeners → commands → post.
   - Built-in middlewares for common needs (Rate Limit, Auth, Logging).

5. **Type Safety Everywhere**
   - Zod schemas for adapter configs and command args.
   - TypeScript inference for all APIs.

6. **Feature-Specific Error Handling**
   - Consistent with Igniter.js core principles, expect structured errors and observability.

## When to Use

Use `@igniter-js/bot` when you need to:
- Build a chatbot for Telegram, WhatsApp, Discord, or multiple platforms simultaneously.
- Manage conversational state (sessions) reliably.
- Validate user inputs strictly (via Zod).
- Apply cross-cutting concerns like rate limiting, logging, or authentication to your bot commands.
- Integrate bot functionality seamlessly within a larger Igniter.js application.

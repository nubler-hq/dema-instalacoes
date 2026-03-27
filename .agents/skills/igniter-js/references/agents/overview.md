# @igniter-js/agents - Overview

## Core Concepts

`@igniter-js/agents` provides a production-ready, type-safe AI agent framework for the Igniter.js ecosystem. It bridges the gap between traditional API-first architectures and AI-powered conversational interfaces, enabling complex multi-step tasks, persistent context, and seamless multi-agent orchestration.

### The Problem It Solves
Traditional AI agent frameworks often suffer from:
- **Type Safety Gaps:** Runtime validation of tool inputs/outputs leads to production errors.
- **Statelessness:** Context is lost across requests without robust memory management.
- **Complex Orchestration:** Coordinating multiple specialized agents and their tools is error-prone.
- **Observability Blind Spots:** Understanding agent reasoning and behavior requires manual instrumentation.

### The Solution

| Capability | Description |
|---|---|
| **Type-Safe Tooling** | Zod-based schemas ensure compile-time and runtime validation of tool inputs and outputs. |
| **Persistent Memory** | Adapter-based memory system (In-Memory, File, Redis) maintains conversation history across sessions. |
| **Multi-Agent Orchestration** | Manager pattern coordinates specialized agents, each with dedicated tools and context. |
| **Observability** | Native integration with `@igniter-js/telemetry` for tracing agent reasoning, tool execution, and token usage. |
| **MCP Integration** | Native support for the Model Context Protocol to access external tools and resources. |

## Architecture

The framework is built around three core pillars, adhering to the Igniter.js Immutable Builder Pattern:

1. **Agents (`IgniterAgent`):** The core intelligence unit. Configured with a model, system prompts, memory, and tools.
2. **Tools (`IgniterAgentTool`):** Executable functions that agents can invoke. Defined with strict Zod schemas.
3. **Memory (`IgniterAgentMemory`):** The storage layer for conversation context, allowing agents to "remember" past interactions.

## When to Use

Use `@igniter-js/agents` when building:
- **Conversational APIs:** Customer support bots, internal knowledge assistants.
- **Automated Workflows:** Agents that need to execute multi-step tasks using your backend services (e.g., fetching data, triggering jobs, sending emails).
- **Multi-Agent Systems:** Complex domains requiring specialized agents (e.g., a "Researcher" agent working with a "Writer" agent).
- **Tool-Augmented AI:** Applications where LLMs need deterministic access to databases, APIs, or internal systems.
# @igniter-js/agents - API Reference

## `IgniterAgent`

The core class representing an AI agent.

### `IgniterAgent.create(name: string)`

Creates a new builder for an `IgniterAgent`.

*   **`name`**: A unique identifier for the agent (e.g., `'support-bot'`).

### Builder Methods

*   **`.withModel(model: string)`**: Sets the underlying LLM model (e.g., `'gpt-4o'`, `'claude-3-opus-20240229'`).
*   **`.withSystemPrompt(prompt: string)`**: Defines the agent's persona, instructions, and constraints.
*   **`.withTool(tool: IgniterAgentTool)`**: Registers a tool the agent can use. Can be called multiple times.
*   **`.withMemory(adapter: MemoryAdapter)`**: Attaches a memory adapter for persisting conversation history.
*   **`.withTelemetry(telemetryInstance)`**: Attaches an `@igniter-js/telemetry` instance for tracing and observability.
*   **`.build()`**: Finalizes the configuration and returns the instantiated `IgniterAgent`.

### Instance Methods

*   **`.execute(input: string, options?: ExecuteOptions): Promise<AgentResponse>`**: Runs the agent with the given input string.

---

## `IgniterAgentTool`

Defines an executable function that an agent can call.

### `IgniterAgentTool.create(name: string)`

Creates a new builder for an `IgniterAgentTool`.

*   **`name`**: The name of the tool as it will be exposed to the LLM (e.g., `'get_weather'`). Must usually be alphanumeric with underscores.

### Builder Methods

*   **`.withDescription(description: string)`**: A clear description of what the tool does. The LLM uses this to decide when to call the tool.
*   **`.withInputSchema<T extends z.ZodTypeAny>(schema: T)`**: A Zod schema defining the expected arguments.
*   **`.withHandler(handler: (input: z.infer<T>) => Promise<any>)`**: The actual function to execute when the tool is called. The input is strongly typed based on the schema.
*   **`.build()`**: Finalizes and returns the `IgniterAgentTool`.

---

## `IgniterAgentManager`

Coordinates multiple agents.

### `IgniterAgentManager.create()`

Creates a new builder for an `IgniterAgentManager`.

### Builder Methods

*   **`.withAgent(agent: IgniterAgent)`**: Registers an agent with the manager.
*   **`.build()`**: Finalizes and returns the manager.

---

## Memory Adapters

### `InMemoryMemoryAdapter`

A simple, non-persistent memory adapter suitable for development or single-session interactions.

```typescript
import { InMemoryMemoryAdapter } from '@igniter-js/agents';
const memory = new InMemoryMemoryAdapter();
```
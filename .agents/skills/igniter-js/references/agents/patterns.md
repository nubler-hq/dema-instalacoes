# @igniter-js/agents - Patterns

## Architectural Patterns and Best Practices

When building with `@igniter-js/agents`, adhere to these core Igniter.js patterns to ensure type safety, maintainability, and scalability.

### 1. Immutable Builder Pattern

**Rule:** Never mutate configuration objects directly. Always use the fluent `.withX()` methods and finalize with `.build()`.

**Why:** Ensures configuration is locked before execution, preventing race conditions and unexpected state changes during agent runs.

**Example:**
```typescript
// ✅ Correct
const tool = IgniterAgentTool.create('search')
  .withDescription('Search the database')
  .withInputSchema(z.object({ query: z.string() }))
  .build();

// ❌ Incorrect
const tool = new IgniterAgentTool('search');
tool.description = 'Search the database'; // Avoid direct mutation
```

### 2. Schema-First Design (Zod)

**Rule:** Define Zod schemas for all tool inputs.

**Why:** The framework uses these schemas not just for runtime validation, but to generate the JSON schema definitions sent to the LLM, ensuring the LLM understands exactly what arguments to provide.

**Example:**
```typescript
const createUserTool = IgniterAgentTool.create('create_user')
  .withDescription('Create a new user in the system')
  .withInputSchema(z.object({
    email: z.string().email('Must be a valid email'),
    role: z.enum(['admin', 'user']).default('user')
  }))
  .withHandler(async (input) => {
    // input is fully typed based on the Zod schema
    const { email, role } = input;
    // ...
  })
  .build();
```

### 3. Multi-Agent Orchestration (Manager Pattern)

**Rule:** Use `IgniterAgentManager` when coordinating multiple specialized agents instead of having one monolithic agent with too many tools.

**Why:** Specialized agents have focused system prompts and smaller toolsets, leading to higher accuracy, fewer hallucinations, and better performance.

**Example Pattern:**
```typescript
const researcher = IgniterAgent.create('researcher').withTool(searchTool).build();
const writer = IgniterAgent.create('writer').withTool(publishTool).build();

const manager = IgniterAgentManager.create()
  .withAgent(researcher)
  .withAgent(writer)
  // Define how the manager routes tasks
  .withRoutingStrategy(...)
  .build();
```

### 4. Adapter-Based Memory

**Rule:** Do not hardcode state within the agent. Use `IgniterAgentMemory` adapters.

**Why:** Allows you to easily switch from in-memory (for development/testing) to persistent storage (Redis/Postgres) in production without changing agent logic.

**Example Pattern:**
```typescript
// Dev
const memory = new InMemoryMemoryAdapter();

// Prod (Conceptual)
// const memory = new RedisMemoryAdapter(redisClient);

const agent = IgniterAgent.create('assistant')
    .withMemory(memory)
    .build();
```

### 5. Telemetry Integration

**Rule:** Always wire up telemetry in production.

**Why:** Agent interactions are complex black boxes. Telemetry provides tracing for tool executions, prompt generation, and token usage, which is essential for debugging and cost analysis.
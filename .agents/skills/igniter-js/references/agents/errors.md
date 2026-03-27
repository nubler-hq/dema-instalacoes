# @igniter-js/agents - Errors

## Error Handling Patterns

Following the Igniter.js ecosystem standard, `@igniter-js/agents` provides custom, type-safe errors.

### `AgentErrors`

When building custom tools or memory adapters, you should throw appropriate errors that the framework can catch and handle (e.g., reporting tool failures back to the LLM).

While the specific error codes are defined in the package's internal `errors.ts`, adhere to these principles:

1. **Tool Execution Failures:** If a tool's `handler` throws an error, the agent framework catches it. It will typically format this error and return it to the LLM as the tool execution result. This allows the LLM to understand *why* the tool failed and potentially retry or try a different approach.

   ```typescript
   import { IgniterError } from '@igniter-js/core'; // or appropriate base error

   const strictTool = IgniterAgentTool.create('strict_action')
     .withInputSchema(z.object({ id: z.string() }))
     .withHandler(async ({ id }) => {
        if (!isValid(id)) {
            // Throwing a descriptive error helps the LLM recover
            throw new Error(`Invalid ID: ${id}. Must conform to format XYZ.`);
        }
        return { success: true };
     })
     .build();
   ```

2. **Configuration Errors:** Errors thrown during the `.build()` phase (e.g., missing required configuration) should be treated as fatal application errors and fixed by the developer.

3. **Telemetry:** If telemetry is attached, tool failures and LLM API errors will be automatically logged and traced.
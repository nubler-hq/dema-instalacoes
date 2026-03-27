# @igniter-js/agents - Setup

## Installation

Install the agents package along with its required peer dependencies (zod). If you are using OpenTelemetry, install the telemetry package as well.

```bash
npm install @igniter-js/agents zod
# Or using bun
bun add @igniter-js/agents zod
```

## Configuration

Configuration follows the standard Igniter.js immutable builder pattern.

### Basic Setup

```typescript
import { IgniterAgent } from '@igniter-js/agents';
import { z } from 'zod';

// 1. Initialize the Agent
const agent = IgniterAgent.create('customer-support-agent')
  .withModel('gpt-4o')
  .withSystemPrompt('You are a helpful customer support agent.')
  .build();
```

### Advanced Setup with Memory and Tools

```typescript
import { IgniterAgent, IgniterAgentTool, InMemoryMemoryAdapter } from '@igniter-js/agents';
import { z } from 'zod';

// 1. Define a Tool
const getWeatherTool = IgniterAgentTool.create('get_weather')
  .withDescription('Get the current weather for a location')
  .withInputSchema(z.object({ location: z.string() }))
  .withHandler(async ({ location }) => {
    // Implement tool logic
    return { temperature: 72, condition: 'Sunny', location };
  })
  .build();

// 2. Configure Memory
const memoryAdapter = new InMemoryMemoryAdapter();

// 3. Assemble the Agent
const agent = IgniterAgent.create('advanced-agent')
  .withModel('claude-3-opus-20240229')
  .withSystemPrompt('You are an advanced agent with tools and memory.')
  .withTool(getWeatherTool)
  .withMemory(memoryAdapter)
  .build();
```

## Integrating with telemetry

To enable observability, ensure you attach telemetry when building your agents or managers:

```typescript
import { IgniterAgent } from '@igniter-js/agents';
import { telemetry } from '@igniter-js/telemetry';

const agent = IgniterAgent.create('observable-agent')
    // ... other configuration
    .withTelemetry(telemetry)
    .build();
```
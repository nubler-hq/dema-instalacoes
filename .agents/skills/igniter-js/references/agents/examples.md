# @igniter-js/agents - Examples

## Practical Usage Examples

### 1. Simple Q&A Agent (No Tools, No Memory)

The most basic implementation of an agent.

```typescript
import { IgniterAgent } from '@igniter-js/agents';

async function run() {
  const agent = IgniterAgent.create('simple-bot')
    .withModel('gpt-4o-mini')
    .withSystemPrompt('You are a helpful assistant that answers questions concisely.')
    .build();

  const response = await agent.execute('What is the capital of France?');
  console.log(response.text); // "The capital of France is Paris."
}
```

### 2. Agent with a Custom Tool

Giving the agent the ability to interact with external data.

```typescript
import { IgniterAgent, IgniterAgentTool } from '@igniter-js/agents';
import { z } from 'zod';

// Define the tool
const checkInventoryTool = IgniterAgentTool.create('check_inventory')
  .withDescription('Check the inventory level for a specific product ID.')
  .withInputSchema(z.object({
    productId: z.string().describe('The ID of the product')
  }))
  .withHandler(async ({ productId }) => {
    // In a real app, this would query a database
    const inventory = {
      'PROD-123': 45,
      'PROD-456': 0
    };
    return { stock: inventory[productId] ?? 0 };
  })
  .build();

// Create the agent
const agent = IgniterAgent.create('inventory-bot')
  .withModel('gpt-4o')
  .withSystemPrompt('You are an inventory assistant. Use the check_inventory tool to answer user queries.')
  .withTool(checkInventoryTool)
  .build();

// Execute
// The agent will decide to call the tool, wait for the result, and formulate a final answer.
await agent.execute('Do we have any PROD-123 in stock?');
```

### 3. Agent with Memory (Conversational Context)

Using an adapter to remember previous turns in the conversation.

```typescript
import { IgniterAgent, InMemoryMemoryAdapter } from '@igniter-js/agents';

const memoryAdapter = new InMemoryMemoryAdapter();

const agent = IgniterAgent.create('chat-bot')
  .withModel('gpt-4o')
  .withSystemPrompt('You are a friendly chat companion.')
  .withMemory(memoryAdapter)
  .build();

async function runChat() {
  await agent.execute('Hi, my name is Alice and my favorite color is blue.');

  // The agent remembers the previous input because of the memory adapter
  const response = await agent.execute('What is my favorite color?');
  console.log(response.text); // "Your favorite color is blue, Alice."
}
```

### 4. Integrating with other Igniter.js packages (e.g., Mail)

Agents can use tools that interact with the rest of the Igniter.js ecosystem.

```typescript
import { IgniterAgent, IgniterAgentTool } from '@igniter-js/agents';
import { z } from 'zod';
// Assuming @igniter-js/mail is configured elsewhere
import { mailer } from './mailer-config';

const sendEmailTool = IgniterAgentTool.create('send_email')
  .withDescription('Send an email to a user')
  .withInputSchema(z.object({
    to: z.string().email(),
    subject: z.string(),
    body: z.string()
  }))
  .withHandler(async ({ to, subject, body }) => {
    // Dispatch via @igniter-js/mail
    await mailer.send({ to, subject, text: body });
    return { success: true };
  })
  .build();

const agent = IgniterAgent.create('comm-bot')
    .withModel('gpt-4o')
    .withTool(sendEmailTool)
    .build();
```
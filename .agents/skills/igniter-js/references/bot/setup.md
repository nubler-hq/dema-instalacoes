# @igniter-js/bot - Setup & Configuration

## Installation

```bash
# Using npm
npm install @igniter-js/bot zod

# Using pnpm
pnpm add @igniter-js/bot zod

# Using bun
bun add @igniter-js/bot zod
```

**Requirements:**
- Node.js >= 18
- TypeScript >= 5.0
- Zod >= 3.0

## Import Strategy

The package provides organized imports for better code organization, tree-shaking, and IDE autocomplete.

```typescript
// Main exports (everything in one import - convenient but less optimal for bundling)
import { IgniterBot, telegram, memoryStore, rateLimitMiddleware } from '@igniter-js/bot';

// Organized imports (RECOMMENDED for production projects)
import { telegram, whatsapp, discord } from '@igniter-js/bot/adapters';
import { rateLimitMiddleware, authMiddleware, loggingMiddleware } from '@igniter-js/bot/middlewares';
import { analyticsPlugin } from '@igniter-js/bot/plugins';
import { memoryStore } from '@igniter-js/bot/stores';
import type { BotContext, BotCommand } from '@igniter-js/bot/types';
```

## Basic Configuration (Builder Pattern)

Configuration is done using the `IgniterBot` builder.

```typescript
import { IgniterBot } from '@igniter-js/bot';
import { telegram } from '@igniter-js/bot/adapters';

const bot = IgniterBot
  .create()
  // Recommended: Single handle for all platforms. Auto-generates ID and Name.
  .withHandle('@my_awesome_bot')

  // Optional: Override auto-generated ID/Name
  // .withId('custom-id')
  // .withName('Custom Name')

  // Optional: Add a logger
  // .withLogger(console)

  // Optional: Advanced options
  // .withOptions({ timeout: 30000, retries: 3 })

  // Add platform adapter(s)
  .addAdapter('telegram', telegram({
    token: process.env.TELEGRAM_TOKEN!,
    // handle: '@custom_handle' // Can override global handle per adapter
  }))

  .build();

// Start the bot (registers webhooks, commands, etc.)
await bot.start();
```

## Webhook Integration (e.g., Next.js)

`@igniter-js/bot` is designed to work well in serverless environments via webhooks.

```typescript
// Example: Next.js App Router (app/api/webhook/telegram/route.ts)
import { bot } from '@/lib/bot'; // Your built bot instance

export async function POST(req: Request) {
  // Pass the request to the specific adapter
  return bot.handle('telegram', req);
}
```

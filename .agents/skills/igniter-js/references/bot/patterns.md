# @igniter-js/bot - Architectural Patterns

## Builder Pattern (Fluent API)

The `IgniterBot` configuration heavily relies on the builder pattern. This enforces immutability and provides a clear, chainable API for defining bot behavior.

**Rule:** Never mutate configuration objects directly. Always use the provided `.withX()` and `.addX()` methods.

```typescript
// ✅ Correct
const bot = IgniterBot.create().withHandle('@mybot').build();

// ❌ Incorrect
const bot = new IgniterBot();
bot.handle = '@mybot'; // Anti-pattern
```

## Session Management

Every context (`ctx`) provides access to a session store. Use sessions to manage state across messages. Sessions are automatically cleaned up and expired.

```typescript
import { memoryStore } from '@igniter-js/bot/stores';

const bot = IgniterBot
  .create()
  .withSessionStore(memoryStore()) // or redisStore(), prismaStore()
  .addCommand('survey', {
    name: 'survey',
    async handle(ctx) {
      const session = ctx.session;

      // Initialize or access state
      if (!session.data.step) {
        session.data.step = 1;
        session.data.answers = {};
        await ctx.reply('What is your name?');
        await session.save(); // Crucial: Persist changes
        return;
      }

      // Update state
      if (session.data.step === 1) {
        session.data.answers.name = ctx.message.content?.content;
        session.data.step = 2;
        await ctx.reply('What is your email?');
        await session.save();
        return;
      }

      // Complete survey and clean up
      await ctx.reply('Thank you!');
      await session.delete(); // Crucial: Remove session
    }
  })
  .build();
```

## Middlewares Pipeline

Express-like middleware execution for cross-cutting concerns (logging, auth, rate limiting). Middlewares are executed in the order they are added.

```typescript
import { loggingMiddleware, rateLimitMiddleware } from '@igniter-js/bot/middlewares';

const myCustomMiddleware: Middleware = async (ctx, next) => {
  console.log('Before command execution');
  await next(); // Proceed to the next middleware or command handler
  console.log('After command execution');
};

const bot = IgniterBot
  .create()
  .addMiddleware(loggingMiddleware({ logCommands: true }))
  .addMiddleware(rateLimitMiddleware({ maxRequests: 10, windowMs: 60000 }))
  .addMiddleware(myCustomMiddleware)
  .build();
```

## Capabilities System

Adapters declare what they support (e.g., text, images, editing messages, slash commands). Always check capabilities before attempting platform-specific actions to ensure cross-platform compatibility.

```typescript
.addCommand('feature', {
  name: 'feature',
  async handle(ctx) {
    const adapter = ctx.bot.getAdapter?.(ctx.provider);

    // Check capability before acting
    if (!adapter?.capabilities.content.image) {
      await ctx.reply('This platform does not support images');
      return;
    }

    await ctx.replyWithImage('https://...', 'Caption');
  }
})
```

## Zod Validation

Use Zod for strict validation of command arguments. This guarantees type safety within the command handler.

```typescript
import { z } from 'zod';

.addCommand('remind', {
  name: 'remind',
  description: 'Set a reminder',
  args: z.object({
    time: z.number().positive(),
    message: z.string().min(1)
  }),
  async handle(ctx, args) {
    // `args` is strongly typed as { time: number, message: string }
    await ctx.reply(`Reminder set for ${args.time} mins: ${args.message}`);
  }
})
```

## Plugin Architecture

Plugins package commands, middlewares, and hooks into reusable modules.

```typescript
import { analyticsPlugin } from '@igniter-js/bot/plugins';

const bot = IgniterBot
  .create()
  .usePlugin(analyticsPlugin({
    trackMessages: true,
    trackCommands: true
  }))
  .build();
```

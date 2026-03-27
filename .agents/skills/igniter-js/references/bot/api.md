# @igniter-js/bot - API Reference

## IgniterBot Builder

| Method | Description |
|--------|-------------|
| `.create()` | Creates new builder instance |
| `.withHandle(handle)` | Sets global bot handle (auto-generates ID and name) |
| `.withId(id)` | Sets bot ID (required if handle not used) |
| `.withName(name)` | Sets bot name (required if handle not used) |
| `.withLogger(logger)` | Configures logger |
| `.withSessionStore(store)` | Configures session storage (e.g., `memoryStore()`) |
| `.withOptions(options)` | Advanced options (`timeout`, `retries`, `autoRegisterCommands`) |
| `.addAdapter(key, adapter)` | Adds a single platform adapter |
| `.addAdapters(adapters)` | Adds multiple platform adapters |
| `.addCommand(name, cmd)` | Adds a single command definition |
| `.addCommands(cmds)` | Adds multiple command definitions |
| `.addCommandGroup(prefix, cmds)` | Adds a prefixed command group |
| `.addMiddleware(middleware)` | Adds a middleware function |
| `.addMiddlewares(middlewares)`| Adds multiple middleware functions |
| `.usePlugin(plugin)` | Loads a plugin |
| `.onMessage(handler)` | Subscribes to message events |
| `.onError(handler)` | Subscribes to error events |
| `.onCommand(handler)` | Subscribes to command execution events |
| `.onStart(handler)` | Hook executed when the bot starts |
| `.build()` | Finalizes the configuration and returns the bot instance |

## Bot Instance Methods

| Method | Description |
|--------|-------------|
| `start()` | Initialize bot (registers webhooks, commands, etc.) |
| `handle(provider, req)` | Handle incoming webhook request for a specific provider |
| `send(params)` | Send a message via adapter manually |
| `registerAdapter(k, v)` | Add an adapter at runtime |
| `registerCommand(n, v)` | Add a command at runtime |
| `use(middleware)` | Add middleware at runtime |
| `on(event, handler)` | Subscribe to an event |
| `emit(event, ctx)` | Emit an event manually |

## Context (`BotContext`)

The `ctx` object passed to handlers and middlewares contains event data and helper methods.

| Property / Method | Description |
|-------------------|-------------|
| `ctx.event` | Event type ('message', 'error', 'start') |
| `ctx.provider` | Platform name ('telegram', 'whatsapp', 'discord') |
| `ctx.channel` | Channel information (id, name, isGroup) |
| `ctx.message` | Message data (content, author, etc.) |
| `ctx.session` | Session helper (`data`, `save()`, `delete()`, `update()`) |
| `ctx.bot` | Reference to the bot instance |
| `ctx.reply(text)` | Send a simple text reply |
| `ctx.replyWithButtons(text, btns)` | Send an interactive reply |
| `ctx.replyWithImage(url, cap)` | Send an image reply |
| `ctx.replyWithDocument(file, cap)` | Send a document reply |
| `ctx.editMessage(id, content)` | Edit a message (if supported by adapter) |
| `ctx.deleteMessage(id)` | Delete a message (if supported by adapter) |
| `ctx.react(emoji)` | Add a reaction (if supported by adapter) |

## Adapters

Available via `@igniter-js/bot/adapters`.

- **`telegram({ token, webhook?, handle? })`**: Telegram Bot API adapter.
- **`whatsapp({ token, phone, handle? })`**: WhatsApp Cloud API adapter.
- **`discord({ token, applicationId, publicKey?, handle? })`**: Discord Interactions API adapter.

## Middlewares

Available via `@igniter-js/bot/middlewares`.

- **`rateLimitMiddleware(config)`**: Limits request rate per user/channel. Presets: `rateLimitPresets.moderate()`.
- **`authMiddleware(config)`**: Restricts access to allowed users. Presets: `authPresets.adminsOnly([])`, `authPresets.privateOnly()`, `authPresets.groupsOnly()`.
- **`loggingMiddleware(config)`**: Logs messages, commands, and metrics. Presets: `loggingPresets.production()`, `loggingPresets.debug()`.

## Stores

Available via `@igniter-js/bot/stores`.

- **`memoryStore()`**: In-memory session storage (development only).
- *(Redis and Prisma stores planned)*.

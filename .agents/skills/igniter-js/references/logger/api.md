# Logger API Reference

The `@igniter-js/logger` API is divided into two main parts: the `Builder API` for configuring the logger, and the `Manager API` for the resulting logger instance.

## Types & Enums

### `IgniterLogLevel` (Enum)
Defines the standard logging levels available.

*   `IgniterLogLevel.Fatal` ("fatal")
*   `IgniterLogLevel.Error` ("error")
*   `IgniterLogLevel.Warn` ("warn")
*   `IgniterLogLevel.Info` ("info")
*   `IgniterLogLevel.Debug` ("debug")
*   `IgniterLogLevel.Trace` ("trace")

### `IgniterTransportTarget` (Type)
Specifies the type of transport.

```typescript
type IgniterTransportTarget = "console" | "file" | "http" | string;
```

### Transport Options

#### `ConsoleTransportOptions`
| Option | Type | Description | Default |
| :--- | :--- | :--- | :--- |
| `colorize` | `boolean` | Enable ANSI colorization | `true` |
| `pretty` | `boolean` | Enable human-readable formatting over raw JSON | `true` |
| `destination` | `string` | Target output stream (e.g., "stdout", "stderr") | `"stdout"` |

#### `FileTransportOptions`
| Option | Type | Description |
| :--- | :--- | :--- |
| `path` | `string` | Absolute or relative path to the output log file |
| `mkdir` | `boolean` | Automatically create the directory structure if it doesn't exist |
| `rotation` | `boolean \| object` | Configuration for file rotation. If true, uses defaults. |
| `rotation.maxSizeBytes` | `number` | Maximum size in bytes before rotating the file |
| `rotation.maxFiles` | `number` | Maximum number of rotated files to retain |
| `rotation.intervalMs` | `number` | Time interval in milliseconds for rotation |

#### `HttpTransportOptions`
| Option | Type | Description |
| :--- | :--- | :--- |
| `url` | `string` | The remote ingest endpoint URL |
| `headers` | `Record<string, string>` | Custom headers for the HTTP request |
| `batchSize` | `number` | Number of log entries to batch before sending |
| `timeoutMs` | `number` | Request timeout in milliseconds |

---

## Builder API (`IgniterLogger`)

The Builder API is used to construct a fully configured logger instance.

### `IgniterLogger.create()`
*   **Returns:** `IgniterLogger` (Builder Instance)
*   **Description:** Starts the logger configuration process.

### `.withLevel(level: IgniterLogLevel)`
*   **Arguments:** `level` (IgniterLogLevel) - The minimum log level to record.
*   **Returns:** `this`
*   **Description:** Sets the global minimum log level.

### `.withAppName(appName: string)`
*   **Arguments:** `appName` (string)
*   **Returns:** `this`
*   **Description:** Automatically includes an `app_name` field in all log entries.

### `.withComponent(component: string)`
*   **Arguments:** `component` (string)
*   **Returns:** `this`
*   **Description:** Automatically includes a `component` field in all log entries for the root logger.

### `.withContext(context: Record<string, unknown>)`
*   **Arguments:** `context` (Object) - Key-value pairs to include in every log.
*   **Returns:** `this`
*   **Description:** Defines a base context object that will be merged into every log entry.

### `.addTransport(transport: IgniterTransportConfig)`
*   **Arguments:** `transport` (Object) - An object containing `target` and `options`.
*   **Returns:** `this`
*   **Description:** Adds a logging destination. You can call this multiple times to log to multiple outputs simultaneously (e.g., console and file).

### `.defineScopes<T>()`
*   **Generic:** `T` (Type Definition) - An interface defining the exact shape of context required when creating a child logger.
*   **Returns:** `this`
*   **Description:** Enforces strict typing for child loggers. The keys of `T` represent the component names, and the values are the required context objects.

### `.build()`
*   **Returns:** `IgniterLoggerManager`
*   **Description:** Finalizes the configuration and returns the usable logger instance.

---

## Manager API (`IgniterLoggerManager`)

The Manager API provides the methods for recording logs and managing the logger instance at runtime.

### Standard Logging Methods

All standard logging methods share the same signature:

*   **`fatal(message: string, contextOrError?: Record<string, unknown> | Error)`**
*   **`error(message: string, contextOrError?: Record<string, unknown> | Error)`**
*   **`warn(message: string, ...args: any[])`**
*   **`info(message: string, ...args: any[])`**
*   **`debug(message: string, ...args: any[])`**
*   **`trace(message: string, ...args: any[])`**

*   **Arguments:**
    *   `message` (string) - The main log message.
    *   `contextOrError` (Object | Error) - Additional context data or an Error object to be serialized.
    *   `...args` (any[]) - Additional data to attach to the log entry.

### Custom Formatting Methods

*   **`success(message: string, ...args: any[])`**
    *   *Description:* Logs an informational message, often formatted with a green checkmark in pretty console output.

*   **`group(name?: string)`**
    *   *Description:* Starts a visually grouped block of logs in the console.

*   **`groupEnd()`**
    *   *Description:* Ends the current visual group.

*   **`separator()`**
    *   *Description:* Prints a visual separator line in the console.

### Child Logger Management

*   **`child(componentName: string, context?: Record<string, unknown>)`**
    *   *Arguments:*
        *   `componentName` (string) - The name of the child component.
        *   `context` (Object) - Specific context data that will be automatically prepended to all logs generated by this child.
    *   *Returns:* A new `IgniterLoggerManager` instance scoped to this child.
    *   *Description:* Creates an isolated child logger that inherits transports and configuration but has its own dedicated context and component identifier.

### Runtime Controls

*   **`setLevel(level: IgniterLogLevel)`**
    *   *Arguments:* `level` (IgniterLogLevel) - The new log level.
    *   *Description:* Changes the active log level dynamically at runtime without needing to rebuild the logger.

*   **`setAppName(appName: string)`**
    *   *Arguments:* `appName` (string) - The new application name.
    *   *Description:* Updates the application name attached to future logs. (Note: Does not retroactively update the base Pino configuration).

*   **`setComponent(componentName: string)`**
    *   *Arguments:* `componentName` (string) - The new component name.
    *   *Description:* Updates the component identifier for this specific logger instance.

*   **`flush(): Promise<void>`**
    *   *Returns:* `Promise<void>`
    *   *Description:* Forces all buffered logs to be written immediately. Critical to call before application exit or during unhandled exceptions to prevent log loss.
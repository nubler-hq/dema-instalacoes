# API Reference

This document details the public API for configuring and using `@igniter-js/collections`.

## `IgniterCollections` (Manager Builder)

The entry point for configuring the collections ORM.

| Method | Parameters | Returns | Description |
| :--- | :--- | :--- | :--- |
| `create()` | None | `Builder` | Static factory for a new builder instance. |
| `withAdapter(adapter)` | `IgniterCollectionAdapter` | `this` | **Required.** Sets the storage adapter (e.g., `BunFsAdapter`). |
| `withBasePath(path)` | `string | string[]` | `this` | Sets the root path(s) for collection resolution. |
| `withSchemaRegistry(path, options?)` | `string | string[]`, `{ autoWatch?: boolean }` | `this` | Configures dynamic schema loading from glob patterns. |
| `withTelemetry(telemetry)` | `IgniterTelemetryManager` | `this` | Connects to `@igniter-js/telemetry`. |
| `withLogger(logger)` | `IgniterLogger` | `this` | Sets a custom logger. |
| `withGlobalHooks(hooks)` | `IgniterCollectionModelHooks` | `this` | Applies hooks to all collections managed by this instance. |
| `addCollection(collection)` | `Definition` | `Builder<T + C>` | Registers a manually defined collection. Updates type inference. |
| `build()` | None | `Promise<Manager<T>>` | Validates configuration, initializes the registry, and returns the Proxied Manager. |

## `IgniterCollectionModel` (Collection Builder)

Used to manually define a collection schema and behavior.

| Method | Parameters | Returns | Description |
| :--- | :--- | :--- | :--- |
| `create(name)` | `string` | `Builder` | Starts building a collection. |
| `withPatterns(patterns)` | `string[]` | `this` | Sets file patterns for resolution (e.g., `['posts/{id}.md']`). |
| `withTemplate(path)` | `string` | `this` | Sets a Handlebars template path (e.g., `.md`, `.json`, `.yaml`). |
| `withSchema(schema)` | `StandardSchemaV1` (e.g., Zod) | `this` | Sets validation schema and infers Document type. |
| `withViews(views)` | `ViewDefinition[]` | `this` | Registers declarative data views. |
| `onCreated(hook)` | `(ctx) => T | false | Promise<T | false>` | `this` | Hook before creation write. |
| `onUpdated(hook)` | `(ctx) => T | false | Promise<T | false>` | `this` | Hook after merge, before update write. |
| `onDeleted(hook)` | `(ctx) => boolean | Promise<boolean>` | `this` | Hook before deletion. Return `false` to abort. |
| `onRead(hook)` | `(ctx) => T | false | Promise<T | false>` | `this` | Hook after a single document read. |
| `onList(hook)` | `(ctx) => T[] | false | Promise<T[] | false>`| `this` | Hook after bulk fetch and filtering. |
| `build()` | None | `Definition` | Returns the immutable collection definition. |

| Method | Parameters | Returns | Description |
| :--- | :--- | :--- | :--- |
| `create(name)` | `string` | `Builder` | Starts building a collection. |
| `withPatterns(patterns)` | `string[]` | `this` | Sets file patterns for resolution (e.g., `['posts/{id}.md']`). |
| `withTemplate(path)` | `string` | `this` | Sets a Handlebars template path (e.g., `.md`, `.json`, `.yaml`). |
| `withSchema(schema)` | `StandardSchemaV1` (e.g., Zod) | `this` | Sets validation schema and infers Document type. |
| `withViews(views)` | `ViewDefinition[]` | `this` | Registers declarative data views. |
| `onCreated(hook)` | `Hook` | `this` | Hook before creation write. |
| `onUpdated(hook)` | `Hook` | `this` | Hook after merge, before update write. |
| `onDeleted(hook)` | `Hook` | `this` | Hook before deletion. |
| `onRead(hook)` | `Hook` | `this` | Hook after a single document read. |
| `onList(hook)` | `Hook` | `this` | Hook after bulk fetch and filtering. |
| `collections.create(name)`| `string` | `SubBuilder` | Starts building a **Sub-Collection** nested within this model. |
| `build()` | None | `Definition` | Returns the immutable collection definition. |

## `CollectionManager` (CRUD API)

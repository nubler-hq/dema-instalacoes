# Schema Registry & Declarative Views Deep Dive

This document serves as the absolute source of truth for understanding how the `@igniter-js/collections` package implements **Runtime Schema Discovery** (Schema Registry) and **Server-Driven UI** (Declarative Views).

---

## 1. Schema Registry (Runtime Discovery)

The Schema Registry allows applications to dynamically define collections, schemas, hooks, and views using JSON files instead of hardcoding them in TypeScript. This decoupled approach is perfect for plugin architectures or headless CMS systems.

### Configuration & Data Flow

When `.withSchemaRegistry()` is called on the `IgniterCollectionsBuilder`:
1.  **Discovery:** Scans the provided glob patterns (e.g., `.content/schemas/*.schema.json`) for JSON files.
2.  **Parsing:** Validates the structure of the JSON against `IgniterCollectionSchemaFile`.
3.  **Auto-Prefixing:** If identical `collectionName`s exist in different folders, it prefixes them with their parent folder name (e.g., `blog:posts` vs `forum:posts`). This enforces Domain Isolation.
4.  **Hook Resolution:** Reads the `"hooks"` object and dynamically imports `.ts/.js` files at runtime. The exported function must match the hook name (e.g., `export const onCreated = ...`).
5.  **Proxy Update:** Registers the collection in the internal Manager Map, updating the dynamic proxy so `manager.collectionName` becomes available immediately.
6.  **Watching (Optional):** If `autoWatch: true`, it sets up an FS watcher to auto-reload the manager when a `.schema.json` is modified.

### `IgniterCollectionSchemaFile` Interface
*Source: `node_modules/@igniter-js/collections/dist/index.d.ts:1370`*

```typescript
interface IgniterCollectionSchemaFile {
    collectionName: string; // The property name used to access it on the manager proxy
    patterns: string[]; // Glob patterns (e.g., ["posts/{id}.md"])
    template?: string; // Path to a Handlebars template file
    schema?: IgniterCollectionSchemaDefinition; // StandardSchemaV1 mapping
    hooks?: {
        onCreated?: string; // Path to a .ts/.js file exporting `onCreated`
        onUpdated?: string; // Path to a .ts/.js file exporting `onUpdated`
        onDeleted?: string; // Path to a .ts/.js file exporting `onDeleted`
        onRead?: string;    // Path to a .ts/.js file exporting `onRead`
        onList?: string;    // Path to a .ts/.js file exporting `onList`
    };
    views?: IgniterCollectionViewDefinition[]; // Declarative Server-Driven UI
}
```

### Manager API
*Source: `node_modules/@igniter-js/collections/dist/index.d.ts:1656`*

Once built, the Manager exposes these Registry-specific methods:
*   `await manager.refreshSchemas()`: Purges cache and reloads all JSONs and hooks from disk.
*   `await manager.startSchemaWatching(callback?)`: Starts the FS watcher on `registryPath`. Optional callback receives `(event, collectionName)`.
*   `manager.stopSchemaWatching()`: Halts the watcher.
*   `manager.isSchemaWatching()`: Returns boolean.
*   `manager.getSchemaRegistry()`: Returns the inner `IgniterCollectionSchemaRegistry` instance.

---

## 2. Declarative Views (Server-Driven UI)

Views provide a complete pipeline for transforming raw collection data into a structure ready to be consumed by frontends using the `json-render` engine.

### View Execution Flow
When `await manager.collection.views.render('dashboard')` is called:
1.  **Query Execution:** Fetches data using the `defaultQuery` (Prisma-like: `where`, `orderBy`).
2.  **`getData` Hook (Optional):** If defined, calls this hook, allowing you to override the fetched items, enrich them with external APIs, or inject `extra` data.
3.  **Stats Calculation:** Computes the `stats` (count, sum, avg, min, max) declared in the view definition.
4.  **Transforms Application:** Executes in-memory mutations like `group`, `flatten`, or `pivot` on the fetched array.
5.  **Response Construction:** Packages the UI `tree`, the `items`, the `stats`, and `extra` data into a single `IgniterCollectionViewRenderResult`.

### Interfaces Deep Dive

#### `IgniterCollectionViewDefinition`
*Source: `node_modules/@igniter-js/collections/dist/index.d.ts:649`*

```typescript
interface IgniterCollectionViewDefinition {
    name: string;
    title: string;
    description?: string;
    tree: IgniterCollectionViewNode[]; // The UI structure
    defaultQuery?: IgniterCollectionViewQuery; // Base fetch query
    stats?: IgniterCollectionViewStats; // Declarative aggregations
    getData?: string | IgniterCollectionViewDataHook; // Path to hook file or function
    transforms?: IgniterCollectionViewTransform[]; // Memory mutations
    actions?: Record<string, IgniterCollectionViewAction>; // Interactive actions
}
```

#### The UI Component Tree (`IgniterCollectionViewNode`)
*Source: `node_modules/@igniter-js/collections/dist/index.d.ts:722`*

```typescript
interface IgniterCollectionViewNode {
    component: string; // "Table", "Metric", "Chart", etc. (must match json-render dictionary)
    props?: Record<string, any>; // Component props
    valuePath?: string; // RFC 6901 JSON Pointer (e.g., "/stats/totalCount") mapping data to the component
    children?: IgniterCollectionViewNode[];
}
```

#### Transforms (`IgniterCollectionViewTransform`)
*Source: `node_modules/@igniter-js/collections/dist/index.d.ts:767`*

```typescript
interface IgniterCollectionViewTransform {
    type: 'group' | 'flatten' | 'pivot';
    field?: string; // The object key to transform against
    config?: Record<string, any>; // Type-specific configurations
}
```

#### Stats (`IgniterCollectionViewStats`)
*Source: `node_modules/@igniter-js/collections/dist/index.d.ts:744`*

```typescript
interface IgniterCollectionViewStats {
    [statName: string]: IgniterCollectionViewStatDefinition;
}

// Definition Types:
// Count: { type: 'count', where?: Record<string, any> }
// Aggregate: { type: 'sum' | 'avg' | 'min' | 'max', field: string, where?: Record<string, any> }
// Custom: { type: 'custom', expression: string }
```

#### Actions (`IgniterCollectionViewAction`)
*Source: `node_modules/@igniter-js/collections/dist/index.d.ts:673`*

Actions map UI interactions to backend endpoints safely.
```typescript
interface IgniterCollectionViewAction {
    params?: StandardSchemaV1; // Zod validation for incoming request payload
    description: string;
    handler: string | IgniterCollectionViewActionHandler; // Hook file path or function
    confirm?: { // Frontend modal configuration
        title: string;
        message: string;
        variant?: 'danger' | 'warning' | 'info';
    };
}

// Handler Result (IgniterCollectionViewActionResult):
// { success: boolean, data?: any, error?: string, updates?: Record<string, any> }
// 'updates' uses JSON Pointers to tell the frontend exactly what to surgically update in its state without a full reload.
```

## 🏁 Standard: Source References Summary

Whenever you need the raw implementation logic to trace bugs or understand edge cases:
- `node_modules/@igniter-js/collections/dist/index.d.ts:1370` | **IgniterCollectionSchemaFile**
- `node_modules/@igniter-js/collections/dist/index.d.ts:1457` | **IgniterCollectionSchemaRegistry** implementation details.
- `node_modules/@igniter-js/collections/dist/index.d.ts:649` | **IgniterCollectionViewDefinition**
- `node_modules/@igniter-js/collections/dist/index.d.ts:1816` | **IgniterCollectionViewManager** implementation details.

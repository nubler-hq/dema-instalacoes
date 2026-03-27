# Architectural Patterns & Best Practices

Understanding the architecture of `@igniter-js/collections` is crucial for building robust, scalable applications.

## 1. The Immutable Builder Pattern

All configuration is performed using immutable builders (e.g., `IgniterCollections.create()`, `IgniterCollectionModel.create()`).

**Why?**
This prevents accidental state leakage. If you need multiple managers (e.g., in a multi-tenant setup) that share a base configuration but differ slightly, you can reuse an intermediate builder safely.

**Rule:** Never mutate configuration objects directly. Always chain `.with*()` methods.

```typescript
// ✅ Correct
const baseBuilder = IgniterCollections.create().withAdapter(new BunFsAdapter());
const tenantA = await baseBuilder.withBasePath('./tenant-a').build();
const tenantB = await baseBuilder.withBasePath('./tenant-b').build();

// ❌ Incorrect
// Do not try to instantiate core classes directly if a builder exists.
```

## 2. Dynamic Collection Proxy

The `IgniterCollectionManager` uses a JavaScript `Proxy`. This enables type-safe, property-based access to collections.

Instead of writing:
`await manager.collection('posts').findMany()`

You write:
`await manager.posts.findMany()`

The proxy intercepts the `get` call, checks if 'posts' exists in the registered collection managers, and returns it. TypeScript intersection types ensure your IDE knows exactly what `.posts` returns based on your schemas.

**Flattened Document API:** All fields defined in your schema are merged directly into the root of the document object (e.g., `doc.title`). There is no longer a `.data` wrapper for accessing frontmatter or template variables.

## 3. Runtime Schema Discovery (The Registry)

The `IgniterCollectionSchemaRegistry` allows you to define collections using JSON files.

*   **Decoupling:** Collection definitions live alongside content or plugins, not hardcoded in the main app.
*   **Auto-Prefixing:** If schemas with the same name exist in different folders, the registry prefixes them with the parent folder name (e.g., `blog:posts`).
*   **Watching:** In Bun, the registry can watch the filesystem and auto-refresh the manager on schema changes.
*   **Hooks via Modules:** Schemas can specify hook files (`"hooks": { "onCreated": "./hooks/timestamp.ts" }`). The registry dynamically imports these modules at runtime.
*   **Schema Format:** Collections defined via JSON schemas use a `patterns: string[]` field for flexible path resolution.

## 4. Lifecycle Hooks

Hooks allow you to intercept and modify operations. Keep hooks lean and fast to avoid blocking CRUD operations.

| Hook | When it runs | Typical Use Case |
| :--- | :--- | :--- |
| `onCreated` | After creation, before write | Adding `createdAt` timestamps, generating slugs. |
| `onUpdated` | After merge, before write | Updating `updatedAt` timestamps, preventing state regression. |
| `onDeleted` | Before write | Emitting audit logs, preventing deletion of protected documents. Return `false` to cancel. |
| `onRead` | After single fetch | Enriching data, decrypting fields. |
| `onList` | After filtering multiple docs | Normalizing data for search, removing expired content. |
| `onRefresh` | After schema registry reload | Custom logic for dynamic schema updates. |

## 5. Views System (Data Transformation)
Instead of manually shaping data after fetching, use declarative Views.

Views apply a pipeline:
1.  **Query:** Base `findMany` operation.
2.  **JSON Pointer:** Uses RFC 6901 for precise path resolution.
3.  **`getData` Hook:** (Optional) Merge external data.
4.  **Transforms:** E.g., `group` (by author), `flatten` (nested objects to dot notation), `pivot` (long to wide).
5.  **Stats:** Calculate aggregations (count, sum, avg) on the transformed data.

## 6. Full-Text Search (FTS) Engine

The `findMany` operation includes a native FTS engine that operates directly on the collection data.

*   **Relevance Scoring:** Automatically computes a score for each document based on term matches.
*   **Fuzzy Matching:** Built-in Levenshtein distance support for typo-tolerant queries.
*   **Field Weighting:** Ability to specify which fields are more important for the search result.
*   **Metadata Enrichment:** Results are enriched with a `_search` property containing:
    *   `score`: A relevance score (0-1).
    *   `matches`: Detailed match information for each field.

## 7. Templating System (Handlebars)

Collections support declarative templates for generating document content.

*   **Multi-Format:** Templates can be any text format (`markdown`, `yaml`, `json`).
*   **Handlebars Engine:** Templates use Handlebars syntax for dynamic data injection.
*   **Schema Integration:** The collection's schema can define a `content` object representing the template variables.
*   **Automatic Rendering:** During `create` or `update`, the `content` object is automatically rendered through the template before persistence.
*   **Transparent Reads:** Upon retrieval, the `content` property always contains the fully rendered string.

## 8. Path & ID Resolution (Debugging)

The Igniter Collections ORM uses a deterministic approach to map filenames to document IDs and vice-versa.

*   **ID Extraction:** If a pattern is `posts/{id}.md`, a file at `posts/my-first-post.md` will have the ID `my-first-post`.
*   **Path Resolution:** When creating a document, the ORM picks the "best matching" pattern based on the provided variables (e.g., if you pass `category: 'news'` and have a pattern `posts/{category}/{id}.md`, it will use that).
*   **Hidden Files:** Ensure `dot: true` is used if your content lives in folders like `.data/`.

### View Actions Deep Dive
- **`flatten`:** Collapses nested objects into dot-notation keys (e.g., `meta.title`).
- **`pivot`:** Reorganizes data from long to wide format using index, column, and value.

**Source References**
- `node_modules/@igniter-js/collections/dist/index.js:1133` | **renderContent** | Handlebars implementation for document hydration.
- `node_modules/@igniter-js/collections/dist/index.js:1780` | **applySearch** | FTS engine and Levenshtein distance logic.
- `node_modules/@igniter-js/collections/AGENTS.md:500` | **Operational Flow** | Detailed mapping of findMany and delete pipelines.

## Best Practices & Anti-Patterns

| Practice | Why |
| :--- | :--- |
| **✅ Use `BunFsAdapter` in Bun** | Native performance utilizing Bun's optimized I/O. |
| **✅ Use `dot: true`** | Ensure collections in hidden folders (e.g., `.content/`) are discovered. |
| **✅ Let manager generate IDs** | Avoids conflicts unless you have a specific deterministic ID strategy. |
| **✅ Use Hooks for Metadata** | DRY principle for timestamps or calculated fields. |
| **✅ Type the Manager** | Always use `IgniterCollectionsAccessor<TCollections>` for full IDE support. |
| **❌ Heavy Hooks** | Blocking operations in `onCreated` or `onUpdated` slows down the entire pipeline. |
| **❌ Direct File Manipulation** | Bypasses validation, hooks, and telemetry. Always use the Manager API. |

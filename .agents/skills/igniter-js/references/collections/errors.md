# Error Handling

`@igniter-js/collections` uses a strongly typed error system. All domain-specific errors inherit from a base class (typically `IgniterCollectionError`) and include a specific `code` and detailed contextual metadata.

This ensures you can reliably catch and handle expected failures.

## Standard Error Structure

When catching errors, inspect the `code` and `details` properties.

```typescript
import { IgniterCollectionErrorCodes } from '@igniter-js/collections/errors';

try {
  await manager.posts.create({ data: { title: 123 } }); // Invalid type
} catch (error) {
  if (error.code === IgniterCollectionErrorCodes.VALIDATION_ERROR) {
    console.error("Schema validation failed:", error.details.validation.errors);
  }
}
```

## Exhaustive Error Code Library

### `ADAPTER_REQUIRED`
*   **Context:** Thrown during `IgniterCollections.create().build()`.
*   **Cause:** You forgot to specify a storage adapter.
*   **Solution:** Chain `.withAdapter(new NodeFsAdapter())` or equivalent before calling `.build()`.

### `VALIDATION_ERROR`
*   **Context:** Thrown during `create` or `update` operations, or when reading invalid data from storage.
*   **Cause:** The provided data (or data on disk) does not satisfy the Zod/StandardSchemaV1 schema defined for the collection.
*   **Solution:** Inspect `error.details.validation.errors` for exactly which fields failed. Fix the data payload or correct the malformed file on disk.

### `HOOK_CANCELLED`
*   **Context:** Thrown during any CRUD operation.
*   **Cause:** A lifecycle hook (e.g., `onDeleted`, `onCreated`) explicitly returned `false` or threw an error to abort the operation.
*   **Solution:** Review the business logic within your hook implementations. This is often an expected result of a business rule validation.

### `SCHEMA_NOT_FOUND`
*   **Context:** Thrown when accessing a collection property (e.g., `manager.missingCollection.findMany()`).
*   **Cause:** The collection name requested is not registered in the manager.
*   **Solution:** Ensure you called `.addCollection()` or that your Schema Registry glob pattern correctly matched the intended `.schema.json` file.

### `VIEW_NOT_FOUND`
*   **Context:** Thrown during `views.render('viewName')`.
*   **Cause:** Requesting to render a view that has not been defined on the collection.
*   **Solution:** Verify the view name exists in the collection definition (use `manager.definitions()`).

### `MALFORMED_FRONTMATTER`
*   **Context:** Thrown during document read by a FileSystem adapter.
*   **Cause:** The Markdown file has invalid YAML or JSON in its frontmatter section, preventing it from being parsed.
*   **Solution:** Manually inspect and correct the frontmatter syntax in the problematic file.

### `ADAPTER_PERMISSION_DENIED`
*   **Context:** Thrown during `write` or `delete` by storage adapters.
*   **Cause:** The running process lacks sufficient filesystem permissions, or the S3/Redis client lacks the required IAM/ACL roles.
*   **Solution:** Verify file permissions (e.g., `chmod`) or check the configuration of your external storage provider credentials.

### `ADAPTER_READ_ERROR` / `ADAPTER_WRITE_ERROR`
*   **Context:** General low-level storage failures.
*   **Cause:** Network issues (S3/Redis), disk full, or file locks.
*   **Solution:** Check the underlying system logs. Telemetry events will also log `ctx.error.code` for deeper adapter-specific inspection.

**Source References**
- `node_modules/@igniter-js/collections/dist/index.d.ts:17` | **Error Codes** | Complete list of `IGNITER_COLLECTION_ERROR_CODES`.
- `node_modules/@igniter-js/collections/dist/index.js:17` | **Error Class** | Implementation of `IgniterCollectionError` and status code mapping.

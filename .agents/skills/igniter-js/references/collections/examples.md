# Practical Examples

This document provides real-world scenarios for using `@igniter-js/collections`.

## 1. Multi-Environment Blog

Switch adapters based on the environment without changing application logic.

```typescript
import { IgniterCollections } from '@igniter-js/collections';
import { BunFsAdapter, BunS3Adapter } from '@igniter-js/collections/adapters';
import { z } from 'zod';
import { IgniterCollectionModel } from '@igniter-js/collections';

const isProd = process.env.NODE_ENV === 'production';

const adapter = isProd
  ? new BunS3Adapter({ bucket: 'my-blog-content' })
  : new BunFsAdapter();

const posts = IgniterCollectionModel.create('posts')
  .withPatterns(['posts/{id}.md'])
  .withSchema(z.object({ title: z.string(), body: z.string() }))
  .build();

const manager = await IgniterCollections.create()
  .withAdapter(adapter)
  .withBasePath('./content')
  .addCollection(posts)
  .build();

// Logic remains identical regardless of the adapter
const allPosts = await manager.posts.findMany();
```

## 2. Using Hooks for Audit Logging

Automatically log every deletion to a separate collection.

```typescript
import { IgniterCollectionModel } from '@igniter-js/collections';
import { z } from 'zod';

const auditLog = IgniterCollectionModel.create('audit')
  .withSchema(z.object({ action: z.string(), resourceId: z.string(), timestamp: z.number() }))
  .build();

const secrets = IgniterCollectionModel.create('secrets')
  .withSchema(z.object({ key: z.string(), value: z.string() }))
  .onDeleted(async ({ value, manager }) => {
    // Write to audit log before allowing deletion
    await manager.audit.create({
      data: {
        action: 'DELETED_SECRET',
        resourceId: value.id,
        timestamp: Date.now()
      }
    });
    return true; // Allow deletion
  })
  .build();
```

## 3. Approval Workflow (State Machine via Hooks)

Prevent reverting an 'approved' document back to 'draft'.

```typescript
const documents = IgniterCollectionModel.create('documents')
  .withSchema(z.object({ title: z.string(), status: z.enum(['draft', 'review', 'approved']) }))
  .onUpdated(({ newValue, previousValue }) => {
    if (previousValue.status === 'approved' && newValue.status === 'draft') {
      throw new Error('Cannot revert approved content to draft');
    }
    return newValue;
  })
  .build();
```

## 4. Querying and Filtering

Using the Prisma-like `findMany` syntax.

```typescript
// Find top 10 published posts with more than 100 views, ordered by newest
const popularPosts = await manager.posts.findMany({
  where: {
    status: 'published',
    views: { gt: 100 }
  },
  orderBy: {
    createdAt: 'desc'
  },
  take: 10
});
```

## 5. Type-Safe Distributed Cache (Redis)

Use the Collections ORM as a validated cache layer over Redis.

```typescript
import { BunRedisAdapter } from '@igniter-js/collections/adapters';

const cacheManager = await IgniterCollections.create()
  .withAdapter(new BunRedisAdapter({ prefix: 'cache:' }))
  .addCollection(
    IgniterCollectionModel.create('users')
      .withSchema(z.object({ id: z.string(), name: z.string(), role: z.string() }))
      .build()
  )
  .build();

// Write to Redis with validation
await cacheManager.users.create({
  id: 'usr_123',
  data: { id: 'usr_123', name: 'Alice', role: 'admin' }
});

// If Redis data is manually altered and invalid, read will throw a validation error
const user = await cacheManager.users.findUnique({ where: { id: 'usr_123' }});
```

## 6. Declarative Data Views (Grouping)

Shape data for a dashboard without complex manual transformations.

```typescript
const posts = IgniterCollectionModel.create('posts')
  .withSchema(z.object({ title: z.string(), author: z.string(), status: z.string() }))
  .withViews([{
    name: 'byAuthor',
    defaultQuery: { where: { status: 'published' } },
    transforms: [{ action: 'group', field: 'author' }],
    stats: [{ field: 'author', operation: 'count' }]
  }])
  .build();

const manager = await IgniterCollections.create()
  .withAdapter(new BunFsAdapter())
  .addCollection(posts)
  .build();

// Render the view
const { items, stats } = await manager.posts.views.render('byAuthor');

// Result:
// items = { 'felipe': [...], 'neo': [...] }
// stats = { total: 10, author: { 'felipe': 6, 'neo': 4 } }
```

## 8. Templated Content (Handlebars)

Generate complex document content using templates and strongly-typed objects.

```typescript
import { IgniterCollectionModel } from '@igniter-js/collections';
import { z } from 'zod';

// 1. Create a Handlebars template at 'templates/post.hbs':
// # {{title}}
// {{content.body}}
// ---
// Written by {{author}}

// 2. Define the collection with a template and schema
const posts = IgniterCollectionModel.create('posts')
  .withPatterns(['posts/{id}.md'])
  .withTemplate('templates/post.hbs') // Enable template mode
  .withSchema(z.object({
    title: z.string(),
    author: z.string(),
    content: z.object({ // 'content' is now a strongly-typed object
      body: z.string()
    })
  }))
  .build();

// 3. Create a document with template variables
await manager.posts.create({
  data: {
    title: 'Hello World',
    author: 'Neo',
    content: {
      body: 'This content will be rendered through Handlebars.'
    }
  }
});
```

## 7. Full-Text & Fuzzy Search

Leverage the built-in FTS engine to find documents by relevance.

```typescript
// Simple fuzzy search across common fields (title, description, content)
const results = await manager.posts.findMany({
  where: {
    search: {
      term: 'ignite',
      fuzzy: true,
      threshold: 0.3
    }
  }
});

// Weighted search in specific fields
const weightedResults = await manager.posts.findMany({
  where: {
    search: {
      term: 'performance',
      fields: {
        title: { weight: 10, fuzzy: true },     // 10x weight with fuzzy matching
        description: { weight: 5, fuzzy: true }, // 5x weight with fuzzy matching
        content: { weight: 1 }                  // Standard weight
      }
    }
  }
});

// Results include a special `_search` property with metadata
console.log(results[0]._search.score); // E.g., 0.95
console.log(results[0]._search.matches); // List of matching snippets
```

## 9. Cookbook: Real-World Schemas

Examples of Zod schemas for complex content types.

```typescript
const PostSchema = z.object({
  title: z.string().min(5),
  date: z.string().date(),
  status: z.enum(['draft', 'published', 'archived']),
  tags: z.array(z.string()).default([]),
  metadata: z.object({
    featured: z.boolean().default(false),
    priority: z.number().min(0).max(10).optional()
  }),
  // Schema for Handlebars template variables
  content: z.object({
    body: z.string(),
    author: z.string(),
    references: z.array(z.string()).optional()
  })
});
```

## 10. Comprehensive Schema Registry Example

Define everything in JSON for runtime discovery and UI generation.

### `collections/posts.schema.json`
```json
{
  "collectionName": "posts",
  "patterns": ["content/posts/{id}.md"],
  "template": "templates/post.hbs",
  "schema": {
    "type": "object",
    "properties": {
      "title": { "type": "string" },
      "status": { "type": "string", "enum": ["draft", "published"] },
      "content": {
        "type": "object",
        "properties": { "body": { "type": "string" } }
      }
    }
  },
  "hooks": {
    "onCreated": "./hooks/on-created.ts",
    "onUpdated": "./hooks/on-updated.ts"
  },
  "views": [
    {
      "name": "dashboard",
      "title": "Posts Dashboard",
      "tree": [ { "component": "Table", "props": { "columns": ["title", "status"] } } ],
      "defaultQuery": { "where": { "status": "published" } },
      "transforms": [ { "action": "group", "field": "status" } ]
    }
  ]
}
```

### `collections/hooks/on-created.ts`
```typescript
import { IgniterCollectionOnCreatedHook } from '@igniter-js/collections';

export const onCreated: IgniterCollectionOnCreatedHook = async ({ value }) => {
  console.log(`[Hook] New post created: ${value.title}`);
  return value; // Return modified or original document
};
```

**Note on Hooks:** When using the registry, hooks must be exported functions from a `.ts` or `.js` file. The registry dynamically imports these files. The exported function name must match the hook name (e.g., `export const onCreated = ...`).

### `index.ts` (Manager Setup)
```typescript
const manager = await IgniterCollections.create()
  .withAdapter(new BunFsAdapter())
  .withBasePath(process.cwd())
  // Discover all .schema.json files in the 'collections' directory
  .withSchemaRegistry('./collections/*.schema.json', { autoWatch: true })
  .build();

// Access via proxied property
const allPosts = await manager.posts.findMany();
```

**Source References**
- `node_modules/@igniter-js/collections/dist/index.d.ts:2054` | **withSchemaRegistry** | Builder method for enabling dynamic schema discovery.
- `node_modules/@igniter-js/collections/dist/index.d.ts:1370` | **Schema File Definition** | Interface for the .schema.json file structure.
- `node_modules/@igniter-js/collections/dist/index.js:2152` | **registry.refresh** | Logic for scanning and loading schemas from disk.
- `node_modules/@igniter-js/collections/README.md:200` | **Advanced Queries** | Real-world examples of complex findMany calls.
- `node_modules/@igniter-js/collections/AGENTS.md:800` | **Integration Workflow** | Example of combining collections with S3 for image optimization.

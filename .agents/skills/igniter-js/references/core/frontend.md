---
alwaysApply: true
---

# Front-End Development Workflow for Igniter.js

This guide provides the essential workflow for front-end development in Igniter.js + React 19 applications, ensuring seamless integration with the backend API.

**IMPORTANT:** This guide focuses on Igniter.js-specific patterns. For detailed patterns on React, Shadcn UI, Browser Testing, and General Testing, refer to the dedicated pattern files in `references/patterns/`.

## \u{1F4DA} Pattern References

Before proceeding, familiarize yourself with these essential patterns:

- **[React Patterns](../patterns/react.md)** - Component architecture, hooks, performance optimization
- **[Shadcn/UI Patterns](../patterns/shadcn.md)** - Design system, components, theming
- **[Browser Testing](../patterns/browser.md)** - UI testing with agent-browser CLI
- **[Testing Patterns](../patterns/testing.md)** - Comprehensive testing strategies

## 1. Project Architecture & File Organization

### 1.1 Mandatory Project Structure

**Feature Layer Organization:**

```
src/features/[feature]/
├── [feature].errors.ts  # ✅ Feature-specific errors (Mandatory)
├── [feature].interfaces.ts # Shared types/interfaces
├── presentation/        # UI/Presentation Layer
│   ├── pages/           # Route-level components
│   ├── components/      # UI components (simple or complex)
│   ├── hooks/           # Feature-level hooks
│   ├── stores/          # Feature-level Zustand stores
│   ├── schemas/         # ✅ Zod/Validation schemas (Mandatory)
│   ├── contexts/        # Feature contexts
│   └── utils/           # Feature utilities (ALWAYS use static class)
├── procedures/          # Business logic procedures
└── repositories/        # Data access repositories
```

**For detailed component organization patterns, see [React Patterns](../patterns/react.md#1-component-architecture).**

## 2. Igniter.js Client Integration Protocol

The Igniter.js Client provides type-safe, universal API access across all execution environments (Server Components, Client Components, API Routes, Server Actions).

### 2.1. Client API Patterns

**Queries (GET requests):**

```tsx
"use client";

import { api } from "@/igniter.client";

function BoardsList() {
  const { data: boardsData, isLoading, error } = api.boards.list.useQuery();

  const boards = data; // Access nested response structure

  if (isLoading) return <BoardsSkeleton />;
  if (error) return <BoardsError error={error} />;

  return (
    <div className="grid gap-4">
      {boards?.map((board) => (
        <BoardCard key={board.id} board={board} />
      ))}
    </div>
  );
}
```

**Mutations (POST/PUT/DELETE requests):**

```tsx
"use client";

import { api, useQueryClient } from "@/igniter.client";

function CreateBoardForm() {
  const { invalidate } = useQueryClient();

  const createBoard = api.boards.create.useMutation({
    onSuccess: (result) => {
      console.log("Board created:", result?.data);
      // Invalidate queries to refetch
      invalidate(["boards.list"]);
    },
    onError: (error) => {
      console.error("Failed to create board:", error.code);
    },
  });

  const handleSubmit = (data: CreateBoardInput) => {
    createBoard.mutate({ body: data });
  };

  return (
    <form onSubmit={handleSubmit}>
      {/* Form fields */}
      <button type="submit" disabled={createBoard.isLoading}>
        {createBoard.isLoading ? "Creating..." : "Create Board"}
      </button>
    </form>
  );
}
```

**Query Invalidation:**

```tsx
"use client";

import { api, useQueryClient } from "@/igniter.client";

function BoardDetail({ boardId }: { boardId: string }) {
  const { invalidate } = useQueryClient();

  const {
    data: boardData,
    isLoading,
    error,
  } = api.boards.getById.useQuery({
    params: { id: boardId },
    enabled: !!boardId,
  });

  const createList = api.lists.create.useMutation({
    onSuccess: () => {
      // Invalidate specific query
      invalidate(["boards.getById", boardId]);
      // Invalidate list query
      invalidate(["boards.list"]);
    },
  });

  // ... rest of component
}
```

### 2.2. Error Handling with Feature-Specific Errors

**For complete error handling patterns, see [errors.md](./errors.md).**

```tsx
"use client";

import { api } from "@/igniter.client";
import { BoardError } from "@/features/boards/board.errors";

function BoardActions({ boardId }: { boardId: string }) {
  const deleteBoard = api.boards.delete.useMutation({
    onSuccess: () => {
      toast.success("Board deleted");
    },
    onError: (error: BoardError) => {
      // Type-safe error handling with error codes
      switch (error.code) {
        case "BOARD_NOT_FOUND":
          toast.error(error.message); // Uses message from BoardErrorCodes
          break;
        case "BOARD_HAS_ACTIVE_TASKS":
          toast.error(error.message);
          break;
        default:
          toast.error("An error occurred");
      }
    },
  });

  return (
    <button onClick={() => deleteBoard.mutate({ params: { id: boardId } })}>
      Delete
    </button>
  );
}
```

## 3. Shadcn UI Integration

**For complete Shadcn/UI patterns, design system, and theming, see [Shadcn Patterns](../patterns/shadcn.md).**

### 3.1. Quick Reference: Design Tokens

**CRITICAL:** Always use design tokens from `globals.css` instead of hardcoded values.

```tsx
// ✅ CORRECT - Using design tokens
<Card className="border-border bg-card text-card-foreground">
  <CardHeader>
    <CardTitle className="text-foreground">Dashboard</CardTitle>
  </CardHeader>
  <CardContent>
    <Button className="bg-primary text-primary-foreground">
      Create Board
    </Button>
  </CardContent>
</Card>

// ❌ WRONG - Hardcoded colors (breaks theme consistency)
<Card className="bg-white border-gray-200 text-gray-900">
  {/* Don't do this */}
</Card>
```

## 4. Form Patterns with Igniter Client

```tsx
"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { api } from "@/igniter.client";
import { CreateBoardSchema } from "../boards.interfaces";

export function CreateBoardForm() {
  const form = useForm({
    resolver: zodResolver(CreateBoardSchema),
    defaultValues: {
      title: "",
      description: "",
    },
  });

  const createBoard = api.boards.create.useMutation({
    onSuccess: () => {
      form.reset();
      toast.success("Board created successfully");
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit((data) =>
          createBoard.mutate({ body: data }),
        )}
      >
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Title</FormLabel>
              <FormControl>
                <Input {...field} className="bg-background border-border" />
              </FormControl>
              <FormMessage className="text-destructive" />
            </FormItem>
          )}
        />

        <Button
          type="submit"
          disabled={createBoard.isLoading}
          className="bg-primary text-primary-foreground"
        >
          {createBoard.isLoading ? "Creating..." : "Create Board"}
        </Button>
      </form>
    </Form>
  );
}
```

## 5. State Management Patterns

**For complete React state management patterns, see [React Patterns](../patterns/react.md#5-context-patterns).**

### 5.1. Feature-Specific Context (Quick Reference)

```tsx
"use client";

import { createContext, useContext, useState } from "react";
import { api, useQueryClient } from "@/igniter.client";

interface BoardsContextValue {
  selectedBoard: Board | null;
  setSelectedBoard: (board: Board | null) => void;
  refreshBoards: () => void;
}

const BoardsContext = createContext<BoardsContextValue | null>(null);

export function BoardsProvider({ children }: { children: React.ReactNode }) {
  const [selectedBoard, setSelectedBoard] = useState<Board | null>(null);
  const { invalidate } = useQueryClient();

  const refreshBoards = () => {
    invalidate(["boards.list"]);
  };

  return (
    <BoardsContext.Provider
      value={{ selectedBoard, setSelectedBoard, refreshBoards }}
    >
      {children}
    </BoardsContext.Provider>
  );
}

export function useBoards() {
  const context = useContext(BoardsContext);
  if (!context) {
    throw new Error("useBoards must be used within BoardsProvider");
  }
  return context;
}
```

## 6. Testing Workflow

**For complete testing patterns, see [Testing Patterns](../patterns/testing.md) and [Browser Testing](../patterns/browser.md).**

### 6.1. CRITICAL: Mandatory Browser Testing

**\u{1F6A8} ABSOLUTE REQUIREMENT: ALL Front-End implementations require browser validation.**

```bash
# After implementing a UI feature, validate with agent-browser
agent-browser --headed open http://localhost:3000/boards/create
agent-browser snapshot -i
agent-browser fill @e1 "New Board"
agent-browser click @e2  # Submit button
agent-browser wait --text "Board created successfully"
agent-browser screenshot ./validation.png
```

**See [Browser Testing](../patterns/browser.md) for complete testing protocols.**

## 7. Performance Optimization

**For complete performance patterns, see [React Patterns](../patterns/react.md#4-performance-optimization).**

### 7.1. Query Configuration (Quick Reference)

```tsx
"use client";

import { api } from "@/igniter.client";

function OptimizedBoardsList() {
  const { data: boards } = api.boards.list.useQuery({
    // Cache for 5 minutes
    staleTime: 5 * 60 * 1000,

    // Don't refetch on window focus
    refetchOnWindowFocus: false,

    // Background refetch every 10 minutes
    refetchInterval: 10 * 60 * 1000,
    refetchIntervalInBackground: true,
  });

  return <div>{/* Render boards */}</div>;
}
```

## 8. Best Practices Summary

### 8.1. Igniter Client Best Practices

✅ **DO:**

- Use `api.[controller].[action].useQuery()` for GET requests
- Use `api.[controller].[action].useMutation()` for POST/PUT/DELETE
- Invalidate queries after mutations to refetch data
- Handle loading and error states explicitly
- Use feature-specific error classes for type-safe error handling

❌ **DON'T:**

- Make direct fetch() calls to your API (use Igniter Client)
- Forget to invalidate queries after mutations
- Hardcode API URLs or endpoints
- Use generic error handling (use feature-specific errors)

### 8.2. Component Best Practices

**See [React Patterns](../patterns/react.md#7-best-practices) for complete component guidelines.**

### 8.3. Shadcn/UI Best Practices

**See [Shadcn Patterns](../patterns/shadcn.md#9-quality-checklist) for complete quality checklist.**

### 8.4. Testing Best Practices

**See [Testing Patterns](../patterns/testing.md#10-best-practices) for complete testing guidelines.**

## 9. Common Mistakes & Solutions

### 9.1. API Integration Mistakes

```tsx
// ❌ WRONG - Direct fetch instead of Igniter Client
const boards = await fetch("/api/v1/boards").then((res) => res.json());

// ✅ CORRECT - Use Igniter Client
const { data: boards } = api.boards.list.useQuery();
```

### 9.2. Error Handling Mistakes

```tsx
// ❌ WRONG - Generic error handling
onError: (error) => {
  toast.error("Something went wrong");
};

// ✅ CORRECT - Type-safe error handling
onError: (error: BoardError) => {
  switch (error.code) {
    case "BOARD_NOT_FOUND":
      toast.error(error.message);
      break;
    default:
      toast.error("An unexpected error occurred");
  }
};
```

### 9.3. Query Invalidation Mistakes

```tsx
// ❌ WRONG - Not invalidating after mutation
const createBoard = api.boards.create.useMutation({
  onSuccess: () => {
    toast.success("Board created");
    // Missing invalidation - list won't refetch
  },
});

// ✅ CORRECT - Invalidate to refetch
const createBoard = api.boards.create.useMutation({
  onSuccess: () => {
    toast.success("Board created");
    invalidate(["boards.list"]);
  },
});
```

---

**Remember:** This guide provides Igniter.js-specific patterns. For detailed implementations of React, Shadcn UI, Browser Testing, and General Testing, consult the dedicated pattern files in `references/patterns/`.

## 1. Project Architecture & File Organization

### 1.1 Mandatory Project Structure

**Feature Layer Organization:**

```
src/features/[feature]/
├── [feature].errors.ts  # ✅ Feature-specific errors (Mandatory)
├── [feature].interfaces.ts # Shared types/interfaces
├── presentation/        # UI/Presentation Layer
│   ├── pages/           # Route-level components
│   ├── components/      # UI components (simple or complex)
│   ├── hooks/           # Feature-level hooks
│   ├── stores/          # Feature-level Zustand stores
│   ├── schemas/         # ✅ Zod/Validation schemas (Mandatory)
│   ├── contexts/        # Feature contexts
│   └── utils/           # Feature utilities
├── procedures/          # Business logic procedures
└── repositories/        # Data access repositories
```

**Presentation Layer Organization:**

```
src/features/[feature]/presentation/
├── pages/              # React Router pages (Entry points)
├── stores/             # Feature-level Zustand stores (Global feature state)
├── hooks/              # Shared hooks across the feature
├── schemas/            # ✅ Feature-level schemas (Zod)
├── components/         # Feature-specific UI components
│   ├── [simple-component].tsx  # Simple single-file components
│   └── [complex-component]/    # Complex components requiring decomposition
│       ├── index.tsx          # Main export (Composition Root)
│       ├── components/        # Sub-components (private to parent)
│       ├── hooks/             # Component-specific hooks
│       ├── stores/            # Component-specific state (complex forms/wizards)
│       ├── helpers/           # Static logic/transformations (Pure functions)
│       └── interfaces/        # Internal types and schemas
├── contexts/           # React contexts (Dependency Injection / Theming)
└── utils/              # Pure utility functions (ALWAYS use static class)
```

**Component File Naming Convention (STRICT KEBAB-CASE):**

```tsx
// ✅ CORRECT - Kebab-case filenames
src/features/auth/presentation/
├── pages/
│   ├── login-page.tsx
│   └── register-page.tsx
├── components/
│   ├── user-avatar.tsx            # Simple component
│   └── login-form/                # Complex component
│       ├── index.tsx              # Public API
│       ├── components/
│       │   ├── password-input.tsx # Private sub-component
│       │   └── submit-button.tsx
│       ├── hooks/
│       │   └── use-login.ts       # Logic
│       └── interfaces/
│           └── login.interfaces.ts     # Interfaces
```

### 1.2 Component Architecture Patterns

**The "Fractal Component" Pattern:**
Complex components should be self-contained "micro-universes". Use the folder structure above to keep related logic close. `index.tsx` should primarily orchestrate layout and logic hooks, keeping the render clean.

**Component Composition Pattern:**

```tsx
// ✅ CORRECT - Compound component pattern
function BoardActions({ children }: { children: ReactNode }) {
  return <div className="flex gap-2">{children}</div>;
}

function BoardActionsEdit({ boardId }: { boardId: string }) {
  return <Button>Edit</Button>;
}

function BoardActionsDelete({ boardId }: { boardId: string }) {
  return <Button variant="destructive">Delete</Button>;
}

// Usage
<BoardActions>
  <BoardActionsEdit boardId={board.id} />
  <BoardActionsDelete boardId={board.id} />
</BoardActions>;
```

## 2. Igniter.js Client Integration Protocol

- **Queries**: `api.controller.endpoint.useQuery()` returns `{ data: { data: T }, isLoading, error }`
- **Mutations**: `api.controller.endpoint.useMutation()` returns hook with `{ mutate, data, isLoading, isSuccess, isError, error }`
- **Invalidation**: `useQueryClient()` provides `invalidate()` method with string-based query keys
- **Best Practice**: Use the provided hooks for consistent state management and automatic loading states

### 2.1 Client Usage Patterns

**Data Fetching Patterns:**

```tsx
// ✅ CORRECT - Data fetching via hooks
"use client";

import { api } from "@/igniter.client";

function BoardsList() {
  const { data: boardsData, isLoading, error } = api.boards.list.useQuery();

  const boards = data; // Access nested response structure

  if (isLoading) return <BoardsSkeleton />;
  if (error) return <BoardsError error={error} />;

  return (
    <div className="grid gap-4">
      {boards?.map((board) => (
        <BoardCard key={board.id} board={board} />
      ))}
    </div>
  );
}
```

// ✅ CORRECT - Using Igniter.js useMutation hook with proper error handling
import { BoardError } from "../../board.errors";

const createBoardMutation = api.boards.create.useMutation({
onSuccess: (result: any) => {
console.log("Board created:", result?.data);

    // Handle success - invalidate queries and navigate
    queryClient.invalidate("boards.list"); // from igniter.client.ts
    router.push(`/app/boards/${result?.data?.id}`);

},
onError: (error: BoardError) => {
console.error("Failed to create board:", error.code);
// Handle error - could show toast notification
},
});

const handleCreateBoard = (boardData: CreateBoardInput) => {
createBoardMutation.mutate({ body: boardData });
};

````

**Query Invalidation Pattern:**

```tsx
// ✅ CORRECT - Query invalidation with Igniter.js hooks
"use client";

import { api } from "@/igniter.client";

function BoardDetail({ boardId }: { boardId: string }) {
  const { invalidate } = useQueryClient();

  const {
    data: boardData,
    isLoading,
    error,
    invalidate,
  } = api.boards.getById.useQuery({
    params: { id: boardId },
    enabled: !!boardId,
  });

  const board = boardData?.data;

  const createList = api.lists.create.useMutation({
    onSuccess: (result: any) => {
      console.log("List created:", result?.data);

      // Invalidate the board query to refetch updated data
      invalidate();
    },
    onError: (error: BoardError) => {
      console.error("Failed to create list:", error);
    },
  });

  const handleCreateList = (title: string) => {
    createList.mutate({ body: { title, boardId } });
  };

  if (isLoading) return <BoardSkeleton />;
  if (error) return <BoardError error={error} />;
  if (!board) return <div>Board not found</div>;

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">{board.title}</h1>
      {/* Board content */}
    </div>
  );
}

// ✅ CORRECT: Igniter.js provides automatic loading states and error handling
// Use invalidate() for manual cache invalidation after mutations
````

### 2.2 Error Handling Patterns

**Client-Side Error Boundaries:**

```tsx
// ✅ CORRECT - Error boundary for API errors
"use client";

function BoardsErrorBoundary({ children }: { children: ReactNode }) {
  return (
    <ErrorBoundary
      fallback={<BoardsErrorFallback />}
      onError={(error) => {
        console.error("Boards error:", error);
        // Log to monitoring service
      }}
    >
      {children}
    </ErrorBoundary>
  );
}

function BoardsErrorFallback() {
  return (
    <Alert variant="destructive">
      <AlertDescription>
        Failed to load boards.{" "}
        <Button variant="link" onClick={() => window.location.reload()}>
          Reload page
        </Button>
      </AlertDescription>
    </Alert>
  );
}
```

## 3. Shadcn UI Integration & Design System

### 3.1 Design Token Integration

**CRITICAL**: Always use design tokens from `globals.css` instead of hardcoded values to ensure theme consistency and proper dark/light mode support.

**Core Design Tokens:**

```css
/* Available in globals.css */
--background: oklch(1 0 0); /* Main background */
--foreground: oklch(0.141 0.005 285.823); /* Primary text */
--card: oklch(0.21 0.006 285.885); /* Card backgrounds */
--card-foreground: oklch(0.985 0 0); /* Card text */
--primary: oklch(0.21 0.006 285.885); /* Primary actions */
--primary-foreground: oklch(0.985 0 0); /* Primary text */
--secondary: oklch(0.967 0.001 286.375); /* Secondary actions */
--muted: oklch(0.552 0.016 285.938); /* Muted backgrounds */
--muted-foreground: oklch(0.552 0.016 285.938); /* Muted text */
--accent: oklch(0.967 0.001 286.375); /* Accent elements */
--border: oklch(0.92 0.004 286.32); /* Borders */
--ring: oklch(0.705 0.015 286.067); /* Focus rings */
```

**Usage Pattern:**

```tsx
// ✅ CORRECT - Using design tokens
<div className="bg-background text-foreground border border-border p-4 rounded-md">
  <h2 className="text-2xl font-semibold text-foreground mb-4">Dashboard</h2>
  <button className="bg-primary text-primary-foreground hover:bg-primary/90 px-4 py-2 rounded-md transition-colors">
    Create Board
  </button>
</div>

// ✅ CORRECT - Using semantic color variants with Shadcn components
<Card className="border-border bg-card text-card-foreground">
  <CardHeader>
    <CardTitle className="text-card-foreground">Board Title</CardTitle>
    <CardDescription className="text-muted-foreground">Board description</CardDescription>
  </CardHeader>
  <CardContent>
    <Button variant="secondary" className="bg-secondary text-secondary-foreground">
      Secondary Action
    </Button>
  </CardContent>
</Card>

// ❌ INCORRECT - Hardcoded values (breaks theme consistency)
<div className="bg-white text-gray-900 border border-gray-200">
  <button className="bg-blue-600 text-white hover:bg-blue-700">
    Action
  </button>
</div>
```

### 3. Shadcn UI Integration & Design System

### 3.1 Component Variants & Theming

**Button Variants Usage:**

```tsx
// ✅ CORRECT - Using semantic variants with design tokens
<Button variant="default" className="bg-primary text-primary-foreground">
  Primary Action
</Button>
<Button variant="secondary" className="bg-secondary text-secondary-foreground">
  Secondary Action
</Button>
<Button variant="outline" className="border-border text-foreground">
  Tertiary Action
</Button>
<Button variant="ghost" className="text-muted-foreground hover:text-foreground">
  Minimal Action
</Button>
<Button variant="destructive" className="bg-destructive text-destructive-foreground">
  Danger Action
</Button>

// ❌ INCORRECT - Overriding with hardcoded styles
<Button className="bg-red-500 text-white">Custom Button</Button>
```

**Form Components Integration:**

```tsx
// ✅ CORRECT - Complete form with shadcn components
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

const formSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
});

function CreateBoardForm() {
  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: { title: "", description: "" },
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Title</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" className="w-full">
          Create Board
        </Button>
      </form>
    </Form>
  );
}
```

### 3.2 Block-Based Component Development

**Installing and Adapting Blocks:**

```bash
# Install shadcn block
npx shadcn add dashboard-01

# Analyze generated components
await analyze_file({
  filePath: "src/components/app-sidebar.tsx",
  includeErrors: true
});

# Adapt to project structure
# 1. Move to appropriate feature directory
# 2. Update imports to use project patterns
# 3. Integrate with Igniter.js client
# 4. Apply design system tokens
```

**Block Integration Pattern:**

```tsx
// ✅ CORRECT - Adapted block component
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarFooter,
} from "@/components/ui/sidebar";
import { api } from "@/igniter.client";

export function AppSidebar() {
  const { data: user } = api.auth.me.useQuery();

  return (
    <Sidebar>
      <SidebarHeader>
        <div className="flex items-center gap-2 px-4 py-2">
          <Kanban className="h-6 w-6 text-primary" />
          <span className="font-semibold text-sidebar-foreground">
            Igniter Tasks
          </span>
        </div>
      </SidebarHeader>

      <SidebarContent>
        {/* Navigation items adapted for project */}
      </SidebarContent>

      <SidebarFooter>
        <UserMenu user={user} />
      </SidebarFooter>
    </Sidebar>
  );
}
```

### 3.3 Component Discovery and Registry Management

This section outlines how to leverage Shadcn UI tools for efficient component discovery and how to manage component registries within your project.

#### 3.3.1 Discovering Components with Shadcn Tools

You can use the built-in Shadcn tools to list and search for components across configured registries. This helps in quickly finding suitable components for your project.

**Listing All Available Components:**
Use the `mcp_shadcn_list_items_in_registries` tool to see all components from a specific registry or across multiple registries.

```json
{
  "tool": "mcp_shadcn_list_items_in_registries",
  "args": {
    "registries": ["@shadcn", "@marketing"]
  }
}
```

**Searching for Specific Components:**
When you have a specific component in mind or a keyword, `mcp_shadcn_search_items_in_registries` can help you find it using fuzzy matching.

```json
{
  "tool": "mcp_shadcn_search_items_in_registries",
  "args": {
    "registries": ["@shadcn", "@marketing"],
    "query": "hero section"
  }
}
```

**Proactive Component Suggestions:**
As an AI assistant, I will proactively use these tools to search for relevant components based on your development context and feature requirements. If I identify a component that could be beneficial, I will suggest it to you, along with reasoning and potential usage.

#### 3.3.2 Adding New Registries to `components.json`

The `components.json` file is where you configure your Shadcn UI registries. You can add new registries, including third-party or private ones, to expand your component sources.

**Structure in `components.json`:**

```json
{
  "registries": {
    "@acme": "https://registry.acme.com/{name}.json",
    "@internal": {
      "url": "https://internal.company.com/{name}.json",
      "headers": {
        "Authorization": "Bearer ${REGISTRY_TOKEN}"
      }
    }
  }
}
```

## 4. State Management & Data Flow Patterns

### 4.1 React Context Patterns

**Feature-Specific Context:**

```tsx
// ✅ CORRECT - Feature context pattern with Igniter.js integration
"use client";

import { api } from "@/igniter.client";
import { useQueryClient } from "@igniter-js/core/client";

interface BoardsContextType {
  selectedBoard: Board | null;
  setSelectedBoard: (board: Board | null) => void;
  refreshBoards: () => void;
  createBoard: ReturnType<typeof api.boards.create.useMutation>;
  isLoading: boolean;
}

const BoardsContext = createContext<BoardsContextType | null>(null);

export function BoardsProvider({ children }: { children: ReactNode }) {
  const [selectedBoard, setSelectedBoard] = useState<Board | null>(null);
  const { invalidate } = useQueryClient();

  const createBoard = api.boards.create.useMutation({
    onSuccess: (result: any) => {
      console.log("Board created successfully:", result?.data);
      invalidate("boards.list"); // Refresh the boards list
      setSelectedBoard(result?.data);
    },
    onError: (error: BoardError) => {
      console.error("Failed to create board:", error);
    },
  });

  const refreshBoards = () => {
    invalidate("boards.list");
  };

  return (
    <BoardsContext.Provider
      value={{
        selectedBoard,
        setSelectedBoard,
        refreshBoards,
        createBoard,
        isLoading: createBoard.isLoading,
      }}
    >
      {children}
    </BoardsContext.Provider>
  );
}

export function useBoards() {
  const context = useContext(BoardsContext);
  if (!context) {
    throw new Error("useBoards must be used within BoardsProvider");
  }
  return context;
}
```

### 4.2 Custom Hook Patterns

**Data Fetching Hooks:**

```tsx
// ✅ CORRECT - Custom hook for board operations with Igniter.js
"use client";

import { api } from "@/igniter.client";
import { useQueryClient } from "@igniter-js/core/client";
import { useRouter } from "next/navigation";

function useBoard(boardId: string) {
  const { invalidate } = useQueryClient();
  const router = useRouter();

  const updateBoard = api.boards.update.useMutation({
    onSuccess: (result: any) => {
      console.log("Board updated:", result?.data);
      // Invalidate related queries
      invalidate("boards.getById", { params: { id: boardId } });
      invalidate("boards.list");
    },
    onError: (error: BoardError) => {
      console.error("Failed to update board:", error);
    },
  });

  const deleteBoard = api.boards.delete.useMutation({
    onSuccess: () => {
      console.log("Board deleted successfully");
      // Invalidate queries after deletion
      invalidate("boards.list");
      // Navigate away from deleted board
      router.push("/app/boards");
    },
    onError: (error: BoardError) => {
      console.error("Failed to delete board:", error);
    },
  });

  return {
    updateBoard,
    deleteBoard,
    isUpdating: updateBoard.isLoading,
    isDeleting: deleteBoard.isLoading,
  };
}
```

**Form State Hooks:**

```tsx
// ✅ CORRECT - Form state management hook with Igniter.js
"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { api } from "@/igniter.client";
import { CreateBoardSchema, UpdateBoardSchema } from "../schemas/board.schemas";
import { BoardError } from "../../board.errors";
import type { Board, BoardFormData } from "../interfaces/board.interface";

function useBoardForm(board?: Board) {
  const form = useForm({
    resolver: zodResolver(board ? UpdateBoardSchema : CreateBoardSchema),
    defaultValues: {
      title: board?.title || "",
      description: board?.description || "",
      color: board?.color || "#0079bf",
    },
  });

  const createBoard = api.boards.create.useMutation({
    onSuccess: (result) => {
      console.log("Board created:", result?.data);
      form.reset();
    },
    onError: (error: BoardError) => {
      console.error("Failed to create board:", error.code);
    },
  });

  const updateBoard = api.boards.update.useMutation({
    onSuccess: (result) => {
      console.log("Board updated:", result?.data);
    },
    onError: (error: BoardError) => {
      console.error("Failed to update board:", error.code);
    },
  });

  const onSubmit = (data: BoardFormData) => {
    if (board) {
      updateBoard.mutate({
        params: { id: board.id },
        body: data,
      });
    } else {
      createBoard.mutate({ body: data });
    }
  };

  return {
    form,
    onSubmit: form.handleSubmit(onSubmit),
    isSubmitting: createBoard.isLoading || updateBoard.isLoading,
    createBoard,
    updateBoard,
  };
}
```

## 5. Routing & Navigation Patterns

### 5.1 React Router Integration

**Route Structure Pattern (src/pages):**

```tsx
// ✅ CORRECT - Unified pages structure
src/pages/
├── board/
│   ├── components/       # Page-specific components, not reusable elsewhere
│   ├── hooks/            # Page-specific hooks, not reusable elsewhere
│   ├── stores/           # Page-specific Zustand stores
│   ├── contexts/         # Page-specific contexts
│   ├── helpers/          # Added for utility functions, always as Static Class
│   ├── interfaces/       # Page-specific types/interfaces
│   └── index.tsx
├── workspace/
│   └── index.tsx
└── login/
    └── index.tsx
```

**Navigation Patterns:**

```tsx
// ✅ CORRECT - Using React Router
import { useNavigate } from "react-router-dom";

function BoardCard({ board }: { board: Board }) {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate(`/app/boards/${board.id}`);
  };

  return (
    <Card onClick={handleClick} className="cursor-pointer">
      <CardContent>
        <h3>{board.title}</h3>
        <p>{board.description}</p>
      </CardContent>
    </Card>
  );
}
```

**Link Component Usage:**

```tsx
// ✅ CORRECT - Using React Router Link
import { Link } from "react-router-dom";

function Navigation() {
  return (
    <nav>
      <Link to="/app" className="nav-link">
        Dashboard
      </Link>
      <Link to="/app/boards" className="nav-link">
        Boards
      </Link>
      <Link to="/app/settings" className="nav-link">
        Settings
      </Link>
    </nav>
  );
}
```

## 6. Interface Definition & Type Safety

### 6.1 Zod Schema Patterns

**Request/Response Schemas:**

```tsx
// ✅ CORRECT - Comprehensive schema definition
// src/features/boards/presentation/schemas/board.schemas.ts
import { z } from "zod";

export const CreateBoardSchema = z.object({
  title: z
    .string()
    .min(1, "Title is required")
    .max(100, "Title must be less than 100 characters"),
  description: z
    .string()
    .max(500, "Description must be less than 500 characters")
    .optional(),
  color: z
    .string()
    .regex(/^#[0-9A-Fa-f]{6}$/, "Invalid hex color")
    .optional(),
  position: z.number().int().min(0).optional(),
});

export const UpdateBoardSchema = CreateBoardSchema.partial();

export const BoardResponseSchema = z.object({
  id: z.string().uuid(),
  title: z.string(),
  description: z.string().nullable(),
  color: z.string().nullable(),
  position: z.number(),
  createdAt: z.date(),
  updatedAt: z.date(),
  userId: z.string(),
});

export type CreateBoardInput = z.infer<typeof CreateBoardSchema>;
export type UpdateBoardInput = z.infer<typeof UpdateBoardSchema>;
export type BoardResponse = z.infer<typeof BoardResponseSchema>;
```

### 6.2 Type Definition Patterns

**Component Props Types:**

```tsx
// ✅ CORRECT - Component props with proper typing
interface BoardCardProps {
  board: Board;
  onEdit?: (board: Board) => void;
  onDelete?: (boardId: string) => void;
  className?: string;
}

interface BoardFormProps {
  board?: Board; // For editing existing board
  onSubmit: (data: CreateBoardInput | UpdateBoardInput) => Promise<void>;
  onCancel?: () => void;
}

function BoardCard({ board, onEdit, onDelete, className }: BoardCardProps) {
  // Implementation
}

function BoardForm({ board, onSubmit, onCancel }: BoardFormProps) {
  // Implementation
}
```

## 7. Performance Optimization Patterns

### 7.1 Component Optimization

**Memoization Patterns:**

```tsx
// ✅ CORRECT - Memoizing expensive components
import { memo } from "react";

const BoardCard = memo(function BoardCard({
  board,
  onEdit,
  onDelete,
}: BoardCardProps) {
  console.log("BoardCard rendered:", board.id);

  return (
    <Card>
      <CardContent>
        <h3>{board.title}</h3>
        <p>{board.description}</p>
        <div className="flex gap-2">
          <Button onClick={() => onEdit?.(board)}>Edit</Button>
          <Button variant="destructive" onClick={() => onDelete?.(board.id)}>
            Delete
          </Button>
        </div>
      </CardContent>
    </Card>
  );
});
```

**Dynamic Imports:**

```tsx
// ✅ CORRECT - Code splitting for heavy components
import dynamic from "next/dynamic";

const BoardDetail = dynamic(() => import("./board-detail"), {
  loading: () => <BoardSkeleton />,
  ssr: false, // Client-side only if needed
});

const CreateBoardDialog = dynamic(() => import("./create-board-dialog"), {
  loading: () => <DialogSkeleton />,
});
```

### 7.2 Data Fetching Optimization

**Query Optimization:**

```tsx
// ✅ CORRECT - Optimized queries
function BoardsList() {
  const { data: boards, isLoading } = api.boards.list.useQuery({
    // Cache for 5 minutes
    staleTime: 5 * 60 * 1000,

    // Don't refetch on window focus for this data
    refetchOnWindowFocus: false,

    // Refetch every 10 minutes in background
    refetchInterval: 10 * 60 * 1000,
    refetchIntervalInBackground: true,

    // Use initial data to prevent loading states
    initialData: [],
  });

  // Implementation
}
```

## 8. Testing Patterns

### 8.1 CRITICAL: Mandatory Browser Testing

**🚨 ABSOLUTE REQUIREMENT: ALL Front-End implementations require browser validation.**

**Browser Testing Protocol (Front-End Only):**

```typescript
// 1. MANDATORY: After the server status check confirms the port is running, use your browser tools for autonomous Front-End validation.
// 2. CRITICAL: Cannot advance to next task/subtask without successful browser testing.
// 3. Browser testing provides autonomous end-to-end validation for the Front-End.
// 4. Test all user interactions, form submissions, navigation, and UI states.
```

**Playwright Testing Workflow (Front-End Only):**

- **User Journey Testing:** Test complete user flows from start to finish.
- **Form Validation:** Test form submissions, validation, and error states.
- **Navigation Testing:** Test routing, page transitions, and URL changes.
- **Interactive Elements:** Test buttons, links, modals, and dynamic content.
- **Responsive Testing:** Test across different screen sizes and devices.
- **Accessibility Testing:** Test keyboard navigation, screen readers, focus management.

**Cannot Advance Without Browser Validation:**

- **Task Block:** Front-End implementation cannot proceed to next phase without Playwright validation.
- **Quality Gate:** Browser testing serves as final autonomous validation for the Front-End.
- **Autonomous Testing:** Provides independent validation layer for Front-End implementations.

## 9. Research & Market Analysis Protocol

### 9.1 Browser Research Freedom

**UNRESTRICTED BROWSER ACCESS:**

**Research Capabilities:**

- **UI/UX Inspiration:** Access Dribbble, Behance, Awwwards for design inspiration
- **Framework Updates:** Latest React, Next.js, and library documentation
- **Component Libraries:** Shadcn UI updates, new components, customization options
- **Accessibility Guidelines:** WCAG 2.1 AA updates, ARIA best practices
- **Performance Patterns:** Latest optimization techniques and tools
- **Community Solutions:** Stack Overflow, Reddit, GitHub for real-world implementations

**Market Analysis Integration:**

- **Technology Trends:** Latest front-end frameworks, tools, and methodologies
- **User Experience Patterns:** Current UX trends and user behavior insights
- **Competitive Analysis:** How other applications handle similar features
- **Performance Benchmarks:** Industry standards and best practices
- **Accessibility Standards:** Latest WCAG guidelines and implementation patterns

**Research-Driven Development:**

- **Stay Current:** Always check latest documentation and community solutions
- **Market Research:** Ensure solutions are competitive and user-friendly
- **Technology Updates:** Keep up with framework updates and new features
- **Best Practices:** Research latest patterns and implement them

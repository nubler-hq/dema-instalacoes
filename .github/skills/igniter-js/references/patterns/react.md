---
description: React 19 patterns, hooks, performance optimization, and best practices for Igniter.js applications
globs: []
alwaysApply: false
---

# React Patterns & Performance for Igniter.js

This guide provides React 19-specific patterns and performance optimization strategies for Igniter.js applications.

## 1. Component Architecture

### 1.1. Component Organization

```
src/features/users/presentation/
├── pages/              # Route-level components (entry points)
├── components/         # Feature-specific UI components
│   ├── user-card.tsx  # Simple single-file components
│   └── user-form/     # Complex components (self-contained)
│       ├── index.tsx          # Main export (composition root)
│       ├── components/        # Sub-components (private)
│       ├── hooks/             # Component-specific hooks
│       └── helpers/           # Static utility functions
├── hooks/              # Shared feature hooks
└── stores/             # Feature-level Zustand stores
```

### 1.2. Component Naming & File Structure

```tsx
// ✅ CORRECT - Kebab-case filenames, PascalCase exports
// File: user-profile-card.tsx
export function UserProfileCard({ user }: UserProfileCardProps) {
  return <Card>{/* ... */}</Card>;
}

// ❌ WRONG - PascalCase filename
// File: UserProfileCard.tsx (Don't do this)
```

## 2. React 19 Patterns

### 2.1. Server Components (RSC)

```tsx
// app/users/page.tsx (Server Component)
import { api } from "@/igniter.client";

export default async function UsersPage() {
  // Direct server-side API call (no HTTP overhead)
  const users = await api.users.list.query();

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">Users</h1>
      <UsersList users={users.data} />
    </div>
  );
}
```

### 2.2. Client Components with Hooks

```tsx
"use client";

import { api } from "@/igniter.client";
import { UserCard } from "./user-card";

export function UsersListClient() {
  const { data, isLoading, error } = api.users.list.useQuery();

  if (isLoading) return <UsersListSkeleton />;
  if (error) return <ErrorState error={error} />;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {data?.data?.map((user) => (
        <UserCard key={user.id} user={user} />
      ))}
    </div>
  );
}
```

### 2.3. use() Hook (React 19)

```tsx
"use client";

import { use } from "react";

export function UserProfile({ userPromise }: { userPromise: Promise<User> }) {
  // React 19: Unwrap promise with use()
  const user = use(userPromise);

  return (
    <div>
      <h2>{user.name}</h2>
      <p>{user.email}</p>
    </div>
  );
}
```

## 3. Custom Hooks Patterns

### 3.1. Data Fetching Hook

```tsx
// hooks/use-user.ts
"use client";

import { api, useQueryClient } from "@/igniter.client";
import { useRouter } from "next/navigation";

export function useUser(userId: string) {
  const { invalidate } = useQueryClient();
  const router = useRouter();

  const {
    data: user,
    isLoading,
    error,
  } = api.users.getById.useQuery({
    params: { id: userId },
    enabled: !!userId,
  });

  const updateUser = api.users.update.useMutation({
    onSuccess: () => {
      invalidate(["users.getById", userId]);
      invalidate(["users.list"]);
    },
  });

  const deleteUser = api.users.delete.useMutation({
    onSuccess: () => {
      invalidate(["users.list"]);
      router.push("/users");
    },
  });

  return {
    user: user?.data,
    isLoading,
    error,
    updateUser,
    deleteUser,
    isUpdating: updateUser.isLoading,
    isDeleting: deleteUser.isLoading,
  };
}
```

### 3.2. Form State Hook

```tsx
// hooks/use-user-form.ts
"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { api } from "@/igniter.client";
import { CreateUserSchema } from "../users.interfaces";
import type { User } from "../users.interfaces";

export function useUserForm(user?: User) {
  const form = useForm({
    resolver: zodResolver(CreateUserSchema),
    defaultValues: {
      name: user?.name || "",
      email: user?.email || "",
    },
  });

  const createUser = api.users.create.useMutation({
    onSuccess: () => {
      form.reset();
      toast.success("User created!");
    },
  });

  const updateUser = api.users.update.useMutation({
    onSuccess: () => {
      toast.success("User updated!");
    },
  });

  const onSubmit = (data: typeof form.values) => {
    if (user) {
      updateUser.mutate({ params: { id: user.id }, body: data });
    } else {
      createUser.mutate({ body: data });
    }
  };

  return {
    form,
    onSubmit: form.handleSubmit(onSubmit),
    isSubmitting: createUser.isLoading || updateUser.isLoading,
  };
}
```

### 3.3. Boolean State Hook

```tsx
// hooks/use-boolean.ts
"use client";

import { useState, useCallback } from "react";

export function useBoolean(initialValue = false) {
  const [value, setValue] = useState(initialValue);

  const setTrue = useCallback(() => setValue(true), []);
  const setFalse = useCallback(() => setValue(false), []);
  const toggle = useCallback(() => setValue((v) => !v), []);

  return {
    value,
    setValue,
    setTrue,
    setFalse,
    toggle,
  };
}

// Usage
function CreateUserDialog() {
  const dialog = useBoolean();

  return (
    <>
      <Button onClick={dialog.setTrue}>Create User</Button>
      <Dialog open={dialog.value} onOpenChange={dialog.setValue}>
        {/* ... */}
      </Dialog>
    </>
  );
}
```

## 4. Performance Optimization

### 4.1. Memoization (Purposeful)

```tsx
"use client";

import { memo, useMemo, useCallback } from "react";

// ✅ CORRECT - Memoize expensive components
const UserCard = memo(function UserCard({
  user,
  onEdit,
  onDelete,
}: UserCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{user.name}</CardTitle>
      </CardHeader>
      <CardContent>
        <Button onClick={() => onEdit(user)}>Edit</Button>
        <Button onClick={() => onDelete(user.id)}>Delete</Button>
      </CardContent>
    </Card>
  );
});

export function UsersList() {
  const { data: users } = api.users.list.useQuery();

  // ✅ CORRECT - Stable callback references
  const handleEdit = useCallback((user: User) => {
    // Edit logic
  }, []);

  const handleDelete = useCallback((userId: string) => {
    // Delete logic
  }, []);

  // ❌ WRONG - Unnecessary memoization of primitives
  const count = useMemo(() => users?.length || 0, [users]); // Overkill

  return (
    <div>
      {users?.map((user) => (
        <UserCard
          key={user.id}
          user={user}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      ))}
    </div>
  );
}
```

### 4.2. Code Splitting (Dynamic Imports)

```tsx
"use client";

import dynamic from "next/dynamic";

// ✅ CORRECT - Lazy load heavy components
const UserProfileEditor = dynamic(() => import("./user-profile-editor"), {
  loading: () => <Skeleton className="h-64 w-full" />,
  ssr: false, // Client-only if needed
});

const AdminDashboard = dynamic(() => import("./admin-dashboard"), {
  loading: () => <DashboardSkeleton />,
});

export function UserManagement() {
  const [isEditing, setIsEditing] = useState(false);

  return (
    <div>
      <Button onClick={() => setIsEditing(true)}>Edit Profile</Button>
      {isEditing && <UserProfileEditor />}
    </div>
  );
}
```

### 4.3. Query Optimization

```tsx
"use client";

import { api } from "@/igniter.client";

export function OptimizedUsersList() {
  const { data: users } = api.users.list.useQuery({
    // Cache for 5 minutes
    staleTime: 5 * 60 * 1000,

    // Don't refetch on window focus
    refetchOnWindowFocus: false,

    // Background refetch every 10 minutes
    refetchInterval: 10 * 60 * 1000,
    refetchIntervalInBackground: true,

    // Prevent loading flicker
    initialData: [],
  });

  return <div>{/* Render users */}</div>;
}
```

### 4.4. Virtualization (Large Lists)

```tsx
"use client";

import { useVirtualizer } from "@tanstack/react-virtual";
import { useRef } from "react";

export function VirtualizedUsersList({ users }: { users: User[] }) {
  const parentRef = useRef<HTMLDivElement>(null);

  const virtualizer = useVirtualizer({
    count: users.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 80, // Height of each row
    overscan: 5, // Render 5 extra items
  });

  return (
    <div ref={parentRef} className="h-[600px] overflow-auto">
      <div
        style={{
          height: `${virtualizer.getTotalSize()}px`,
          position: "relative",
        }}
      >
        {virtualizer.getVirtualItems().map((virtualRow) => {
          const user = users[virtualRow.index];
          return (
            <div
              key={virtualRow.key}
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                width: "100%",
                height: `${virtualRow.size}px`,
                transform: `translateY(${virtualRow.start}px)`,
              }}
            >
              <UserCard user={user} />
            </div>
          );
        })}
      </div>
    </div>
  );
}
```

## 5. Context Patterns

### 5.1. Feature-Specific Context

```tsx
"use client";

import { createContext, useContext, useState, type ReactNode } from "react";
import { api, useQueryClient } from "@/igniter.client";
import type { User } from "../users.interfaces";

interface UsersContextValue {
  selectedUser: User | null;
  setSelectedUser: (user: User | null) => void;
  refreshUsers: () => void;
}

const UsersContext = createContext<UsersContextValue | null>(null);

export function UsersProvider({ children }: { children: ReactNode }) {
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const { invalidate } = useQueryClient();

  const refreshUsers = () => {
    invalidate(["users.list"]);
  };

  return (
    <UsersContext.Provider
      value={{ selectedUser, setSelectedUser, refreshUsers }}
    >
      {children}
    </UsersContext.Provider>
  );
}

export function useUsers() {
  const context = useContext(UsersContext);
  if (!context) {
    throw new Error("useUsers must be used within UsersProvider");
  }
  return context;
}
```

## 6. Error Boundaries

### 6.1. Feature Error Boundary

```tsx
"use client";

import { Component, type ReactNode } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class UsersErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: any) {
    console.error("Users error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        this.props.fallback || (
          <Card className="border-destructive">
            <CardContent className="p-6">
              <h2 className="text-lg font-semibold text-destructive mb-2">
                Something went wrong
              </h2>
              <p className="text-muted-foreground mb-4">
                {this.state.error?.message}
              </p>
              <Button
                onClick={() => this.setState({ hasError: false, error: null })}
              >
                Try Again
              </Button>
            </CardContent>
          </Card>
        )
      );
    }

    return this.props.children;
  }
}
```

## 7. Best Practices

### 7.1. Component Design Principles

✅ **DO:**

- One component per file (except complex components with sub-components)
- Use kebab-case for filenames
- Export named functions (not default for reusability)
- Keep components small and focused (< 200 lines)
- Separate business logic into hooks

❌ **DON'T:**

- Mix server and client components inappropriately
- Create "god components" with multiple responsibilities
- Inline complex logic in JSX
- Forget to memoize expensive renders

### 7.2. Hooks Best Practices

✅ **DO:**

- Use descriptive names (`useUserForm`, not `useForm`)
- Return objects (not arrays) for clarity
- Keep hooks small and focused
- Document complex hooks with TSDoc

```tsx
// ✅ CORRECT - Clear return object
export function useUser(id: string) {
  return {
    user,
    isLoading,
    error,
    updateUser,
    deleteUser,
    refetch,
  };
}

// ❌ WRONG - Unclear array return
export function useUser(id: string) {
  return [user, isLoading, updateUser, deleteUser];
}
```

### 7.3. Performance Checklist

Before considering a component complete:

- [ ] No unnecessary re-renders (use React DevTools Profiler)
- [ ] Expensive computations memoized appropriately
- [ ] Large lists virtualized
- [ ] Heavy components code-split
- [ ] Images optimized (use Next.js Image)
- [ ] Queries configured with proper caching
- [ ] No inline object/array definitions in props
- [ ] Event handlers stable (useCallback when needed)

## 8. Anti-Patterns to Avoid

### 8.1. Over-Memoization

```tsx
// ❌ WRONG - Unnecessary memoization
const count = useMemo(() => items.length, [items]); // Just use items.length
const isValid = useMemo(() => value > 0, [value]); // Just use value > 0

// ✅ CORRECT - Memoize when actually expensive
const sortedItems = useMemo(() => {
  return items.sort((a, b) => a.name.localeCompare(b.name));
}, [items]);
```

### 8.2. Prop Drilling

```tsx
// ❌ WRONG - Prop drilling through multiple levels
<Parent>
  <Child user={user} onUpdate={onUpdate}>
    <GrandChild user={user} onUpdate={onUpdate}>
      <GreatGrandChild user={user} onUpdate={onUpdate} />
    </GrandChild>
  </Child>
</Parent>

// ✅ CORRECT - Use Context or composition
<UsersProvider>
  <Parent>
    <Child>
      <GrandChild>
        <GreatGrandChild /> {/* Uses useUsers() hook */}
      </GrandChild>
    </Child>
  </Parent>
</UsersProvider>
```

### 8.3. Mixing Concerns

```tsx
// ❌ WRONG - UI + logic mixed
function UserProfile() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    fetch(`/api/users/${id}`)
      .then((res) => res.json())
      .then(setUser)
      .finally(() => setLoading(false));
  }, [id]);

  return <div>{/* Render */}</div>;
}

// ✅ CORRECT - Separate logic into hook
function UserProfile() {
  const { user, isLoading } = useUser(id);
  return <div>{/* Render */}</div>;
}
```

## 9. React 19 Specific Optimizations

### 9.1. Use Transitions

```tsx
"use client";

import { useTransition } from "react";

export function UserSearch() {
  const [isPending, startTransition] = useTransition();
  const [query, setQuery] = useState("");

  const handleSearch = (value: string) => {
    setQuery(value); // Immediate update

    startTransition(() => {
      // Expensive search operation (low priority)
      performSearch(value);
    });
  };

  return (
    <div>
      <Input
        value={query}
        onChange={(e) => handleSearch(e.target.value)}
        placeholder="Search users..."
      />
      {isPending && <Spinner />}
    </div>
  );
}
```

### 9.2. Suspense Boundaries

```tsx
import { Suspense } from "react";

export default function UsersPage() {
  return (
    <div>
      <h1>Users</h1>
      <Suspense fallback={<UsersListSkeleton />}>
        <UsersList />
      </Suspense>
    </div>
  );
}
```

---

**Remember:** React 19 + Performance Best Practices = Fast, maintainable applications. Profile before optimizing, and optimize purposefully.

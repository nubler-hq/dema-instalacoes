---
description: Shadcn/UI integration patterns for Igniter.js applications with design system best practices
globs: []
alwaysApply: false
---

# Shadcn/UI Patterns for Igniter.js

This guide provides mandatory patterns for using Shadcn/UI components in Igniter.js applications, ensuring consistency with the project's design system and theme tokens.

## \u{1F6A8} CRITICAL: Shadcn/UI Rules

**NON-NEGOTIABLE REQUIREMENTS:**

1. **NEVER create custom UI primitives** - Always use Shadcn components
2. **ALWAYS use design tokens** - Never hardcode colors or spacing
3. **ALWAYS check llms.txt first** - Before using any component
4. **ALWAYS add via CLI** - Never copy-paste components manually

## 1. Component Discovery & Installation

### 1.1. Check Official Documentation First

```bash
# ALWAYS verify latest API before using a component
curl https://ui.shadcn.com/llms.txt | grep -A 20 "dialog"
```

### 1.2. Install Components via CLI

```bash
# ✅ CORRECT - Use CLI to add components
bunx shadcn@latest add dialog
bunx shadcn@latest add form
bunx shadcn@latest add table

# ❌ WRONG - Never manually copy components
# Copy-pasting from docs leads to version mismatches
```

### 1.3. Component Registry Management

```json
// components.json - Add custom registries
{
  "registries": {
    "@shadcn": "https://ui.shadcn.com/r/{name}.json",
    "@custom": "https://registry.custom.com/{name}.json"
  }
}
```

## 2. Design System Integration

### 2.1. Theme Tokens (MANDATORY)

**ALWAYS use CSS variables from `globals.css`:**

```css
/* Available design tokens */
--background: oklch(1 0 0); /* Main background */
--foreground: oklch(0.141 0.005 285.823); /* Primary text */
--card: oklch(0.21 0.006 285.885); /* Card backgrounds */
--primary: oklch(0.21 0.006 285.885); /* Primary actions */
--secondary: oklch(0.967 0.001 286.375); /* Secondary actions */
--muted: oklch(0.552 0.016 285.938); /* Muted backgrounds */
--border: oklch(0.92 0.004 286.32); /* Borders */
--ring: oklch(0.705 0.015 286.067); /* Focus rings */
```

### 2.2. Using Design Tokens Correctly

```tsx
// ✅ CORRECT - Using semantic design tokens
<Card className="border-border bg-card text-card-foreground">
  <CardHeader>
    <CardTitle className="text-foreground">User Profile</CardTitle>
    <CardDescription className="text-muted-foreground">
      Manage your account settings
    </CardDescription>
  </CardHeader>
  <CardContent>
    <Button variant="secondary" className="bg-secondary text-secondary-foreground">
      Edit Profile
    </Button>
  </CardContent>
</Card>

// ❌ WRONG - Hardcoded colors (breaks theme consistency)
<Card className="bg-white border-gray-200 text-gray-900">
  <CardHeader>
    <CardTitle className="text-black">User Profile</CardTitle>
  </CardHeader>
</Card>
```

## 3. Component Patterns

### 3.1. Forms with Igniter.js API

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
import { CreateUserSchema } from "@/features/users/users.interfaces";

export function CreateUserForm() {
  const form = useForm({
    resolver: zodResolver(CreateUserSchema),
    defaultValues: {
      name: "",
      email: "",
    },
  });

  const createUser = api.users.create.useMutation({
    onSuccess: () => {
      form.reset();
      toast.success("User created successfully");
    },
    onError: (error) => {
      // Type-safe error handling
      toast.error(error.message);
    },
  });

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit((data) =>
          createUser.mutate({ body: data }),
        )}
      >
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Name</FormLabel>
              <FormControl>
                <Input {...field} className="bg-background border-border" />
              </FormControl>
              <FormMessage className="text-destructive" />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  type="email"
                  className="bg-background border-border"
                />
              </FormControl>
              <FormMessage className="text-destructive" />
            </FormItem>
          )}
        />

        <Button
          type="submit"
          disabled={createUser.isLoading}
          className="bg-primary text-primary-foreground hover:bg-primary/90"
        >
          {createUser.isLoading ? "Creating..." : "Create User"}
        </Button>
      </form>
    </Form>
  );
}
```

### 3.2. Dialogs with Igniter Client

```tsx
"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { api, useQueryClient } from "@/igniter.client";

export function DeleteUserDialog({ userId }: { userId: string }) {
  const [open, setOpen] = useState(false);
  const { invalidate } = useQueryClient();

  const deleteUser = api.users.delete.useMutation({
    onSuccess: () => {
      setOpen(false);
      invalidate(["users.list"]);
      toast.success("User deleted");
    },
  });

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="destructive" size="sm">
          Delete
        </Button>
      </DialogTrigger>
      <DialogContent className="bg-card border-border">
        <DialogHeader>
          <DialogTitle className="text-card-foreground">
            Delete User
          </DialogTitle>
          <DialogDescription className="text-muted-foreground">
            This action cannot be undone. Are you sure?
          </DialogDescription>
        </DialogHeader>
        <div className="flex gap-2 justify-end">
          <Button
            variant="outline"
            onClick={() => setOpen(false)}
            className="border-border"
          >
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={() => deleteUser.mutate({ params: { id: userId } })}
            disabled={deleteUser.isLoading}
          >
            {deleteUser.isLoading ? "Deleting..." : "Delete"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
```

### 3.3. Tables with Server Data

```tsx
"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { api } from "@/igniter.client";

export function UsersTable() {
  const { data: users, isLoading } = api.users.list.useQuery();

  if (isLoading) return <div>Loading...</div>;

  return (
    <Table className="border-border">
      <TableHeader>
        <TableRow className="border-border">
          <TableHead className="text-foreground">Name</TableHead>
          <TableHead className="text-foreground">Email</TableHead>
          <TableHead className="text-foreground">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {users?.data?.map((user) => (
          <TableRow key={user.id} className="border-border hover:bg-muted/50">
            <TableCell className="text-card-foreground">{user.name}</TableCell>
            <TableCell className="text-muted-foreground">
              {user.email}
            </TableCell>
            <TableCell>
              <Button variant="ghost" size="sm">
                Edit
              </Button>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
```

### 3.4. Dropdowns with Actions

```tsx
"use client";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { MoreHorizontal } from "lucide-react";

export function UserActionsDropdown({ userId }: { userId: string }) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm">
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="bg-card border-border">
        <DropdownMenuLabel className="text-card-foreground">
          Actions
        </DropdownMenuLabel>
        <DropdownMenuSeparator className="bg-border" />
        <DropdownMenuItem className="text-card-foreground hover:bg-muted">
          Edit User
        </DropdownMenuItem>
        <DropdownMenuItem className="text-card-foreground hover:bg-muted">
          View Details
        </DropdownMenuItem>
        <DropdownMenuSeparator className="bg-border" />
        <DropdownMenuItem className="text-destructive hover:bg-destructive/10">
          Delete User
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
```

## 4. Button Variants & Semantic Usage

```tsx
// ✅ CORRECT - Semantic variant usage
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

// ❌ WRONG - Overriding with hardcoded colors
<Button className="bg-red-500 text-white">Delete</Button>
```

## 5. Component Composition Patterns

### 5.1. Compound Components

```tsx
// ✅ CORRECT - Compound component pattern
function BoardActions({ children }: { children: React.ReactNode }) {
  return <div className="flex gap-2">{children}</div>;
}

function BoardActionsEdit({ boardId }: { boardId: string }) {
  return (
    <Button variant="outline" size="sm" className="border-border">
      <Edit className="h-4 w-4 mr-2" />
      Edit
    </Button>
  );
}

function BoardActionsDelete({ boardId }: { boardId: string }) {
  return (
    <Button variant="destructive" size="sm">
      <Trash className="h-4 w-4 mr-2" />
      Delete
    </Button>
  );
}

// Usage
<BoardActions>
  <BoardActionsEdit boardId={board.id} />
  <BoardActionsDelete boardId={board.id} />
</BoardActions>;
```

### 5.2. Controlled Components

```tsx
"use client";

import { useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export function StatusFilter() {
  const [status, setStatus] = useState<string>("all");

  return (
    <Select value={status} onValueChange={setStatus}>
      <SelectTrigger className="w-[180px] border-border bg-background">
        <SelectValue placeholder="Filter by status" />
      </SelectTrigger>
      <SelectContent className="bg-card border-border">
        <SelectItem value="all" className="text-card-foreground">
          All
        </SelectItem>
        <SelectItem value="active" className="text-card-foreground">
          Active
        </SelectItem>
        <SelectItem value="inactive" className="text-card-foreground">
          Inactive
        </SelectItem>
      </SelectContent>
    </Select>
  );
}
```

## 6. Loading & Empty States

### 6.1. Skeleton Loaders

```tsx
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

export function UserCardSkeleton() {
  return (
    <Card className="border-border bg-card">
      <CardHeader>
        <Skeleton className="h-4 w-[250px] bg-muted" />
        <Skeleton className="h-4 w-[200px] bg-muted" />
      </CardHeader>
      <CardContent>
        <Skeleton className="h-10 w-full bg-muted" />
      </CardContent>
    </Card>
  );
}
```

### 6.2. Empty States

```tsx
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";

export function EmptyUsersState() {
  return (
    <Card className="border-border bg-card">
      <CardContent className="flex flex-col items-center justify-center p-12">
        <PlusCircle className="h-12 w-12 text-muted-foreground mb-4" />
        <h3 className="text-lg font-semibold text-card-foreground mb-2">
          No users yet
        </h3>
        <p className="text-muted-foreground text-center mb-4">
          Get started by creating your first user
        </p>
        <Button className="bg-primary text-primary-foreground">
          Create User
        </Button>
      </CardContent>
    </Card>
  );
}
```

## 7. Accessibility Best Practices

### 7.1. Keyboard Navigation

```tsx
// ✅ CORRECT - Proper keyboard support
<Button
  onClick={handleClick}
  onKeyDown={(e) => e.key === 'Enter' && handleClick()}
  aria-label="Delete user"
>
  Delete
</Button>

// ✅ CORRECT - Focus management
<DialogContent className="focus:outline-none focus:ring-2 focus:ring-ring">
  {/* Dialog content */}
</DialogContent>
```

### 7.2. ARIA Labels

```tsx
// ✅ CORRECT - Descriptive ARIA labels
<Button aria-label="Close dialog" variant="ghost">
  <X className="h-4 w-4" />
</Button>

<Input
  aria-label="Search users"
  placeholder="Search..."
  type="search"
/>
```

## 8. Common Mistakes & Solutions

### 8.1. Component Mapping

| Need          | ✅ Use                        | ❌ DON'T Create |
| ------------- | ----------------------------- | --------------- |
| Modal/Popup   | `Dialog`                      | Custom modal    |
| Side panel    | `Sheet`                       | Custom sidebar  |
| Bottom drawer | `Drawer`                      | Custom drawer   |
| Context menu  | `DropdownMenu`                | Custom menu     |
| Hover info    | `Tooltip`                     | Custom tooltip  |
| Form inputs   | `Input`, `Select`, `Checkbox` | Custom inputs   |

### 8.2. Theming Mistakes

```tsx
// ❌ WRONG - Hardcoded design
<div className="bg-white text-gray-900 border border-gray-200 rounded-lg p-4">
  <h2 className="text-xl font-bold text-black">Title</h2>
</div>

// ✅ CORRECT - Using design tokens
<Card className="border-border bg-card">
  <CardHeader>
    <CardTitle className="text-card-foreground">Title</CardTitle>
  </CardHeader>
</Card>
```

## 9. Quality Checklist

Before considering a component complete:

- [ ] Component installed via `bunx shadcn@latest add`
- [ ] All colors use design tokens (no hardcoded values)
- [ ] Proper variant usage (primary/secondary/outline/ghost)
- [ ] Accessibility attributes (aria-label, role, etc.)
- [ ] Keyboard navigation works
- [ ] Loading states handled
- [ ] Error states handled
- [ ] Empty states handled
- [ ] Responsive design tested
- [ ] Dark mode compatible (via design tokens)

---

**Remember:** Shadcn/UI + Design Tokens = Consistent, maintainable UI. Never deviate from this pattern.

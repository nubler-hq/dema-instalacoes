# Task Discovery: Practical Task Patterns in Fractal

This guide maps real task usage patterns to the current Fractal implementation (`src/features/task/**`), so agents can execute work with governance instead of ad-hoc chat.

---

## 1. Lifecycle-Driven Execution

Use tasks as the source of truth for meaningful work:

1. `suggestion` for proactive opportunities.
2. `planning` to break work into todos.
3. `in_progress` for active execution.
4. `in_review` only after todos are complete.
5. `finished` as formal closure.

Why this matters: `task.service.ts` enforces allowed transitions and blocks invalid jumps.

---

## 2. Start or Resume Pattern

When work should begin, prefer:

```bash
fractal tasks start --task FRA-012
```

This command is designed to bootstrap execution context and preserve continuity instead of creating parallel, disconnected flows.

---

## 3. Todo-First Planning Pattern

Before coding, decompose the task:

```bash
fractal tasks todos create --task FRA-012 --description "Define schema"
fractal tasks todos create --task FRA-012 --description "Implement service"
fractal tasks todos create --task FRA-012 --description "Wire controller"
```

Why this matters: todo records (`src/features/task/services/todo.service.ts`) are first-class execution checkpoints and enable reliable status tracking.

---

## 4. Comment-as-Progress Pattern

Use task comments for operational traceability:

```bash
fractal tasks comment add \
  --task FRA-012 \
  --author "Atlas" \
  --author-type agent \
  --agent-id atlas \
  --body "Implemented service layer. Running targeted validation now."
```

Why this matters: comments are persisted artifacts, while chat alone is not enough for lifecycle audit.

---

## 5. Worktree Isolation Pattern

For risky or parallel work, configure worktree on task creation/update and use:

```bash
fractal tasks branch --task FRA-012
```

The task layer supports worktree-enabled execution and finish-time Git operations (`merge_to_main` or `create_branch`).

---

## 6. Safe Transition to Review Pattern

Move to review only when todos are done:

```bash
fractal tasks set_status --task FRA-012 --status in_review
```

If blocked, resolve pending todo statuses first:

```bash
fractal tasks todos set_status --task FRA-012 --id FRA-012-T002 --status finished
```

---

## 7. High-Signal Retrieval Pattern

For context resumption:

```bash
fractal tasks get --task FRA-012
fractal tasks todos list --task FRA-012
fractal tasks comment list --task FRA-012
fractal tasks prompt --task FRA-012
```

This sequence gives full execution state: metadata, plan, discussion trail, and canonical prompt.


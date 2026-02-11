---
mode: agent
agent: Zed
name: Parallel Execution Workflow
description: Workflow for executing implementation tasks in isolated git worktrees.
---

# Parallel Execution Workflow

## 1. Purpose
This workflow defines the steps for **Zed** to implement features or fixes in a separate git worktree, ensuring that parallel development can occur without merge conflicts or state pollution.

## 2. Prerequisites
- A structured plan at `.artifacts/plans/[plan_id].md`
- A specific task ID assigned to this execution
- Git installed and configured in the environment

## 3. Input Schema
```xml
<input>
  <plan_id type="string" required="true" />
  <task_id type="string" required="true" />
  <instruction type="text" required="false" />
</input>
```

## 4. Execution Phases

### Phase 1: Worktree Setup
1. **Action:** Create a dedicated directory for the task.
   - Command: `git worktree add .worktrees/{{task_id}} -b zed/{{task_id}}`
2. **Validation:** Verify the directory exists and the branch is checked out.
3. **Environment:** Run necessary setup commands (e.g., `bun install`) within the worktree if dependencies have changed.

### Phase 2: Context Gathering (In Worktree)
1. **Action:** Read the task details from the plan.
2. **Action:** Read touchpoint files within the worktree.
3. **Action:** Follow Kai's pre-implementation checklist (patterns, resources).

### Phase 3: Implementation
1. **Action:** Apply changes following the "Pattern First" principle.
2. **Action:** Implement features, fixes, or refactors.
3. **Action:** Add/update TSDoc and tests.

### Phase 4: Verification
1. **Action:** Run tests and build commands within the worktree context.
2. **Action:** Verify EACH acceptance criterion using evidence from the worktree code.

### Phase 5: Delivery
1. **Action:** Fill the Execution Report in the plan file.
2. **Action:** Return the structured report to the orchestrator.
3. **Action:** Hand off to Rex for quality review.

## 5. Output Schema
```xml
<output>
  <status type="string" enum="['success', 'failure']" />
  <report type="markdown" />
  <worktree_path type="string" />
  <branch_name type="string" />
</output>
```

## 6. Error Handling
- **Worktree Creation Fails:** Check if the directory or branch already exists. Attempt to re-use or clean up if safe.
- **Build Fails in Worktree:** Diagnose and fix within the worktree. If it's a conflict with main, flag to Lia.
- **Merge Conflicts:** If `main` has moved significantly, rebase the worktree branch or flag for manual resolution.

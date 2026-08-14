# Template Discovery: High-Leverage Scaffolding Patterns

This guide covers practical template usage patterns backed by the current template implementation (`src/features/template/**`).

---

## 1. Reuse Before Writing Pattern

Before hand-writing boilerplate:

```bash
fractal templates list
fractal templates get plan
```

Why this matters: templates centralize structure and reduce drift across repeated artifacts.

---

## 2. Schema-Validated Render Pattern

Render with explicit input data:

```bash
fractal templates render --template plan --data '{"name":"Auth Refactor"}'
```

The render flow validates input against template schema when present (`TemplateService.render` with AJV compile/validate).

---

## 3. Deterministic Output Pattern

Use output override when destination must be explicit:

```bash
fractal templates render \
  --template plan \
  --data '{"name":"Auth Refactor"}' \
  --output ".fractal/artifacts/plans/auth-refactor.plan.md"
```

Why this matters: avoids ambiguous writes and keeps automation reproducible.

---

## 4. Promote Repetition Into Template Pattern

When the same structure appears repeatedly:

```bash
fractal templates create \
  --name task-retro \
  --description "Post-task retro note scaffold" \
  --content "# Retro: {{task}}\n\n## Outcome\n{{outcome}}" \
  --output ".fractal/artifacts/retros/{{task}}.md"
```

---

## 5. Incremental Evolution Pattern

Templates evolve through partial update:

```bash
fractal templates update \
  --template task-retro \
  --description "Retro scaffold with outcome and learnings"
```

Use updates for safe refinement instead of delete/recreate.

---

## 6. Query by Intent Pattern

Use filters to find the right scaffold quickly:

```bash
fractal templates list --query "plan"
fractal templates list --skill browser
fractal templates list --byRule workflow
```

---

## 7. Safety Pattern for Destructive Operations

Inspect before deletion:

```bash
fractal templates get task-retro
fractal templates delete --template task-retro
```

Delete only when the template is truly obsolete.


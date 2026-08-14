# Skill Discovery: Capability Expansion Patterns

This guide documents practical patterns for discovering and evolving skills using the current skill feature (`src/features/skill/**`).

---

## 1. Capability Gap Scan Pattern

Before implementing from scratch:

```bash
fractal skills list --query "postgres"
```

If no local match exists, expand to community discovery:

```bash
fractal skills discovery --query "postgres migrations"
```

---

## 2. Community-First Install Pattern

Install only after discovery confirms relevance:

```bash
fractal skills install --source vercel-labs/agent-browser
```

Why this matters: `SkillService.install` performs source normalization, installation workflow, resource scanning, and local record upsert.

---

## 3. Local Capability Audit Pattern

After install, validate what was actually installed:

```bash
fractal skills get agent-browser
```

Review:

1. Description (triggering surface).
2. Active flag.
3. Metadata (`toolsets`, `resources`, `rules`).

---

## 4. Skill as Product Pattern

Create local skills when repeated domain workflows appear:

```bash
fractal skills create \
  --name release-ops \
  --description "Release governance, PR quality gates, and deployment readiness checks."
```

Then evolve with:

```bash
fractal skills update --id release-ops --description "Expanded release governance and rollback protocols."
```

---

## 5. Scoped Operation Pattern

Use skill scoping to keep agent behavior bounded:

1. Bind specialized agents to relevant skill IDs.
2. Keep references, templates, and toolsets inside that skill.
3. Avoid broad global rules when scope can be local.

---

## 6. Safe Retirement Pattern

Delete only after confirming no active dependency:

```bash
fractal skills get release-ops
fractal skills delete --id release-ops
```


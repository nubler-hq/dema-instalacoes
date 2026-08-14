# Skills Guide: Creation and Operations in Fractal

This guide defines how to design, create, evolve, and govern skills in Fractal. It is optimized for real Fractal usage, where skills are operational capability packages, not documentation dumps.

It is grounded in the current behavior of:

1. `src/features/skill/commands/*`
2. `src/features/skill/services/skill.service.ts`
3. `src/features/skill/skill.interfaces.ts`

---

## 1. What a Skill Is in Fractal

A skill is a bounded capability layer that changes how an agent behaves in a domain.

A good skill does five things:

1. Activates at the right time using a precise trigger description.
2. Guides execution with procedural rules that reduce ambiguity.
3. Provides reusable references without bloating prompt context.
4. Exposes deterministic execution surfaces through `toolsets/`.
5. Standardizes outputs through `templates/`, `views/`, and optional `collections/`.

Practical framing:

1. `SKILL.md` is the contract.
2. `references/` is the deep library.
3. `toolsets/` is execution power.
4. `templates/` and `views/` are output consistency.
5. `instructions/` is behavioral guardrail.
6. `collections/` is skill-local data model.

---

## 2. Command Surface

The current `fractal skills` group exposes:

1. `list`
2. `get`
3. `create`
4. `update`
5. `delete`
6. `discovery`
7. `install`

Recommended baseline flow:

```bash
fractal skills list --query "<domain>"
fractal skills discovery --query "<domain>"
fractal skills get <id>
```

---

## 3. Fractal Conventions and Non-Negotiables

### 3.1 Prefer Toolsets Over Scripts

For Fractal skills, execution should be standardized around `toolsets/`.

1. Do not model core behavior around `scripts/`.
2. Use toolsets for external integrations, deterministic actions, and reusable adapters.
3. Keep `scripts/` only as a temporary migration bridge when unavoidable.

Related references:

1. Toolsets: [Discovery](../discovery/toolset.md)
2. Toolsets: [Guide](./toolset.md)

### 3.2 Keep SKILL.md Lean, Keep references Rich

1. Put activation and process rules in `SKILL.md`.
2. Put domain depth, schemas, and large examples in `references/`.
3. Avoid duplicating the same long content in both.

### 3.3 Skill Content Must Match Real Features

When documenting a skill, always align with existing Fractal surfaces:

1. Collections model shape and query patterns.
2. Toolset input schema and call strategy.
3. View component model and `valuePath` usage.
4. Instruction scope and glob patterns.
5. Template schema and rendering behavior.

Related references:

1. Collections: [Discovery](../discovery/collections.md) and [Guide](./collections.md)
2. Views: [Discovery](../discovery/views.md) and [Guide](./views.md)
3. Instructions: [Discovery](../discovery/instructions.md) and [Guide](./instructions.md)
4. Templates: [Discovery](../discovery/templates.md) and [Guide](./templates.md)

---

## 4. Ideal SKILL.md Blueprint

Use this as a standard blueprint.

### 4.1 Frontmatter

Required fields:

1. `name`
2. `description`

`description` is activation logic. It should include:

1. Scope of capability.
2. Trigger contexts and keywords.
3. Non-goals or boundaries when critical.

Weak description example:

```md
description: Helps with APIs.
```

Strong description example:

```md
description: API integration execution for REST and MCP-backed services, including schema-first request planning, toolset discovery, payload validation, and error recovery. Trigger when user requests external service integration, endpoint calls, or connector automation.
```

### 4.2 Body Sections

Recommended sections:

1. Mission and scope boundary.
2. Mandatory behavior rules.
3. Canonical workflow steps.
4. Validation and error-handling rules.
5. Reference navigation map.
6. Operational examples.

### 4.3 Process Writing Standard

Every process section should:

1. Start with action verbs.
2. Include exact command examples.
3. Include expected output intent.
4. Include failure recovery branch.

---

## 5. Skill Creation Workflow (Fractal Cases)

### 5.1 Determine if New Skill Is Necessary

```bash
fractal skills list --query "<domain>"
fractal skills discovery --query "<domain>"
```

Create new only when:

1. Existing skills do not cover the domain.
2. Repeated workflow appears at least a few times.
3. Domain requires specialized process or tooling behavior.

### 5.2 Create the Skill Record

```bash
fractal skills create \
  --name release-ops \
  --description "Release governance, PR quality gates, deployment readiness, and rollback procedures."
```

### 5.3 Add Capability Surfaces

Populate only what the use case requires:

1. `references/` for domain rules and advanced guides.
2. `toolsets/` for deterministic execution.
3. `instructions/` for scoped behavior control.
4. `templates/` for repeated output patterns.
5. `views/` for read/report interfaces.
6. `collections/` for persisted domain state.

### 5.4 Validate and Tighten

```bash
fractal skills get release-ops
fractal skills update --id release-ops --description "..."
```

Review:

1. Trigger clarity.
2. Process completeness.
3. Reference coverage.
4. Redundancy and prompt bloat.

---

## 6. Designing Each Skill Surface

### 6.1 references/

Use references for:

1. Domain schemas.
2. Policy/protocol guides.
3. Detailed examples.
4. Decision tables.

Pattern:

1. Keep `SKILL.md` index-like.
2. Move heavy detail to specific files.
3. Load only necessary files during execution.

### 6.2 toolsets/

Use toolsets for:

1. API calls with validated payloads.
2. MCP-backed tools.
3. Deterministic command wrappers.

Rules:

1. Read tool schema before call.
2. Validate input structure first.
3. Avoid blind retries.

### 6.3 instructions/

Use instructions for:

1. Domain coding standards.
2. Safety constraints.
3. File-scope behavior via globs.

Rules:

1. Keep instructions actionable.
2. Scope narrowly when possible.
3. Avoid global rules for local concerns.

### 6.4 templates/

Use templates for:

1. Repeatable docs.
2. Config files.
3. Code skeletons.

Rules:

1. Attach schema when input shape matters.
2. Keep template IDs stable.
3. Use deterministic output paths when needed.

### 6.5 views/

Use views for:

1. Capability dashboards.
2. Operational review tables.
3. Aggregated status panels.

Rules:

1. Keep `getData` explicit.
2. Keep tree structure readable.
3. Bind `valuePath` to known data shapes.

### 6.6 collections/

Use collections when the skill needs stateful domain records.

Rules:

1. Define schema first.
2. Keep record shape stable.
3. Prefer explicit lifecycle fields over implicit meaning.

---

## 7. Quality Checklist Before Marking a Skill Ready

### 7.1 Trigger Quality

1. Does description clearly state when to trigger?
2. Does it include domain keywords the user will likely use?
3. Does it avoid vague wording?

### 7.2 Process Quality

1. Are workflows executable step-by-step?
2. Are there command examples for key actions?
3. Is failure handling explicit?

### 7.3 Architecture Quality

1. Are capabilities split correctly between `SKILL.md` and `references/`?
2. Are tool interactions routed via `toolsets/`?
3. Are templates/views/instructions linked where relevant?

### 7.4 Context Economy

1. Is `SKILL.md` lean?
2. Is heavy content moved to references?
3. Is duplication minimized?

---

## 8. Anti-Patterns to Avoid

1. Bloated `SKILL.md` with large encyclopedic content.
2. Weak trigger descriptions that never activate reliably.
3. Process text without concrete commands.
4. Tool instructions that ignore schema validation.
5. Copying large docs into `SKILL.md` instead of `references/`.
6. Using scripts as the primary execution path in Fractal skills.
7. Creating cross-cutting instructions with broad glob scope when local scope would work.

---

## 9. Installation and Discovery Behavior

`SkillService.install` currently orchestrates:

1. Source normalization.
2. Install execution.
3. Installed-resource scan.
4. Local skill record upsert.

Post-install validation:

```bash
fractal skills list --query "<installed-id>"
fractal skills get <installed-id>
```

---

## 10. Lifecycle Governance for Skills

### 10.1 Evolve Safely

Use `update` for iterative refinement:

```bash
fractal skills update --id release-ops --description "..."
```

Keep backward compatibility whenever agents already depend on the skill.

### 10.2 Retire Safely

Before deletion:

1. Check dependent agents.
2. Check task/workflow references.
3. Prefer deactivation strategy first when uncertain.

Then:

```bash
fractal skills delete --id release-ops
```

---

## 11. Recommended Agent Behavior with Skills

When a request enters a repeated domain:

1. Search local skills first.
2. Discover community options if absent.
3. Install only when there is clear fit.
4. Read local `SKILL.md` first.
5. Load only the needed `references/*` for the current task.
6. Use toolsets for execution.
7. Persist reusable learnings into memory and feed back into skill refinements.

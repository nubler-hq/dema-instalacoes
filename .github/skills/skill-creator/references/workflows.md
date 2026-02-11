# Workflow Patterns

## Sequential Workflows

For complex tasks, break operations into clear, sequential steps. It is often helpful to give Claude an overview of the process towards the beginning of SKILL.md:

```markdown
Filling a PDF form involves these steps:

1. Analyze the form (run analyze_form.py)
2. Create field mapping (edit fields.json)
3. Validate mapping (run validate_fields.py)
4. Fill the form (run fill_form.py)
5. Verify output (run verify_output.py)
```

## Conditional Workflows

For tasks with branching logic, guide Claude through decision points:

```markdown
1. Determine the modification type:
   **Creating new content?** → Follow "Creation workflow" below
   **Editing existing content?** → Follow "Editing workflow" below

2. Creation workflow: [steps]
3. Editing workflow: [steps]

---

## Library Skill Audit Workflow

Use this when creating or updating a library skill to guarantee completeness.

1. Entry points & exports
   - `list-entrypoints.ts`
   - `list-exports.ts`
2. Public API mapping
   - `extract-public-api.ts`
3. Deep API docs (params/returns)
   - `extract-api-doc.ts`
4. TSDoc coverage
   - `find-missing-tsdoc.ts`
5. Symbol tracing for critical APIs
   - `symbol-map.ts`
   - `extract-symbol-doc.ts`
6. Package overview
   - `package-graph.ts`
7. Consolidate into a single report
   - `skill-audit.ts`
```
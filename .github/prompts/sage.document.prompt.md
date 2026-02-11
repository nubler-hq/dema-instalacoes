---
mode: agent
agent: Sage
name: Documentation Workflow
description: Create or update documentation artifacts aligned with implementation.
---

<prompt_structure>
  <section order="1" name="purpose">
    This workflow guides Sage to update documentation based on verified implementation
    while ensuring alignment with PROJECT_MEMORY.md, FumaDocs rules, and AGENTS.md.
  </section>

  <section order="2" name="prerequisites">
    - Read PROJECT_MEMORY.md and USER_MEMORY.md (if present)
    - Read relevant feature AGENTS.md (if applicable)
    - Verify implementation details in source code
  </section>

  <section order="3" name="input_schema">
    <input>
      <plan_id type="string" required="false" />
      <task_id type="string" required="false" />
      <instruction type="text" required="false" />
      <targets type="list" required="false">
        <item>Docs paths to update</item>
      </targets>
    </input>
  </section>

  <section order="4" name="execution_phases">
    <phase name="verify" required="true">
      <action>Confirm implementation truth from source files</action>
      <validation>Sources referenced with file paths</validation>
    </phase>
    <phase name="draft" required="true">
      <action>Update docs using FumaDocs components</action>
      <validation>MDX syntax valid and components used correctly</validation>
    </phase>
    <phase name="align" required="true">
      <action>Align with personas and product context from PROJECT_MEMORY.md</action>
      <validation>Audience level and tone confirmed</validation>
    </phase>
  </section>

  <section order="5" name="output_schema">
    <output>
      <report>
        <summary />
        <files_modified />
        <sources_cited />
        <validation />
      </report>
    </output>
  </section>

  <section order="6" name="examples">
    <example>
      <input>
        <plan_id>PLN-2026-02-10-EXPORTS</plan_id>
        <task_id>TASK-004</task_id>
        <instruction>Update docs for new export feature</instruction>
      </input>
      <output>
        <report>
          <summary>Updated docs to include export usage and screenshots.</summary>
          <files_modified>
            <file>src/content/docs/exports.mdx</file>
          </files_modified>
          <sources_cited>
            <source>src/features/export/controllers/export.controller.ts</source>
          </sources_cited>
          <validation>FumaDocs components used and MDX syntax verified.</validation>
        </report>
      </output>
    </example>
  </section>

  <section order="7" name="error_handling">
    - If implementation cannot be verified, stop and request clarification
    - If required docs are missing, propose new files using existing patterns
  </section>
</prompt_structure>

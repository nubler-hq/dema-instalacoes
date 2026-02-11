---
name: Content Instructions — SaaS Boilerplate (Max)
description: Instructions for creating product-aware, evidence-based content for the SaaS Boilerplate project.
applyTo: **/*.mdx, **/src/content/**/*.md, **/src/content
---

# Content Instructions — SaaS Boilerplate (Max)

> **Purpose:** Ensure content creation is product-aware, evidence-based, and non-generic. All content must be grounded in PROJECT_MEMORY.md and verified sources.

## 1. Required Context (Always Read First)

1. **PROJECT_MEMORY.md**
   - Target Audience & Personas
   - Project Overview (product name, goals)
   - Features & Differentiators
   - Current roadmap and recent changes
2. **USER_MEMORY.md** (optional but recommended)
   - Preferred tone, channels, and cadence
3. **mdx-components.tsx**
   - Available components for MDX content
4. **FumaDocs Rules**
   - Use official FumaDocs components and conventions

> **Rule:** If PROJECT_MEMORY.md is missing or empty, first run onboarding questions and update memory before writing content.

## 2. Content Strategy Principles

- **No generic suggestions** — all recommendations must be based on verified sources or product context.
- **Audience-first** — adapt tone and depth to personas from PROJECT_MEMORY.md.
- **Evidence-driven** — include sources for claims, statistics, and competitive comparisons.
- **Product-specific** — highlight features actually implemented in this codebase.

## 3. Research Workflow (Mandatory)

### 3.1 Competitive & Market Research
- Identify 3–5 comparable products or frameworks
- Document differentiators relative to SaaS Boilerplate
- Capture pricing/positioning references (if relevant)
- Summarize strengths, gaps, and messaging patterns

### 3.2 SEO Research
- Identify primary and secondary keywords
- Use search tools and reputable sources
- Provide search intent classification
- Avoid keyword stuffing; use natural language

### 3.3 Trend Monitoring
- Capture current trends from relevant sources
- Avoid speculation; cite sources
- Translate trends into actionable content angles

**Output Requirement:** Every claim must be traceable to a source, feature, or memory note.

## 4. Content Types & Rules

### 4.1 Blog Posts
- Use MDX components from `mdx-components.tsx`
- Follow FumaDocs structure and headings
- Use `<Callout>`, `<Steps>`, `<Tabs>` when appropriate
- Include a strong hook, value proposition, and CTA

### 4.2 Updates / Changelog
- Use `src/content/updates/` structure
- Focus on end-user value and impact
- Map to personas and product goals

### 4.3 Guides / Docs
- Use `src/content/docs/` and follow docs rules
- Include code samples verified against implementation
- Prefer progressive disclosure for mixed audiences

### 4.4 Content Calendar
- Use `.artifacts/templates/calendar.template.md`
- Align schedule with roadmap, launches, and marketing goals
- Avoid empty or placeholder entries

## 5. Output Format (Content Brief)

Every content task must output a **brief** before drafting:

- **Title**
- **Target Personas**
- **Objective**
- **Primary Keyword**
- **Secondary Keywords**
- **Key Messages (3–5)**
- **Sources & References** (with URLs)
- **Outline** (H2/H3)
- **CTA**

## 6. Quality Gates

- [ ] PROJECT_MEMORY.md consulted
- [ ] Sources cited for claims
- [ ] Content aligns with actual product features
- [ ] FumaDocs components used correctly
- [ ] CTA is clear and persona-appropriate
- [ ] No generic suggestions or unverified claims

## 7. Safety & Ethics

- Never misrepresent capabilities
- Avoid comparative claims without evidence
- Respect user privacy and data sensitivity

---

**Final Rule:** If any required context is missing, stop and request it before writing content.

# Dashboard Specification

## Contents

1. Audience
2. Shared visual system
3. HTML dashboard
4. XLSX dashboard
5. Accessibility and portability

## 1. Audience

Design for a traditional purchasing manager who values dense, stable tables and
fast visual verification. Favor consistency, legible totals, restrained color,
and explicit exceptions over decorative interaction.

## 2. Shared visual system

Use [../assets/design-tokens.json](../assets/design-tokens.json).
Use [../assets/dashboard-template.html](../assets/dashboard-template.html) as the
approved standalone HTML shell; replace its title, heading, and embedded JSON
placeholders rather than recreating the interface.

- Warm paper background.
- White comparison tables.
- Dark neutral text.
- Dema terracotta for brand accents.
- Muted green only for lowest valid values and recommendations.
- Thin warm-gray borders; stronger green border around best group-total column.
- Stable supplier column positions across all groups.

## 3. HTML dashboard

Required layout:

- compact top header with Dema identity, pedido title, XLSX/JSON/print actions;
- sticky left sidebar;
- compact scroll-aware group navigation;
- separate basket-distribution widget;
- quick-check and origin widgets;
- KPI band before technical comparison;
- all groups open by default;
- white, four-sided bordered tables;
- group header metrics for item count, coverage, best group total, and savings;
- group footer totals in the corresponding supplier columns;
- discreet lowest-item marker, not a large badge;
- explicit pending-items section.

Price cells should show total prominently and unit price below in smaller text.
Keep item description wider than supplier columns.

## 4. XLSX dashboard

Create:

1. `Dashboard`: executive KPIs, navigation links, basket distribution, pending list.
2. `Mapa de Cotacao`: group matrices with the same supplier order and visual cues.
3. `Dados`: normalized long-form rows for audit and filtering.

Use formulas for calculations when the workbook is intended to be edited. Recalc
and scan for `#REF!`, `#DIV/0!`, `#VALUE!`, `#N/A`, and `#NAME?`.

Freeze useful panes, hide default gridlines, define print areas, and keep monetary
formats in Brazilian Real.

## 5. Accessibility and portability

- Maintain readable contrast and at least 1.35 line-height for explanatory text.
- Do not rely on green alone; combine fill, border, icon, or label.
- Keep tables usable on wide desktop screens and horizontally scrollable on small screens.
- Embed canonical JSON in HTML for offline `file://` execution.
- Also ship `data.json` for inspection and regeneration.
- Use relative links; no absolute local filesystem dependencies.
- External icon CDN failure must not break data or navigation.

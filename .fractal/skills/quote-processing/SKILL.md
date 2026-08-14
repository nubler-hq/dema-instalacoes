---
name: quote-processing
description: >
  Process supplier quotations and generate Dema Instalacoes purchase artifacts
  end to end: discover quote emails and attachments, reconcile customers and
  suppliers, register quotes with pedido number and material type, synchronize
  the quotes collection with .fractal/drive, generate a normalized XLSX beside
  each source PDF, and build comparison-map packages with data.json,
  DASHBOARD.html and DASHBOARD.xlsx. Use when handling a new supplier quote,
  recovering missing quotations, auditing a pedido, generating or updating a
  mapa de cotacao, producing supplier spreadsheets, or preparing purchase orders.
---

# Quote Processing

## Operating principle

Maintain three synchronized representations:

1. **Email** is the immutable source evidence.
2. **Collections** are the structured, queryable record.
3. **`.fractal/drive`** is the canonical operational file hierarchy.

Never generate a map directly from an isolated attachment. First reconcile all
three representations for the requested pedido.

## Required skills and resources

Load these skills when their capability is needed:

- `email`: search messages, read bodies, and download trusted attachments.
- `drive`: enforce the Dema folder and filename conventions.
- `xlsx`: inspect, generate, recalculate, and validate spreadsheets.
- `pdf`: inspect PDF layout or extract difficult tables.
- `frontend-design`: modify the dashboard visual system.

Read the bundled references according to the task:

- New quote or email ingestion: [quote-ingestion.md](references/quote-ingestion.md)
- Drive and filenames: [drive-contract.md](references/drive-contract.md)
- Collection fields and identity rules: [data-contract.md](references/data-contract.md)
- Map generation and matching: [map-algorithm.md](references/map-algorithm.md)
- HTML/XLSX presentation: [dashboard-spec.md](references/dashboard-spec.md)
- Final checks and failure recovery: [validation.md](references/validation.md)

## Intake gate

For **map generation**, obtain exactly these three identifiers before searching:

1. `pedido number` — normalize to three digits, for example `006`.
2. `type` — preserve the Portuguese canonical value, for example `Elétrica`.
3. `customer/obra` — resolve to a record in `customers` and its Drive obra name.

Ask only for values that cannot be established from the current conversation.
Repeat the resolved identity before writing:

```text
Pedido 006 | Elétrica | WISE
```

For a **single incoming quote**, infer these values from the email and existing
records, but confirm any ambiguous pedido number, type, or customer before saving.

## Source discovery order

Discover all evidence in this order and merge the results:

1. Search `.fractal/drive/Obras/{OBRA}/Pedidos/{NUMBER}-{TYPE}/Orçamentos/`.
2. Query `quotes` by `customer + number + type`.
3. Search email by customer, pedido, supplier, proposal number, and attachment name.
4. Compare supplier coverage across the three sources.

Do not silently ignore a source mismatch. Report missing PDFs, missing records,
missing XLSX sidecars, duplicate proposals, and records pointing to nonexistent
files.

## New quote workflow

Execute in this order:

1. **Read the email** and identify the exact message/envelope ID.
2. **Download the attachment** to a temporary location:
   `.fractal/downloads/{email_id}-{attachment_name}.pdf`.
   This preserves the original email attachment untouched.
3. **Extract** supplier, proposal/reference, customer, pedido, type, dates, commercial
   terms, totals, and every item.
4. **Resolve pedido number** using the following order of precedence (NEVER ask the
   user if a higher-precedence source exists):
   a. **Explicit in email** — number in the email body or subject from the supplier or
      Ademar.
   b. **Item match** — list other quotes for the SAME customer in the collection
      `quotes` and compare item descriptions, references, or quantities. If the items
      match an existing pedido, use that same number (this prevents creating two
      pedidos with identical item lists).
   c. **Last number + 1 by type** — if neither of the above works, search the emails
      for the most recent pedido number used for that customer. Increment by 1
      according to the `type` (Elétrica, Hidráulica, Fixação, etc.). Each type has
      an independent counter.
   d. **First pedido** — if the customer has no previous pedidos, start at `001` for
      the given type.
   Always repeat the resolved identity back to the user before writing:
   `Pedido {number} | {type} | {obra}`.
5. **Resolve `customer` and `supplier` collection IDs**. Reuse existing records before
   creating new ones. For supplier: if IE is missing, trigger the IE recovery workflow
   (search email, NFe, etc.) and update all related pedidos.
6. **Detect duplicates** using the identity tuple:
   `customer + number + type + supplier + normalized proposal`.
7. Create or update the `quotes` record with `status: "quoted"` (represented visually as "Análise Comercial") and complete source
   provenance.
8. Save a copy of the original attachment as:
   `Orçamentos/Orcamento-{Supplier}-{Reference}.pdf`.
9. Generate the normalized spreadsheet beside it with the same stem:
   `Orçamentos/Orcamento-{Supplier}-{Reference}.xlsx`.
10. Update `sourceFile`, `normalizedFile`, `email`, hashes, and timestamps in the
    quote record.
11. **Clean up the temporary attachment** from `.fractal/collections/quotes/_tmp/`.
12. Run the synchronization audit before reporting completion.

Never overwrite original evidence. If a revised quote arrives, preserve the old
file and create a revision or complementary filename as defined in
[drive-contract.md](references/drive-contract.md).

## Map generation workflow

After the intake gate:

1. Audit the pedido with `audit_pedido`.
2. Recover or process any supplier evidence that exists only in email.
3. Ensure every supplier PDF has a normalized XLSX and collection record.
4. Build one canonical map JSON following
   [assets/mapa-cotacao.schema.json](assets/mapa-cotacao.schema.json).
5. Match items conservatively according to
   [map-algorithm.md](references/map-algorithm.md).
6. Keep uncertain equivalences and missing prices visible as pending items.
7. Calculate:
   - lowest price per item;
   - suggested basket by supplier;
   - group totals by supplier;
   - lowest complete or best-covered group option;
   - savings and unresolved-item counts.
8. Generate the package in the pedido's `Mapa de Cotação/` folder:
   - `data.json`;
   - `DASHBOARD.html`;
   - `DASHBOARD.xlsx`;
   - optional source map workbook using the long archival name.
9. Validate paths, JSON, XLSX formulas, HTML rendering, links, and totals.
10. Update quote records with the map package path or map ID when supported.

The short dashboard names are the shareable working package. Long archival names
may coexist, but `DASHBOARD.html`, `DASHBOARD.xlsx`, and `data.json` must always
refer to the same generation.

## Toolset

Use `quote-processing::default`:

- `audit_pedido`: reconcile collection records and Drive files before generation.
- `generate_quote_spreadsheet`: generate the XLSX sidecar beside a supplier PDF.
- `generate_order`: backward-compatible alias for spreadsheet generation.
- `generate_map_package`: render `data.json`, `DASHBOARD.html`, and
  `DASHBOARD.xlsx` from a validated canonical JSON file.

Read exact schemas with `fractal toolsets get quote-processing::default --tool
{tool}` before calling a tool. Do not guess tool payloads.

## Non-negotiable rules

- Treat email as evidence, not as the queryable database.
- Store collection references by record ID, never duplicated customer/supplier objects.
- Use the same `number` and canonical `type` across every supplier quote in a map.
- Never invent a quote price, item equivalence, proposal number, or commercial term.
- Compare unit prices only after unit and quantity normalization.
- Preserve original supplier descriptions in provenance fields.
- Do not select a supplier as the best group merely because its partial quote is cheap.
- Keep supplier columns in a stable order across all map groups.
- Keep the dashboard standalone; core data must work without a web server.
- Use relative links inside the dashboard package.
- Do not send email or approve purchases without explicit user authorization.

## Completion report

Report:

- resolved pedido identity;
- suppliers discovered and processed;
- collection records created or updated;
- original PDFs and normalized XLSX files;
- map package paths;
- unresolved items, equivalences, and source mismatches;
- validation result.

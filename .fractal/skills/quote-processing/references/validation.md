# Validation and Recovery

## Contents

1. Pre-generation audit
2. Quote-sidecar validation
3. Map validation
4. Completion gate
5. Recovery

## 1. Pre-generation audit

Verify:

- pedido identity resolves to one customer, number, and canonical type;
- each collection record has a valid supplier;
- each active quote has an email ID or documented manual source;
- each active PDF exists;
- each PDF has an XLSX sidecar with the same stem;
- no duplicate proposal identity exists;
- source hashes do not conflict;
- all suppliers intended for the map are included.

## 2. Quote-sidecar validation

- Workbook opens successfully.
- Supplier, proposal, customer, pedido, and type match the collection.
- Item count matches the extracted record.
- Quantities and units preserve source values.
- Unit price × quantity reconciles to line total or contains an explicit conversion note.
- Totals reconcile to the supplier document, allowing documented taxes/freight.
- No formula errors exist.

## 3. Map validation

- `data.json` parses and validates against the bundled schema.
- Supplier IDs resolve.
- Every offer points to a valid quote and item index.
- Stable supplier order is identical in every group.
- Each non-pending group has at least one priced supplier.
- Group coverage counts match item rows.
- Basket allocations sum to the basket total.
- Pending count matches `pendingItems.length`.
- HTML loads from `file://` without JavaScript errors.
- HTML actions resolve to `./DASHBOARD.xlsx` and `./data.json`.
- XLSX opens and internal navigation links work.
- HTML and XLSX totals agree with JSON within one cent.

## 4. Completion gate

Complete only when:

```text
[ ] Email evidence identified
[ ] Collection synchronized
[ ] Original PDF saved
[ ] XLSX sidecar generated
[ ] Pedido audit clean or exceptions reported
[ ] data.json generated
[ ] DASHBOARD.html generated and rendered
[ ] DASHBOARD.xlsx generated and verified
[ ] Pending items reported
```

## 5. Recovery

- Missing email: retain Drive/collection evidence and mark source as manual or unknown.
- Missing PDF: search email; do not regenerate fake evidence from collection data.
- Missing collection record: create it from verified PDF/email data.
- Missing sidecar: regenerate from the quote record and validate against PDF.
- Conflicting quote versions: preserve both, mark active revision, and rebuild the map.
- Ambiguous item match: move to pending; never force a match to improve coverage.
- Broken dashboard: regenerate all three short package files from the same JSON.


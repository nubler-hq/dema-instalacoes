# Map Algorithm

## Contents

1. Canonical item list
2. Matching hierarchy
3. Unit normalization
4. Group construction
5. Recommendation calculations
6. Pending states

## 1. Canonical item list

Prefer the original customer request or the most complete approved item list as
the canonical spine. Supplier quotes contribute offers to this list; they do not
silently redefine requested quantities.

Assign each canonical item a stable `id` and `position`.

## 2. Matching hierarchy

Match supplier rows to canonical items in this order:

1. explicit persisted relation;
2. exact customer item/reference code;
3. exact normalized manufacturer reference;
4. exact canonical position when the quote preserves request order;
5. exact normalized description plus compatible dimensions/unit;
6. fuzzy candidate requiring human confirmation.

Do not automatically match when size, material, voltage, schedule, thread, color,
or pack unit differs materially.

Persist relations as:

```json
{
  "supplierId": "...",
  "quoteId": "...",
  "quoteItemIndex": 12,
  "matchMethod": "reference",
  "confidence": 1,
  "approved": true
}
```

## 3. Unit normalization

Calculate comparison prices only after conversion:

```text
comparisonQuantity = requestedQuantity in canonical unit
comparisonUnitPrice = supplier total / equivalent canonical quantity
comparisonTotal = comparisonUnitPrice × requestedQuantity
```

Record conversion factor and explanation. Examples requiring attention:

- bar versus piece;
- meter versus three-meter bar;
- box/pack versus unit;
- hundred/thousand pricing;
- tax-inclusive versus tax-exclusive totals.

## 4. Group construction

Build technical families understandable to a purchaser, not arbitrary chunks.
Each group must contain at least one quoted supplier. Keep unquoted items in a
dedicated pending group instead of showing an empty comparison matrix.

Supplier column order must be globally stable. Highlight the lowest group-total
column visually; do not reorder columns per group.

For each supplier/group calculate:

- quoted item count;
- coverage percentage;
- total of quoted lines;
- complete-group total only when all required lines are covered.

## 5. Recommendation calculations

### Lowest-price basket

For each resolved item, choose the lowest valid comparison unit price. Aggregate
chosen lines by supplier. This is the maximum price-saving suggestion before
freight, minimum order, payment terms, and operational consolidation.

### Group recommendation

Prefer, in order:

1. lowest complete-group total;
2. if no complete supplier exists, highest coverage;
3. use total price only as a tiebreaker among equal coverage;
4. clearly label partial recommendations.

### Savings

Define and label the baseline. Recommended default:

```text
savings = sum(highest valid item total - lowest valid item total)
```

Never imply savings for unresolved items.

### Commercial constraints

Expose freight, payment terms, delivery, minimum billing, and validity. Do not
automatically optimize them into the recommendation unless the calculation model
explicitly supports those constraints.

## 6. Pending states

An item is pending when:

- no supplier quoted it;
- every price is invalid;
- unit conversion is unresolved;
- technical equivalence is unapproved;
- requested quantity is missing;
- duplicate/conflicting source rows exist.

Pending items must remain visible in the KPI count, navigation, JSON, HTML, and
XLSX. A map with pending items is valid for analysis but must not be presented as
a complete purchase decision.


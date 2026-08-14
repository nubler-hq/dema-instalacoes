# Data Contract

## Contents

1. Collection roles
2. Quote record
3. Item record
4. Map JSON
5. Provenance and synchronization

## 1. Collection roles

- `customers`: obra identity, legal/billing data, template references.
- `suppliers`: supplier identity and contact/commercial defaults.
- `quotes`: one supplier proposal for one pedido number and type.

Use collection IDs for relations. The map JSON may embed resolved snapshots for
portability, but collection records remain normalized.

## 2. Quote record

Required identity:

```json
{
  "customer": "customer-record-id",
  "supplier": "supplier-record-id",
  "number": "006",
  "type": "Elétrica",
  "status": "quoted"
}
```

Recommended traceability:

```json
{
  "quote": "241.393",
  "email": "63835",
  "sourceFile": ".fractal/drive/.../Orcamento-A3-Eletro-241393.pdf",
  "normalizedFile": ".fractal/drive/.../Orcamento-A3-Eletro-241393.xlsx",
  "sourceAttachmentName": "COTACAO 241393.pdf",
  "sourceHash": "sha256:...",
  "normalizedHash": "sha256:...",
  "comparisonStatus": "ready",
  "revision": 1
}
```

## 3. Item record

Preserve source and normalized values:

```json
{
  "position": 1,
  "description": "ELETRODUTO GALV PESADO 4 3MTS",
  "sourceDescription": "ELETRODUTO ...",
  "reference": "ELEPZN0040",
  "manufacturer": "GFC",
  "ncm": "7306.30.90",
  "quantity": 80,
  "unit": "PC",
  "sourceQuantity": 80,
  "sourceUnit": "BR",
  "unitPrice": 248,
  "totalPrice": 19840,
  "comparisonUnitPrice": 248,
  "comparisonTotalPrice": 19840,
  "notes": "BR tratado como PC após validação"
}
```

Never discard the source quantity/unit when converting.

## 4. Map JSON

Validate against [../assets/mapa-cotacao.schema.json](../assets/mapa-cotacao.schema.json).
Core top-level fields:

- `id`, `name`, `number`, `type`;
- `customer` snapshot;
- `suppliers` snapshots;
- `quotes` source records;
- `items` canonical item list;
- `groups`;
- `basket`;
- `pendingItems`;
- `summary`;
- `timestamps`;
- `source`.

Every item offer must identify the supplier ID and the original quote/item
position. This prevents ambiguous joins after sorting.

## 5. Provenance and synchronization

For each generated value, retain enough information to answer:

- Which email introduced it?
- Which PDF contains it?
- Which quote record owns it?
- Which source item/row produced it?
- Was the quantity or unit converted?
- Was the equivalence manually approved?
- Which generation timestamp produced the current dashboard?

Use ISO 8601 timestamps. Use SHA-256 for file hashes.


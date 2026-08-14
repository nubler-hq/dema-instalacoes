# Drive Contract

## Contents

1. Canonical hierarchy
2. Supplier quote pair
3. Map package
4. Purchase-order output
5. Portability

## 1. Canonical hierarchy

```text
.fractal/drive/Obras/{OBRA}/Pedidos/{NUMBER}-{TYPE}/
├── Orçamentos/
└── Mapa de Cotação/
```

Create missing directories before writing. Preserve accents in folder names and
use the canonical Portuguese type.

## 2. Supplier quote pair

Every processed supplier quote should form a pair:

```text
Orçamentos/Orcamento-{Supplier}-{Reference}.pdf
Orçamentos/Orcamento-{Supplier}-{Reference}.xlsx
```

The XLSX is a normalized Dema representation of the PDF, not a replacement for
the original evidence. Its stem must exactly match the PDF stem.

Examples:

```text
Orcamento-A3-Eletro-241393.pdf
Orcamento-A3-Eletro-241393.xlsx
Orcamento-FF-Guarulhos-Complementar-847908.pdf
Orcamento-FF-Guarulhos-Complementar-847908.xlsx
```

## 3. Map package

Write the current shareable package as:

```text
Mapa de Cotação/
├── data.json
├── DASHBOARD.html
└── DASHBOARD.xlsx
```

Optionally retain archival files:

```text
MAPA_DE_COTACAO_REF_PEDIDO_{NUMBER}_{TYPE_ASCII}_{OBRA}_{DDMMYYYY}.xlsx
MAPA_DE_COTACAO_REF_PEDIDO_{NUMBER}_{TYPE_ASCII}_{OBRA}_{DDMMYYYY}.json
MAPA_DE_COTACAO_REF_PEDIDO_{NUMBER}_{TYPE_ASCII}_{OBRA}_{DDMMYYYY}.html
MAPA_DE_COTACAO_REF_PEDIDO_{NUMBER}_{TYPE_ASCII}_{OBRA}_{DDMMYYYY}_DASHBOARD.xlsx
```

Regenerate the three short files together so they never represent different
versions.

## 4. Purchase-order output

Approved purchase orders are distinct from supplier quote sidecars. Save them
according to the Drive skill's purchase-order convention. Do not confuse:

- `Orcamento-*.xlsx`: supplier quote normalized for comparison.
- `PEDIDO_*.xlsx`: Dema purchase order issued to a selected supplier.

## 5. Portability

Inside `DASHBOARD.html`:

- link to `./DASHBOARD.xlsx`;
- link to `./data.json`;
- embed the same JSON as a fallback for `file://` use;
- avoid absolute paths;
- keep local navigation as hash links.

Inside JSON provenance, prefer workspace-relative paths beginning with
`.fractal/drive/`. Absolute host paths may be recorded only as optional diagnostic
metadata and must not be required for operation.


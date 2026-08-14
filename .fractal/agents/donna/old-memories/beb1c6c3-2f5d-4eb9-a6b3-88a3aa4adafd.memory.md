---
title: 'Dashboard Dema — Components: PedidoKanban & ObraKanban'
description: >-
  Architecture and logic of the two kanban components: PedidoKanban (quote
  groups by pedido, 5 status columns, supplier offer comparison, best-price
  star) and ObraKanban (4-column obra status kanban).
category: architecture
tags:
  - dashboard
  - components
  - kanban
  - pedidokanban
  - obrakanban
  - react
  - grouping
  - offers
agent: donna
confidence: 1
links:
  - ea72cd6d-18a5-4b5e-830e-860ba081d62d
supersedes: []
status: active
scopes:
  - .fractal/artifacts/dashboard/source/src/components/**/*.jsx
createdAt: '2026-06-24T21:08:26.565Z'
updatedAt: '2026-06-24T21:08:26.565Z'
---
# Dashboard Dema — Components: PedidoKanban & ObraKanban

## PedidoKanban (`source/src/components/PedidoKanban.jsx`)

### Purpose
Groups **quotes** by (pedidoNumber + type + customer) key to form order groups, then distributes them across 5 status columns.

### Grouping Logic
- Key: `${pedidoNumber}::${type}::${customer}`
- All quotes sharing the same `pedidoNumber` + `type` + `customer` form one order group
- Each group is a card showing: number, type badge, obra link, supplier tags, item count ratios, total value

### Column Configuration

| Column ID | Label | Description | Badge Color |
|-----------|-------|-------------|-------------|
| `draft` | Lista de Materiais | Blue (pending) — still being assembled |
| `pending` | Em Cotação | Yellow (warning) — being sent to suppliers |
| `quoted` | Análise Comercial | Purple — offers received, under review |
| `approved` | Aprovado pelo Diretor | Green (success) — commercial approval done |
| `sent` | Pedido Emitido | Gray (muted) — order formally placed |

### Offer Comparison Features
- Each card lists all supplier offers within that order group
- **Best price is highlighted** with a ★ star icon and a green accent
- Each offer shows: supplier name, value, status badge, PDF/XLSX download links
- Column total is calculated and displayed at the bottom of each column
- `itemRatio` helper: shows `${offersWithItems.length}/${totalOffers}` for item count coverage

### Data Processing
- Takes `quotes` array and `suppliers` array as props
- Groups by the compound key
- Sorts by `type` then `pedidoNumber` within each column
- Scrolls each column independently

## ObraKanban (`source/src/components/ObraKanban.jsx`)

### Purpose
Groups **customers** (obras) by status across 4 columns.

### Column Configuration

| Column ID | Label | Description |
|-----------|-------|-------------|
| `lead` | Estudo | Initial study phase |
| `quoting` | Em Cotação | In quotation process |
| `in_progress` | Em Obra | Active construction/installation |
| `completed` | Finalizada | Finished obra |

### Card Display
- Name, client, and engineer
- Segment badge
- Total value formatted in BRL (reais)
- Quote count

### Data Processing
- Takes `customers` array as prop
- Groups by `status` field
- Renders 4 side-by-side scrollable columns
- Total count shown in column header

## File Paths
- `PedidoKanban.jsx` → `source/src/components/PedidoKanban.jsx`
- `ObraKanban.jsx` → `source/src/components/ObraKanban.jsx`

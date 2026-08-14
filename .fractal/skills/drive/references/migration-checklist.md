# Migration Checklist — Legacy to Standard Structure

Use this checklist when reorganizing an existing obra from a flat/legacy structure
into the canonical hierarchy:

```
Obras/{Obra}/Pedidos/{Number}-{Type}/Orçamentos/
Obras/{Obra}/Pedidos/{Number}-{Type}/Mapa de Cotação/
```

---

## Pre-Flight

- [ ] Identify the obra name (slug format, uppercase, no spaces).
- [ ] List all files currently inside `Obras/{Obra}/` recursively.
- [ ] List all files inside `Obras/{Obra}/Pedidos/` if it exists.
- [ ] List all files inside `Obras/{Obra}/Mapa de Cotação/` if it exists.
- [ ] Determine which pedido numbers and types exist based on filenames.

---

## Folder Creation

For each unique `{Number}-{Type}` combination found:

- [ ] `mkdir -p "Obras/{Obra}/Pedidos/{Number}-{Type}/Orçamentos"`
- [ ] `mkdir -p "Obras/{Obra}/Pedidos/{Number}-{Type}/Mapa de Cotação"`

---

## File Migration

For each pedido spreadsheet (`PEDIDO_{NUMBER}_{TYPE}_...xlsx`):

- [ ] Identify target folder: `{Number}-{Type}` by extracting number + type from filename.
- [ ] Move: `mv "PEDIDO_{NUMBER}_{TYPE}_...xlsx" "Obras/{Obra}/Pedidos/{Number}-{Type}/"`

For each supplier quote PDF:

- [ ] Identify which pedido it belongs to (from email context, subject line, or user).
- [ ] Rename to standard: `Orcamento-{Fornecedor}-{Reference}.pdf`.
- [ ] Move to: `Obras/{Obra}/Pedidos/{Number}-{Type}/Orçamentos/`.

For each bid comparison file (mapa de cotação):

- [ ] Identify which pedido it refers to.
- [ ] Move to: `Obras/{Obra}/Pedidos/{Number}-{Type}/Mapa de Cotação/`.

---

## Clean-Up

- [ ] Remove empty `Obras/{Obra}/Mapa de Cotação/` if it existed.
- [ ] Remove empty `Obras/{Obra}/Pedidos/` old flat files.
- [ ] Verify no files remain loose in `Obras/{Obra}/` root.
- [ ] Run `ls -R "Obras/{Obra}/"` and confirm the final structure.

---

## Validation

- [ ] Every pedido number is 3 digits zero-padded.
- [ ] Every pedido type uses proper Portuguese with diacritics.
- [ ] Orçamentos/ contains only `.pdf` files.
- [ ] Mapa de Cotação/ contains only `.xlsx`, `.html`, or `.json` files.
- [ ] No files are stored directly in `{Number}-{Type}/` root.
- [ ] The `Pedidos/` folder exists and contains only `{Number}-{Type}` subfolders.

#!/usr/bin/env python3
"""
fill_template.py — Populate a Dema purchase order Excel template.

Usage:
  python3 fill_template.py <template.xlsx> <data.json> <output.xlsx>

The template already contains {placeholder} markers (e.g. {supplier.name}).
This script replaces them with actual values, then fills the item rows.
"""

import sys
import json
import re
from copy import copy
from pathlib import Path

try:
    from openpyxl import load_workbook
    from openpyxl.utils import get_column_letter
except ImportError:
    print("ERROR: openpyxl not installed. Run: pip install openpyxl")
    sys.exit(1)


# ── Config: item table structure ─────────────────────────────────────
ITEM_ROW = 38          # first item row (template row)
ITEM_COLS = {
    "code":    "A",    # CÓD. DO ITEM
    "qty":     "B",    # QUANT.
    "unit":    "C",    # UN.
    "desc":    "D",    # PRODUTO (merged D:E)
    "price":   "F",    # R$ UNIT.
    "subtotal":"H",    # R$ SUB-TOTAL (formula)
}

# Totals rows (AFTER item insertion, these shift down)
# The template has them at rows 39-41 (relative to item section)
# SUB-TOTAL at F39/H39, FRETE at F40/H40, TOTAL GERAL at F41/H41
TOTAL_ROWS = {
    "subtotal": {"row": 39, "label_col": "F", "value_col": "H"},
    "freight":  {"row": 40, "label_col": "F", "value_col": "H"},
    "total":    {"row": 41, "label_col": "F", "value_col": "H"},
}


def main():
    if len(sys.argv) < 4:
        print("Usage: fill_template.py <template.xlsx> <data.json> <output.xlsx>")
        sys.exit(1)

    xlsx_path = Path(sys.argv[1])
    data_json = sys.argv[2]
    output_path = Path(sys.argv[3])

    if not xlsx_path.exists():
        print(json.dumps({"status": "error", "message": f"Template not found: {xlsx_path}"}))
        sys.exit(1)

    ctx = json.loads(data_json)

    # ── 1. Open workbook ────────────────────────────────────────────
    wb = load_workbook(str(xlsx_path))
    ws = wb[wb.sheetnames[0]]

    # ── 2. Replace {placeholder} strings in all cells ───────────────
    placeholder_re = re.compile(r"\{[^}]+\}")

    for row in ws.iter_rows(min_row=1, max_row=ws.max_row, max_col=ws.max_column):
        for cell in row:
            if cell.value and isinstance(cell.value, str):
                matches = placeholder_re.findall(cell.value)
                if matches:
                    val = cell.value
                    for ph in matches:
                        key = ph[1:-1]  # strip { }
                        replacement = _resolve_path(ctx, key)
                        if replacement is not None:
                            val = val.replace(ph, str(replacement))
                    cell.value = val

    # ── 3. Fill items ───────────────────────────────────────────────
    items = ctx.get("_items", [])
    if not items:
        print(json.dumps({"status": "error", "message": "No items in data"}))
        sys.exit(1)

    num_items = len(items)
    cols = ITEM_COLS

    # Step 3a: Capture style from template row 38 — ALL columns
    style_row = ITEM_ROW
    ALL_COLS = ["A","B","C","D","E","F","G","H"]
    row_style = {}
    for col_letter in ALL_COLS:
        ref = f"{col_letter}{style_row}"
        cell = ws[ref]
        row_style[col_letter] = {
            "font": copy(cell.font),
            "fill": copy(cell.fill),
            "border": copy(cell.border),
            "alignment": copy(cell.alignment),
            "number_format": cell.number_format,
        }
    template_row_height = ws.row_dimensions[style_row].height

    # Step 3b: Insert extra rows + fix merged cells (openpyxl doesn't shift merges)
    if num_items > 1:
        insert_at = style_row + 1
        count = num_items - 1
        ws.insert_rows(insert_at, count)
        _shift_merges(ws, insert_at, count)
        # Recreate D:E merges for each new item row
        for i in range(1, num_items):
            row_num = style_row + i
            ws.merge_cells(f"D{row_num}:E{row_num}")

    # Step 3c: Fill each item row — apply ALL column styles, then set data
    for i, item in enumerate(items):
        row_num = style_row + i
        ws.row_dimensions[row_num].height = template_row_height

        # Apply styles to ALL columns (A-H) from template
        for col_letter in ALL_COLS:
            ref = f"{col_letter}{row_num}"
            cell = ws[ref]
            st = row_style[col_letter]
            cell.font = copy(st["font"])
            cell.fill = copy(st["fill"])
            cell.border = copy(st["border"])
            cell.alignment = copy(st["alignment"])
            cell.number_format = st["number_format"]

        # Set data values (only the columns that have data)
        ws[f"A{row_num}"].value = item.get("code") or item.get("notes") or (i + 1)
        ws[f"B{row_num}"].value = int(item.get("quantity", 0))
        ws[f"C{row_num}"].value = item.get("unit", "")
        ws[f"D{row_num}"].value = item.get("description", "")
        price = item.get("unitPrice")
        if price is not None:
            ws[f"F{row_num}"].value = float(price)
        ws[f"H{row_num}"].value = f"=F{row_num}*B{row_num}"

    # ── 4. Update totals formulas ───────────────────────────────────
    last_item_row = style_row + num_items - 1

    # The subtotal/freight/total rows shifted by (num_items - 1)
    shift = num_items - 1

    for total_key, cfg in TOTAL_ROWS.items():
        formula_row = cfg["row"] + shift
        label_ref = f"{cfg['label_col']}{formula_row}"
        value_ref = f"{cfg['value_col']}{formula_row}"

        if total_key == "subtotal":
            ws[value_ref] = f"=SUM(H{style_row}:H{last_item_row})"
        elif total_key == "freight":
            # Keep as-is (0) or set freight value
            pass
        elif total_key == "total":
            # Reference the shifted subtotal and freight rows
            sub_row = TOTAL_ROWS["subtotal"]["row"] + shift
            fre_row = TOTAL_ROWS["freight"]["row"] + shift
            ws[value_ref] = f"=H{sub_row}+H{fre_row}"

    # ── 5. Save ─────────────────────────────────────────────────────
    output_path.parent.mkdir(parents=True, exist_ok=True)
    wb.save(str(output_path))
    print(json.dumps({"status": "ok", "output": str(output_path)}))


# ── Helpers ──────────────────────────────────────────────────────────
def _resolve_path(obj: dict, dotted: str) -> str | None:
    """Resolve a dotted or flat key in the context dict.
    Tries exact match first, then nested resolution."""
    # 1. Exact flat key match (e.g. "quote.number" → obj["quote.number"])
    if dotted in obj:
        val = obj[dotted]
        if val is not None and not isinstance(val, (dict, list)):
            return str(val)

    # 2. Dotted path resolution (e.g. "supplier.documents.cnpj")
    parts = dotted.split(".")
    current = obj
    for p in parts:
        if isinstance(current, dict):
            current = current.get(p)
        else:
            return None
        if current is None:
            return None
    return str(current) if not isinstance(current, (dict, list)) else None


def _shift_merges(ws, insert_row: int, count: int):
    """Shift merged cell ranges that are at or below insert_row.
    openpyxl insert_rows() moves cell values but NOT merged ranges."""
    to_remove = []
    to_add = []
    for mc in list(ws.merged_cells.ranges):
        if mc.min_row >= insert_row:
            to_remove.append(str(mc))
            new_range = f"{get_column_letter(mc.min_col)}{mc.min_row + count}:{get_column_letter(mc.max_col)}{mc.max_row + count}"
            to_add.append(new_range)
    for r in to_remove:
        ws.merged_cells.remove(r)
    for r in to_add:
        ws.merged_cells.add(r)


def _num(val):
    """Return float or None."""
    if val is None:
        return None
    try:
        return float(val)
    except (ValueError, TypeError):
        return val


if __name__ == "__main__":
    main()

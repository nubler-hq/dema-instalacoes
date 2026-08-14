#!/usr/bin/env python3
"""PEDIDO-GERAL.script.py — General purchase order template filler (6 columns).

Usage: python3 PEDIDO-GERAL.script.py <template.xlsx> <data.json> <output.xlsx>
"""

import json
import re
import sys
from copy import copy
from pathlib import Path
from typing import Optional

try:
    from openpyxl import load_workbook
    from openpyxl.utils import get_column_letter
except ImportError:
    print("ERROR: openpyxl not installed.")
    sys.exit(1)

# ── Template-specific config ─────────────────────────────────────────
ITEM_ROW = 30  # first item data row
ALL_COLS = ["A", "B", "C", "D", "E", "F"]  # 6 columns
MERGE_COLS = None  # no description merge (single col D)
SUBTOTAL_COL = "F"  # subtotal formula column
PRICE_COL = "E"  # unit price column
QTY_COL = "B"  # quantity column
TOTAL_ROWS = {
    "subtotal": {"row": 32, "label_col": "E", "value_col": "F"},
    "freight": {"row": 33, "label_col": "E", "value_col": "F"},
    "desconto": {"row": 34, "label_col": "E", "value_col": "F"},
    "total": {"row": 35, "label_col": "E", "value_col": "F"},
}


def main():
    if len(sys.argv) < 4:
        print("Usage: PEDIDO-GERAL.script.py <template.xlsx> <data.json> <output.xlsx>")
        sys.exit(1)

    xlsx_path = Path(sys.argv[1])
    data_json = sys.argv[2]
    output_path = Path(sys.argv[3])

    if not xlsx_path.exists():
        print(
            json.dumps(
                {"status": "error", "message": f"Template not found: {xlsx_path}"}
            )
        )
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
                        key = ph[1:-1]
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
    style_row = ITEM_ROW

    # Capture style from template row 30
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

    # Insert extra rows
    if num_items > 1:
        insert_at = style_row + 1
        count = num_items - 1
        ws.insert_rows(insert_at, count)
        _shift_merges(ws, insert_at, count)

    # Fill each item row
    for i, item in enumerate(items):
        row_num = style_row + i
        ws.row_dimensions[row_num].height = template_row_height

        for col_letter in ALL_COLS:
            ref = f"{col_letter}{row_num}"
            cell = ws[ref]
            st = row_style[col_letter]
            cell.font = copy(st["font"])
            cell.fill = copy(st["fill"])
            cell.border = copy(st["border"])
            cell.alignment = copy(st["alignment"])
            cell.number_format = st["number_format"]

        ws[f"A{row_num}"].value = item.get("code") or item.get("notes") or (i + 1)
        ws[f"B{row_num}"].value = int(item.get("quantity", 0))
        ws[f"C{row_num}"].value = item.get("unit", "")
        ws[f"D{row_num}"].value = item.get("description", "")
        price = item.get("unitPrice")
        if price is not None:
            ws[f"{PRICE_COL}{row_num}"].value = float(price)
        ws[
            f"{SUBTOTAL_COL}{row_num}"
        ].value = (
            f'=IF(OR(B{row_num}="",E{row_num}=""),"",ROUND(B{row_num}*E{row_num},2))'
        )

    # ── 4. Update totals formulas ───────────────────────────────────
    last_item_row = style_row + num_items - 1
    shift = num_items - 1

    for total_key, cfg in TOTAL_ROWS.items():
        vc = cfg["value_col"]  # F
        if total_key == "subtotal":
            ws[f"{vc}{cfg['row'] + shift}"] = (
                f"=SUM({vc}{style_row}:{vc}{last_item_row})"
            )
        elif total_key == "total":
            sub_row = TOTAL_ROWS["subtotal"]["row"] + shift
            fre_row = TOTAL_ROWS["freight"]["row"] + shift
            des_row = TOTAL_ROWS["desconto"]["row"] + shift
            ws[f"{vc}{cfg['row'] + shift}"] = (
                f"={vc}{sub_row}+{vc}{fre_row}-{vc}{des_row}"
            )

    # ── 5. Save ─────────────────────────────────────────────────────
    output_path.parent.mkdir(parents=True, exist_ok=True)
    wb.save(str(output_path))
    print(json.dumps({"status": "ok", "output": str(output_path)}))


# ── Helpers ──────────────────────────────────────────────────────────
def _resolve_path(obj: dict, dotted: str) -> Optional[str]:
    if dotted in obj:
        val = obj[dotted]
        if val is not None and not isinstance(val, (dict, list)):
            return str(val)
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
    to_remove, to_add = [], []
    for mc in list(ws.merged_cells.ranges):
        if mc.min_row >= insert_row:
            to_remove.append(str(mc))
            new_range = f"{get_column_letter(mc.min_col)}{mc.min_row + count}:{get_column_letter(mc.max_col)}{mc.max_row + count}"
            to_add.append(new_range)
    for r in to_remove:
        ws.merged_cells.remove(r)
    for r in to_add:
        ws.merged_cells.add(r)


if __name__ == "__main__":
    main()

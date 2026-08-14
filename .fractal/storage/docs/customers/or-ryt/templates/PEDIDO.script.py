#!/usr/bin/env python3
"""PEDIDO.script.py — RYT Paulista purchase order template filler.

Usage: python3 PEDIDO.script.py <template.xlsx> <data.json> <output.xlsx>
"""
import sys, json, re, traceback
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
ITEM_ROW = 38
ALL_COLS = ["A","B","C","D","E","F","G","H"]
MERGE_COLS = "D:E"                    # merge for description
SUBTOTAL_COL = "H"                    # subtotal formula column
PRICE_COL = "F"                       # unit price column
QTY_COL = "B"                         # quantity column
BASE_VISIBLE_ITEM_ROWS = 9
BASE_SPACER_ROWS = 1
BASE_SUBTOTAL_ROW = 48
STYLE_REFERENCE = (
    Path(__file__).resolve().parent.parent
    / "requests"
    / "PEDIDO-2105-RYT-SHAFT-18052026.xlsx"
)


def main():
    if len(sys.argv) < 4:
        print("Usage: PEDIDO.script.py <template.xlsx> <data.json> <output.xlsx>")
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
    style_source = _load_style_source(xlsx_path)

    # Expand the template to keep the same visual structure as the
    # customer's existing requests: a fixed item area plus a spacer row
    # before totals/footer.
    base_insert_count = (BASE_VISIBLE_ITEM_ROWS + BASE_SPACER_ROWS) - 1
    if base_insert_count > 0:
        insert_at = style_row + 1
        ws.insert_rows(insert_at, base_insert_count)
        _shift_merges(ws, insert_at, base_insert_count)

    extra_items = max(0, num_items - BASE_VISIBLE_ITEM_ROWS)
    if extra_items > 0:
        insert_at = BASE_SUBTOTAL_ROW
        ws.insert_rows(insert_at, extra_items)
        _shift_merges(ws, insert_at, extra_items)

    last_item_row = style_row + num_items - 1
    spacer_row = last_item_row + 1
    subtotal_row = spacer_row + 1
    freight_row = subtotal_row + 1
    total_row = subtotal_row + 2
    footer_offset = subtotal_row - BASE_SUBTOTAL_ROW

    _apply_item_area_styles(ws, style_source, last_item_row, spacer_row)
    _apply_footer_styles(ws, style_source, footer_offset)
    _rebuild_item_merges(ws, last_item_row, spacer_row)

    # Fill each item row
    for i, item in enumerate(items):
        row_num = style_row + i

        ws[f"A{row_num}"].value = item.get("code") or item.get("notes") or (i + 1)
        ws[f"B{row_num}"].value = int(item.get("quantity", 0))
        ws[f"C{row_num}"].value = item.get("unit", "")
        ws[f"D{row_num}"].value = item.get("description", "")
        price = item.get("unitPrice")
        if price is not None:
            ws[f"{PRICE_COL}{row_num}"].value = float(price)
        ws[f"{SUBTOTAL_COL}{row_num}"].value = f"={PRICE_COL}{row_num}*{QTY_COL}{row_num}"

    # ── 4. Update totals formulas ───────────────────────────────────
    ws[f"H{subtotal_row}"] = f"=SUM({SUBTOTAL_COL}{style_row}:{SUBTOTAL_COL}{last_item_row})"
    ws[f"H{total_row}"] = f"=H{subtotal_row}+H{freight_row}"

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


def _load_style_source(template_path: Path):
    if STYLE_REFERENCE.exists():
        wb = load_workbook(str(STYLE_REFERENCE))
    else:
        wb = load_workbook(str(template_path))
    return wb[wb.sheetnames[0]]


def _copy_cell_style(src_ws, dst_ws, src_row: int, dst_row: int, col_letter: str):
    src = src_ws[f"{col_letter}{src_row}"]
    dst = dst_ws[f"{col_letter}{dst_row}"]
    dst._style = copy(src._style)
    if src.has_style:
        dst.number_format = src.number_format
        dst.alignment = copy(src.alignment)
        dst.fill = copy(src.fill)
        dst.font = copy(src.font)
        dst.border = copy(src.border)
        dst.protection = copy(src.protection)


def _copy_row_style(src_ws, dst_ws, src_row: int, dst_row: int):
    for col_letter in ALL_COLS:
        _copy_cell_style(src_ws, dst_ws, src_row, dst_row, col_letter)
    dst_ws.row_dimensions[dst_row].height = src_ws.row_dimensions[src_row].height


def _apply_item_area_styles(ws, style_source, last_item_row: int, spacer_row: int):
    for row_num in range(ITEM_ROW, last_item_row + 1):
        _copy_row_style(style_source, ws, 38, row_num)
    _copy_row_style(style_source, ws, 47, spacer_row)


def _apply_footer_styles(ws, style_source, footer_offset: int):
    for src_row in range(48, 61):
        dst_row = src_row + footer_offset
        _copy_row_style(style_source, ws, src_row, dst_row)


def _rebuild_item_merges(ws, last_item_row: int, spacer_row: int):
    to_remove = []
    for mc in list(ws.merged_cells.ranges):
        ref = str(mc)
        if re.match(r"^D\d+:E\d+$", ref):
            to_remove.append(ref)
        elif re.match(r"^A\d+:E\d+$", ref):
            to_remove.append(ref)
        elif re.match(r"^F\d+:G\d+$", ref):
            to_remove.append(ref)
        elif re.match(r"^C\d+:D\d+$", ref):
            to_remove.append(ref)
    for ref in to_remove:
        ws.merged_cells.remove(ref)

    for row_num in range(37, spacer_row + 1):
        ws.merge_cells(f"D{row_num}:E{row_num}")

    subtotal_row = spacer_row + 1
    freight_row = subtotal_row + 1
    total_row = subtotal_row + 2
    payment_row = subtotal_row + 4

    ws.merge_cells(f"A{subtotal_row}:E{total_row}")
    ws.merge_cells(f"F{subtotal_row}:G{subtotal_row}")
    ws.merge_cells(f"F{freight_row}:G{freight_row}")
    ws.merge_cells(f"F{total_row}:G{total_row}")
    ws.merge_cells(f"C{payment_row}:D{payment_row}")


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
    try:
        main()
    except Exception:
        traceback.print_exc()
        sys.exit(1)

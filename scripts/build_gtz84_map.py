#!/usr/bin/env python3
"""
build_gtz84_map.py — Gera DASHBOARD.html e DASHBOARD.xlsx
para o Pedido 001-Fixação GTZ-84 a partir do data.json canônico.

Uso:
  python3 scripts/build_gtz84_map.py \
    --input .fractal/drive/Obras/GTZ-84/Pedidos/001-Fixação/Mapa de Cotação/data.json \
    --output-dir .fractal/drive/Obras/GTZ-84/Pedidos/001-Fixação/Mapa de Cotação
"""

from __future__ import annotations

import argparse
import json
import math
import re
from collections import defaultdict
from copy import copy
from datetime import datetime, timezone
from pathlib import Path

try:
    from openpyxl import Workbook, load_workbook
    from openpyxl.styles import Alignment, Border, Font, PatternFill, Side, numbers
    from openpyxl.utils import get_column_letter
except ImportError:
    print("ERROR: openpyxl not installed. Run: pip install openpyxl")
    import sys

    sys.exit(1)


# ── Helpers ──────────────────────────────────────────────────────────


def parse_number(value):
    if value is None:
        return None
    if isinstance(value, (int, float)):
        if isinstance(value, float) and math.isnan(value):
            return None
        return float(value)
    text = str(value).strip()
    if not text or text == "-":
        return None
    text = text.replace("R$", "").replace(" ", "")
    text = text.replace(".", "").replace(",", ".")
    try:
        return float(text)
    except ValueError:
        return None


def currency_br(value):
    if value is None:
        return "—"
    return (
        f"R$ {float(value):,.2f}".replace(",", "X").replace(".", ",").replace("X", ".")
    )


def iso_now():
    return datetime.now(timezone.utc).isoformat()


def _get_offers_dict(item):
    """Normalize item.offers to a dict keyed by supplierId."""
    offers = item.get("offers", {})
    if isinstance(offers, list):
        return {o["supplierId"]: o for o in offers if o.get("supplierId")}
    return offers


def item_best_offer(item):
    """Returns the offer dict with lowest unitPrice among available offers."""
    best = None
    offers_dict = _get_offers_dict(item)
    for s_id, offer in offers_dict.items():
        if offer.get("available") and offer.get("unitPrice") is not None:
            if best is None or float(offer["unitPrice"]) < float(best["unitPrice"]):
                best = {**offer, "supplierId": s_id}
    return best


def item_worst_offer(item):
    """Returns the offer dict with highest unitPrice among available offers."""
    worst = None
    offers_dict = _get_offers_dict(item)
    for s_id, offer in offers_dict.items():
        if offer.get("available") and offer.get("unitPrice") is not None:
            if worst is None or float(offer["unitPrice"]) > float(worst["unitPrice"]):
                worst = {**offer, "supplierId": s_id}
    return worst


# ── Data Enrichment ──────────────────────────────────────────────────


def enrich_data(data):
    """Add computed fields to data so it's compatible with the dashboard template JS."""

    suppliers = data["suppliers"]
    supplier_by_id = {s["id"]: s for s in suppliers}

    # ─── 1. Enrich each item with bestSupplierId ───
    for item in data["items"]:
        best = item_best_offer(item)
        item["bestSupplierId"] = best["supplierId"] if best else None

    # ─── 2. Enrich each group ───
    for group in data["groups"]:
        group_items = group["items"]
        for gi in group_items:
            best = item_best_offer(gi)
            gi["bestSupplierId"] = best["supplierId"] if best else None

        # Compute supplier coverage in this group
        group_suppliers = []
        for supp in suppliers:
            total = 0.0
            covered = 0
            for gi in group_items:
                offer = _get_offers_dict(gi).get(supp["id"])
                qty = parse_number(gi.get("quantity"))
                if (
                    offer
                    and offer.get("available")
                    and offer.get("unitPrice") is not None
                    and qty is not None
                ):
                    total += float(offer["unitPrice"]) * qty
                    covered += 1
            group_suppliers.append(
                {
                    "supplierId": supp["id"],
                    "name": supp["name"],
                    "sheet": supp.get("sheetName", supp["name"]),
                    "total": total if covered > 0 else None,
                    "covered": covered,
                    "coveragePct": round((covered / len(group_items)) * 100, 1)
                    if group_items
                    else 0.0,
                }
            )

        quoted_suppliers = [s for s in group_suppliers if s["covered"] > 0]
        best_total_supplier = (
            min(
                quoted_suppliers,
                key=lambda s: (
                    s["total"] if s["total"] is not None else float("inf"),
                    -s["covered"],
                ),
            )
            if quoted_suppliers
            else None
        )

        # Compute best offer total and savings
        best_offer_total = 0.0
        savings = 0.0
        resolved = 0
        for gi in group_items:
            best = item_best_offer(gi)
            worst = item_worst_offer(gi)
            qty = parse_number(gi.get("quantity"))
            if best and qty is not None:
                resolved += 1
                best_offer_total += float(best["unitPrice"]) * qty
                if worst and worst["unitPrice"] is not None:
                    savings += (
                        float(worst["unitPrice"]) - float(best["unitPrice"])
                    ) * qty

        group["resolved"] = resolved
        group["suppliers"] = group_suppliers
        group["bestTotalSupplier"] = best_total_supplier
        group["bestOfferTotal"] = best_offer_total
        group["savings"] = savings
        if "subtitle" not in group:
            group["subtitle"] = "Família técnica de materiais"

    # ─── 3. Rebuild basket ───
    total = 0.0
    savings_total = 0.0
    resolved_count = 0
    allocations_map = defaultdict(lambda: {"items": [], "total": 0.0})

    for item in data["items"]:
        best = item_best_offer(item)
        worst = item_worst_offer(item)
        qty = parse_number(item.get("quantity"))
        if best and qty is not None:
            resolved_count += 1
            price = float(best["unitPrice"]) * qty
            total += price
            allocations_map[best["supplierId"]]["items"].append(
                {
                    "position": item["position"],
                    "description": item["description"],
                    "quantity": item["quantity"],
                    "unit": item["unit"],
                    "totalPrice": round(price, 2),
                }
            )
            allocations_map[best["supplierId"]]["total"] += price
            if worst and worst["unitPrice"] is not None:
                savings_total += (
                    float(worst["unitPrice"]) - float(best["unitPrice"])
                ) * qty

    supplier_allocations = sorted(
        [
            {
                "supplierId": s_id,
                "name": supplier_by_id[s_id]["name"],
                "sheet": supplier_by_id[s_id].get(
                    "sheetName", supplier_by_id[s_id]["name"]
                ),
                "total": round(data["total"], 2),
                "count": len(data["items"]),
                "items": sorted(data["items"], key=lambda i: i["position"]),
            }
            for s_id, data in allocations_map.items()
        ],
        key=lambda row: row["total"],
    )

    # Actually fix the basket allocations
    supplier_allocations = []
    for s_id, alloc_data in allocations_map.items():
        supp = supplier_by_id[s_id]
        alloc_total = round(alloc_data["total"], 2)
        items_sorted = sorted(alloc_data["items"], key=lambda i: i["position"])
        supplier_allocations.append(
            {
                "supplierId": s_id,
                "name": supp["name"],
                "sheet": supp.get("sheetName", supp["name"]),
                "total": alloc_total,
                "count": len(items_sorted),
                "items": items_sorted,
            }
        )
    supplier_allocations.sort(key=lambda row: -row["total"])

    data["basket"] = {
        "total": round(total, 2),
        "savings": round(savings_total, 2),
        "resolvedCount": resolved_count,
        "unresolvedCount": len(data["items"]) - resolved_count,
        "supplierAllocations": supplier_allocations,
    }

    # ─── 4. Fix summary ───
    groups_with_quotes = [g for g in data["groups"] if g["resolved"] > 0]
    best_group = (
        max(groups_with_quotes, key=lambda g: g["savings"])
        if groups_with_quotes
        else None
    )

    data["summary"]["basketTotal"] = data["summary"].get("total", round(total, 2))
    data["summary"]["basketSavings"] = round(savings_total, 2)
    data["summary"]["basketResolved"] = resolved_count
    data["summary"]["basketUnresolved"] = len(data["items"]) - resolved_count
    data["summary"]["bestGroupTitle"] = best_group["title"] if best_group else None
    data["summary"]["groupWithQuotes"] = len(groups_with_quotes)

    # Keep existing fields for backward compat
    data["summary"]["savings"] = round(savings_total, 2)
    data["summary"]["resolvedItems"] = resolved_count

    # ─── 5. Fix timestamps ───
    if "mapDate" not in data.get("timestamps", {}):
        data["timestamps"]["mapDate"] = data["timestamps"]["generatedAt"][:10]

    # ─── 6. Fix source ───
    if "source" not in data:
        data["source"] = {}
    if "emailSubject" not in data["source"]:
        data["source"]["emailSubject"] = (
            "Orçamentos Fixagold + Perfil Líder - Pedido 001 Fixação GTZ-84"
        )
    if "emailId" not in data["source"]:
        data["source"]["emailId"] = "reconciliado"

    # ─── 7. Migrate offers from dict to array format ───
    # The template JS expects item.offers to be an array of {supplierId, unitPrice, totalPrice, available}
    for item in data["items"]:
        if isinstance(item.get("offers"), dict):
            offers_dict = item["offers"]
            offers_arr = []
            for supp in suppliers:
                s_id = supp["id"]
                o = offers_dict.get(s_id, {})
                offers_arr.append(
                    {
                        "supplierId": s_id,
                        "unitPrice": o.get("unitPrice"),
                        "totalPrice": o.get("totalPrice"),
                        "available": o.get("available", False),
                        "quoteId": o.get("quoteId"),
                        "quoteItemIndex": o.get("quoteItemIndex"),
                    }
                )
            item["offers"] = offers_arr

    # Also fix offers in groups
    for group in data["groups"]:
        for gi in group["items"]:
            if isinstance(gi.get("offers"), dict):
                offers_dict = gi["offers"]
                offers_arr = []
                for supp in suppliers:
                    s_id = supp["id"]
                    o = offers_dict.get(s_id, {})
                    offers_arr.append(
                        {
                            "supplierId": s_id,
                            "unitPrice": o.get("unitPrice"),
                            "totalPrice": o.get("totalPrice"),
                            "available": o.get("available", False),
                            "quoteId": o.get("quoteId"),
                            "quoteItemIndex": o.get("quoteItemIndex"),
                        }
                    )
                gi["offers"] = offers_arr

    # Fix pendingItems offers too
    for pi in data.get("pendingItems", []):
        if isinstance(pi.get("offers"), dict):
            offers_dict = pi["offers"]
            offers_arr = []
            for supp in suppliers:
                s_id = supp["id"]
                o = offers_dict.get(s_id, {})
                offers_arr.append(
                    {
                        "supplierId": s_id,
                        "unitPrice": o.get("unitPrice"),
                        "totalPrice": o.get("totalPrice"),
                        "available": o.get("available", False),
                    }
                )
            pi["offers"] = offers_arr
            # Also compute bestSupplierId for pending
            best = None
            for o2 in offers_arr:
                if o2.get("available") and o2.get("unitPrice") is not None:
                    if best is None or float(o2["unitPrice"]) < float(
                        best["unitPrice"]
                    ):
                        best = o2
            pi["bestSupplierId"] = best["supplierId"] if best else None

    # Patch pendingItems to also include groupTitle for display
    group_by_pos = {}
    for g in data["groups"]:
        for gi in g["items"]:
            group_by_pos[gi["position"]] = g["title"]
    for pi in data.get("pendingItems", []):
        pi["groupTitle"] = group_by_pos.get(pi["position"], "Não classificado")

    return data


# ── HTML Generation ─────────────────────────────────────────────────


def build_html(data, template_path: Path | None) -> str:
    """Build the dashboard HTML from the data and template."""
    if template_path and template_path.exists():
        html = template_path.read_text(encoding="utf-8")
    else:
        print("WARNING: dashboard-template.html not found at", template_path)
        # Fallback: use the embedded HTML_TEMPLATE from the other script
        return ""

    customer = data.get("customer", {})
    number = data.get("number", "")
    quote_type = data.get("type", "")
    customer_name = customer.get("name", "Cliente")

    heading = f"Pedido {number} {quote_type} | {customer_name}".replace(
        "  ", " "
    ).strip()
    title = f"Mapa de Cotação | Pedido {number} {quote_type} | {customer_name}"

    html = html.replace("__HEADING__", heading)
    html = html.replace("__TITLE__", title)
    html = html.replace("__CUSTOMER__", customer_name)

    html = html.replace(
        "__MAP_DATE__", data.get("timestamps", {}).get("mapDate") or "—"
    )
    html = html.replace(
        "__EMAIL_SUBJECT__",
        data.get("source", {}).get("emailSubject") or "Fontes reconciliadas",
    )
    html = html.replace(
        "__EMAIL_ID__", str(data.get("source", {}).get("emailId") or "—")
    )

    html = html.replace("__BASKET_TOTAL__", currency_br(data["summary"]["basketTotal"]))
    html = html.replace("__SAVINGS__", currency_br(data["summary"]["basketSavings"]))
    html = html.replace("__NO_QUOTE__", str(data["summary"]["itemsWithoutQuotes"]))
    html = html.replace("__SUPPLIER_COUNT__", str(data["summary"]["supplierCount"]))
    html = html.replace("__BEST_GROUP__", data["summary"].get("bestGroupTitle") or "—")
    html = html.replace("__RESOLVED_COUNT__", str(data["summary"]["basketResolved"]))
    html = html.replace("__GROUP_COUNT__", str(data["summary"]["groupCount"]))

    serializable = json.dumps(data, ensure_ascii=False)
    serializable = serializable.replace("</", "<\\/")
    html = html.replace("__DATA__", serializable)

    return html


# ── XLSX Generation ─────────────────────────────────────────────────


def build_xlsx(data, output_path: Path):
    """Build the DASHBOARD.xlsx workbook."""
    wb = Workbook()

    # Colors and styles
    brand_color = PatternFill(
        start_color="A94F2D", end_color="A94F2D", fill_type="solid"
    )
    green_fill = PatternFill(
        start_color="31594D", end_color="31594D", fill_type="solid"
    )
    green_soft = PatternFill(
        start_color="E8F3ED", end_color="E8F3ED", fill_type="solid"
    )
    header_fill = PatternFill(
        start_color="F7EFE4", end_color="F7EFE4", fill_type="solid"
    )
    warm_fill = PatternFill(start_color="FBF7EF", end_color="FBF7EF", fill_type="solid")
    paper_fill = PatternFill(
        start_color="FFFDF8", end_color="FFFDF8", fill_type="solid"
    )
    yellow_fill = PatternFill(
        start_color="FFF8EE", end_color="FFF8EE", fill_type="solid"
    )

    header_font = Font(name="Aptos", bold=True, color="FFFFFF", size=11)
    title_font = Font(name="Aptos", bold=True, color="211B16", size=14)
    subtitle_font = Font(name="Aptos", bold=True, color="6A6056", size=10)
    body_font = Font(name="Aptos", color="211B16", size=10)
    money_font = Font(name="Aptos", color="211B16", size=10)
    bold_font = Font(name="Aptos", bold=True, color="211B16", size=10)
    green_font = Font(name="Aptos", bold=True, color="31594D", size=10)
    white_font = Font(name="Aptos", bold=True, color="FFFFFF", size=10)

    thin_border = Border(
        left=Side(style="thin", color="DED2C2"),
        right=Side(style="thin", color="DED2C2"),
        top=Side(style="thin", color="DED2C2"),
        bottom=Side(style="thin", color="DED2C2"),
    )
    green_border = Border(
        left=Side(style="medium", color="31594D"),
        right=Side(style="medium", color="31594D"),
        top=Side(style="medium", color="31594D"),
        bottom=Side(style="medium", color="31594D"),
    )

    money_fmt = "#.##0,00"
    pct_fmt = "0.0%"
    int_fmt = "#,##0"

    suppliers = data["suppliers"]
    groups = data["groups"]
    items = data["items"]
    basket = data["basket"]
    summary = data["summary"]
    pending = data.get("pendingItems", [])

    # ═══════════════════════════════════════════════════════
    # Sheet 1: Dashboard
    # ═══════════════════════════════════════════════════════
    ws1 = wb.active
    ws1.title = "Dashboard"
    ws1.sheet_properties.tabColor = "A94F2D"

    ws1.column_dimensions["A"].width = 3
    ws1.column_dimensions["B"].width = 40
    ws1.column_dimensions["C"].width = 20
    ws1.column_dimensions["D"].width = 20
    ws1.column_dimensions["E"].width = 20
    ws1.column_dimensions["F"].width = 20

    # Title
    ws1.merge_cells("B2:F2")
    ws1["B2"] = (
        f"Dashboard | Pedido {data['number']} {data['type']} | {data['customer']['name']}"
    )
    ws1["B2"].font = title_font
    ws1["B2"].alignment = Alignment(vertical="center")
    ws1.row_dimensions[2].height = 30

    # KPIs
    ws1.merge_cells("B3:F3")
    ws1["B3"] = f"Gerado em: {data['timestamps'].get('mapDate', '—')}"
    ws1["B3"].font = subtitle_font

    kpi_row = 5
    kpis = [
        ("Total Cesta", summary.get("basketTotal", 0), money_fmt),
        ("Economia", summary.get("basketSavings", 0), money_fmt),
        ("Itens Cotados", summary.get("basketResolved", 0), int_fmt),
        ("Itens Pendentes", summary.get("itemsWithoutQuotes", 0), int_fmt),
        ("Fornecedores", summary.get("supplierCount", 0), int_fmt),
    ]
    for i, (label, value, fmt) in enumerate(kpis):
        col = get_column_letter(2 + i)
        cell = ws1[f"{col}{kpi_row}"]
        cell.value = label
        cell.font = subtitle_font
        cell.fill = header_fill
        cell.border = thin_border
        cell.alignment = Alignment(horizontal="center")

        cell_val = ws1[f"{col}{kpi_row + 1}"]
        if isinstance(value, (int, float)):
            cell_val.value = value
            cell_val.number_format = fmt
        else:
            cell_val.value = value
        cell_val.font = Font(name="Aptos", bold=True, size=16, color="A94F2D")
        cell_val.fill = paper_fill
        cell_val.border = thin_border
        cell_val.alignment = Alignment(horizontal="center")
    ws1.row_dimensions[kpi_row].height = 22
    ws1.row_dimensions[kpi_row + 1].height = 32

    # Basket allocation
    r = kpi_row + 3
    ws1.merge_cells(f"B{r}:D{r}")
    ws1[f"B{r}"] = "Distribuição da Cesta por Fornecedor"
    ws1[f"B{r}"].font = Font(name="Aptos", bold=True, size=12)

    r += 1
    ws1[f"B{r}"] = "Fornecedor"
    ws1[f"C{r}"] = "Total"
    ws1[f"D{r}"] = "Itens"
    ws1[f"E{r}"] = "Participação"
    for c in ["B", "C", "D", "E"]:
        ws1[f"{c}{r}"].font = bold_font
        ws1[f"{c}{r}"].fill = header_fill
        ws1[f"{c}{r}"].border = thin_border

    for alloc in basket.get("supplierAllocations", []):
        r += 1
        ws1[f"B{r}"] = alloc.get("name", "")
        ws1[f"B{r}"].font = body_font
        ws1[f"B{r}"].border = thin_border

        ws1[f"C{r}"] = alloc.get("total", 0)
        ws1[f"C{r}"].number_format = money_fmt
        ws1[f"C{r}"].font = money_font
        ws1[f"C{r}"].border = thin_border

        ws1[f"D{r}"] = alloc.get("count", 0)
        ws1[f"D{r}"].number_format = int_fmt
        ws1[f"D{r}"].font = body_font
        ws1[f"D{r}"].border = thin_border

        total_basket = summary.get("basketTotal", 1) or 1
        pct = alloc.get("total", 0) / total_basket
        ws1[f"E{r}"] = pct
        ws1[f"E{r}"].number_format = pct_fmt
        ws1[f"E{r}"].font = body_font
        ws1[f"E{r}"].fill = green_soft if pct > 0.4 else paper_fill
        ws1[f"E{r}"].border = thin_border

    r += 1
    ws1.merge_cells(f"B{r}:C{r}")
    ws1[f"B{r}"] = f"TOTAL CESTA: {currency_br(summary.get('basketTotal', 0))}"
    ws1[f"B{r}"].font = Font(name="Aptos", bold=True, size=11, color="A94F2D")
    for c in ["B", "C", "D", "E"]:
        cell_t = ws1[f"{c}{r}"]
        cell_t.border = thin_border
        cell_t.fill = header_fill

    # Pending items
    r += 2
    ws1.merge_cells(f"B{r}:E{r}")
    ws1[f"B{r}"] = f"Itens Pendentes (sem cotação) — {len(pending)} itens"
    ws1[f"B{r}"].font = Font(name="Aptos", bold=True, size=12, color="9B3C2C")

    if pending:
        r += 1
        for c, h in [("B", "Item"), ("C", "Descrição"), ("D", "Qtd"), ("E", "Grupo")]:
            ws1[f"{c}{r}"].value = h
            ws1[f"{c}{r}"].font = bold_font
            ws1[f"{c}{r}"].fill = yellow_fill
            ws1[f"{c}{r}"].border = thin_border
        for pi in pending:
            r += 1
            ws1[f"B{r}"] = pi.get("position", "")
            ws1[f"B{r}"].font = body_font
            ws1[f"B{r}"].border = thin_border
            ws1[f"C{r}"] = pi.get("description", "")
            ws1[f"C{r}"].font = body_font
            ws1[f"C{r}"].border = thin_border
            ws1[f"D{r}"] = f"{pi.get('quantity', 0)} {pi.get('unit', '')}"
            ws1[f"D{r}"].font = body_font
            ws1[f"D{r}"].border = thin_border
            ws1[f"E{r}"] = pi.get("groupTitle", "")
            ws1[f"E{r}"].font = body_font
            ws1[f"E{r}"].border = thin_border

    ws1.freeze_panes = "B5"

    # ═══════════════════════════════════════════════════════
    # Sheet 2: Mapa de Cotacao
    # ═══════════════════════════════════════════════════════
    ws2 = wb.create_sheet("Mapa de Cotacao")
    ws2.sheet_properties.tabColor = "31594D"

    # Column widths
    ws2.column_dimensions["A"].width = 3
    ws2.column_dimensions["B"].width = 6  # pos
    ws2.column_dimensions["C"].width = 46  # description
    ws2.column_dimensions["D"].width = 10  # qty
    supp_cols = []
    for i, supp in enumerate(suppliers):
        col = get_column_letter(5 + i * 2)
        ws2.column_dimensions[col].width = 14
        ws2.column_dimensions[get_column_letter(5 + i * 2 + 1)].width = 14
        supp_cols.append((col, get_column_letter(5 + i * 2 + 1)))

    r = 1
    ws2.merge_cells(f"A1:{get_column_letter(5 + len(suppliers) * 2 - 1)}1")
    ws2["A1"] = (
        f"Mapa de Cotação — Pedido {data['number']} {data['type']} | {data['customer']['name']}"
    )
    ws2["A1"].font = title_font
    ws2.row_dimensions[1].height = 28

    current_row = 3

    for g_idx, group in enumerate(groups):
        # Group header row
        ws2.merge_cells(
            f"A{current_row}:{get_column_letter(5 + len(suppliers) * 2 - 1)}{current_row}"
        )
        g_resolved = group.get("resolved", 0)
        g_total = len(group["items"])
        g_best = group.get("bestOfferTotal", 0)
        g_savings = group.get("savings", 0)
        ws2[f"A{current_row}"] = (
            f"{group['title']} — {g_resolved}/{g_total} itens | Melhor: {currency_br(g_best)} | Economia: {currency_br(g_savings)}"
        )
        ws2[f"A{current_row}"].font = Font(
            name="Aptos", bold=True, color="FFFFFF", size=10
        )
        ws2[f"A{current_row}"].fill = green_fill
        for c_idx in range(1, 5 + len(suppliers) * 2):
            cell = ws2.cell(row=current_row, column=c_idx)
            cell.fill = green_fill
            cell.border = thin_border
        current_row += 1

        # Table header
        ws2[f"B{current_row}"] = "#"
        ws2[f"C{current_row}"] = "Item"
        ws2[f"D{current_row}"] = "Qtd."
        for i, supp in enumerate(suppliers):
            col_price = supp_cols[i][0]
            col_total = supp_cols[i][1]
            best_ts = group.get("bestTotalSupplier")
            is_best = best_ts and best_ts["supplierId"] == supp["id"]
            fill = green_soft if is_best else header_fill
            ws2[f"{col_price}{current_row}"] = f"{supp['name']}\nUnit."
            ws2[f"{col_price}{current_row}"].font = subtitle_font
            ws2[f"{col_total}{current_row}"] = f"{supp['name']}\nTotal"
            ws2[f"{col_total}{current_row}"].font = subtitle_font
            for c in [col_price, col_total]:
                ws2[f"{c}{current_row}"].fill = fill
                ws2[f"{c}{current_row}"].border = thin_border
                ws2[f"{c}{current_row}"].alignment = Alignment(
                    wrap_text=True, horizontal="center"
                )
        ws2[f"B{current_row}"].font = bold_font
        ws2[f"B{current_row}"].fill = header_fill
        ws2[f"B{current_row}"].border = thin_border
        ws2[f"C{current_row}"].font = bold_font
        ws2[f"C{current_row}"].fill = header_fill
        ws2[f"C{current_row}"].border = thin_border
        ws2[f"D{current_row}"].font = bold_font
        ws2[f"D{current_row}"].fill = header_fill
        ws2[f"D{current_row}"].border = thin_border
        ws2[f"D{current_row}"].alignment = Alignment(horizontal="center")
        current_row += 1

        # Item rows
        for gi in group["items"]:
            qty = gi.get("quantity", 0)
            unit = gi.get("unit", "")
            ws2[f"B{current_row}"] = gi["position"]
            ws2[f"B{current_row}"].font = body_font
            ws2[f"B{current_row}"].border = thin_border
            ws2[f"B{current_row}"].alignment = Alignment(horizontal="center")

            ws2[f"C{current_row}"] = gi["description"]
            ws2[f"C{current_row}"].font = body_font
            ws2[f"C{current_row}"].border = thin_border

            ws2[f"D{current_row}"] = f"{qty} {unit}" if unit else qty
            ws2[f"D{current_row}"].font = body_font
            ws2[f"D{current_row}"].border = thin_border
            ws2[f"D{current_row}"].alignment = Alignment(horizontal="right")

            best_supplier_id = gi.get("bestSupplierId")

            for i, supp in enumerate(suppliers):
                col_price = supp_cols[i][0]
                col_total = supp_cols[i][1]

                offers_arr = gi.get("offers", [])
                offer = None
                if isinstance(offers_arr, list):
                    offer = next(
                        (
                            o
                            for o in offers_arr
                            if o.get("supplierId") == supp["id"] and o.get("available")
                        ),
                        None,
                    )
                elif isinstance(offers_arr, dict):
                    o = offers_arr.get(supp["id"], {})
                    if o.get("available"):
                        offer = o

                is_best = best_supplier_id == supp["id"]

                if offer and offer.get("unitPrice") is not None:
                    up = float(offer["unitPrice"])
                    tp = up * qty if qty else 0
                    ws2[f"{col_price}{current_row}"] = up
                    ws2[f"{col_price}{current_row}"].number_format = money_fmt
                    ws2[f"{col_price}{current_row}"].font = (
                        green_font if is_best else money_font
                    )

                    ws2[f"{col_total}{current_row}"] = tp
                    ws2[f"{col_total}{current_row}"].number_format = money_fmt
                    ws2[f"{col_total}{current_row}"].font = (
                        green_font if is_best else money_font
                    )
                else:
                    ws2[f"{col_price}{current_row}"] = "-"
                    ws2[f"{col_price}{current_row}"].font = Font(
                        name="Aptos", color="8F8275", size=10
                    )
                    ws2[f"{col_total}{current_row}"] = "-"
                    ws2[f"{col_total}{current_row}"].font = Font(
                        name="Aptos", color="8F8275", size=10
                    )

                for c in [col_price, col_total]:
                    ws2[f"{c}{current_row}"].fill = (
                        green_soft if is_best else paper_fill
                    )
                    ws2[f"{c}{current_row}"].border = thin_border
                    ws2[f"{c}{current_row}"].alignment = Alignment(horizontal="right")

            current_row += 1

        # Group footer
        ws2[f"B{current_row}"] = ""
        ws2[f"C{current_row}"] = "Total do grupo por fornecedor"
        ws2[f"C{current_row}"].font = Font(
            name="Aptos", bold=True, size=10, color="A94F2D"
        )
        ws2[f"C{current_row}"].border = thin_border
        ws2[f"D{current_row}"].border = thin_border

        for i, supp in enumerate(suppliers):
            col_price = supp_cols[i][0]
            col_total = supp_cols[i][1]

            group_supp = next(
                (
                    s
                    for s in group.get("suppliers", [])
                    if s["supplierId"] == supp["id"]
                ),
                None,
            )
            is_best_ts = (
                group.get("bestTotalSupplier")
                and group["bestTotalSupplier"]["supplierId"] == supp["id"]
            )

            if group_supp and group_supp.get("total") is not None:
                ws2[f"{col_total}{current_row}"] = group_supp["total"]
                ws2[f"{col_total}{current_row}"].number_format = money_fmt
                ws2[f"{col_total}{current_row}"].font = Font(
                    name="Aptos",
                    bold=True,
                    size=10,
                    color="31594D" if is_best_ts else "211B16",
                )
                ws2[f"{col_total}{current_row}"].fill = (
                    green_soft if is_best_ts else header_fill
                )
            else:
                ws2[f"{col_total}{current_row}"] = "-"
                ws2[f"{col_total}{current_row}"].font = Font(
                    name="Aptos", color="8F8275", size=10
                )
                ws2[f"{col_total}{current_row}"].fill = header_fill

            for c in [col_price, col_total]:
                ws2[f"{c}{current_row}"].border = thin_border
                ws2[f"{c}{current_row}"].fill = (
                    header_fill if not is_best_ts else green_soft
                )

        ws2[f"B{current_row}"].border = thin_border
        ws2[f"B{current_row}"].fill = header_fill
        ws2[f"D{current_row}"].border = thin_border
        ws2[f"D{current_row}"].fill = header_fill

        current_row += 2  # blank row between groups

    ws2.freeze_panes = "E4"

    # ═══════════════════════════════════════════════════════
    # Sheet 3: Dados
    # ═══════════════════════════════════════════════════════
    ws3 = wb.create_sheet("Dados")
    ws3.sheet_properties.tabColor = "6A6056"

    headers_data = [
        "Pos.",
        "Descrição",
        "Qtd.",
        "Un.",
    ]
    for supp in suppliers:
        headers_data.append(f"{supp['name']} Unit.")
        headers_data.append(f"{supp['name']} Total")

    ws3.column_dimensions["A"].width = 3
    ws3.column_dimensions["B"].width = 6
    ws3.column_dimensions["C"].width = 46
    ws3.column_dimensions["D"].width = 10
    ws3.column_dimensions["E"].width = 10

    col_idx = 6
    for _ in suppliers:
        ws3.column_dimensions[get_column_letter(col_idx)].width = 14
        ws3.column_dimensions[get_column_letter(col_idx + 1)].width = 14
        col_idx += 2

    for ci, h in enumerate(headers_data, 1):
        col_l = get_column_letter(ci)
        ws3[f"{col_l}1"] = h
        ws3[f"{col_l}1"].font = bold_font
        ws3[f"{col_l}1"].fill = header_fill
        ws3[f"{col_l}1"].border = thin_border

    for ri, item in enumerate(items, 2):
        ws3[f"A{ri}"] = ""
        ws3[f"A{ri}"].border = thin_border
        ws3[f"B{ri}"] = item["position"]
        ws3[f"B{ri}"].font = body_font
        ws3[f"B{ri}"].border = thin_border
        ws3[f"B{ri}"].alignment = Alignment(horizontal="center")

        ws3[f"C{ri}"] = item["description"]
        ws3[f"C{ri}"].font = body_font
        ws3[f"C{ri}"].border = thin_border

        ws3[f"D{ri}"] = item.get("quantity", 0)
        ws3[f"D{ri}"].font = body_font
        ws3[f"D{ri}"].border = thin_border
        ws3[f"D{ri}"].alignment = Alignment(horizontal="right")

        ws3[f"E{ri}"] = item.get("unit", "")
        ws3[f"E{ri}"].font = body_font
        ws3[f"E{ri}"].border = thin_border

        offers_arr = item.get("offers", [])
        if isinstance(offers_arr, dict):
            offers_arr = []
            for supp in suppliers:
                o = item["offers"].get(supp["id"], {})
                offers_arr.append(o)

        ci = 6
        for si, supp in enumerate(suppliers):
            col_l1 = get_column_letter(ci)
            col_l2 = get_column_letter(ci + 1)

            offer = None
            if isinstance(offers_arr, list) and si < len(offers_arr):
                offer = offers_arr[si]
            elif isinstance(item.get("offers"), dict):
                offer = item["offers"].get(supp["id"], {})

            if offer and offer.get("unitPrice") is not None and offer.get("available"):
                up = float(offer["unitPrice"])
                qty = parse_number(item.get("quantity")) or 0
                ws3[f"{col_l1}{ri}"] = up
                ws3[f"{col_l1}{ri}"].number_format = money_fmt
                ws3[f"{col_l1}{ri}"].font = money_font

                ws3[f"{col_l2}{ri}"] = up * qty
                ws3[f"{col_l2}{ri}"].number_format = money_fmt
                ws3[f"{col_l2}{ri}"].font = money_font
            else:
                ws3[f"{col_l1}{ri}"] = "-"
                ws3[f"{col_l1}{ri}"].font = Font(name="Aptos", color="8F8275", size=10)
                ws3[f"{col_l2}{ri}"] = "-"
                ws3[f"{col_l2}{ri}"].font = Font(name="Aptos", color="8F8275", size=10)

            for c in [col_l1, col_l2]:
                ws3[f"{c}{ri}"].border = thin_border
                ws3[f"{c}{ri}"].alignment = Alignment(horizontal="right")

            ci += 2

    ws3.freeze_panes = "C2"

    # Save
    output_path.parent.mkdir(parents=True, exist_ok=True)
    wb.save(str(output_path))
    print(json.dumps({"status": "ok", "output": str(output_path)}))


# ── Main ────────────────────────────────────────────────────────────


def main():
    parser = argparse.ArgumentParser(description="Build GTZ-84 Mapa de Cotação package")
    parser.add_argument(
        "--input", required=True, type=Path, help="data.json canonical path"
    )
    parser.add_argument(
        "--output-dir", required=True, type=Path, help="Output directory for package"
    )
    parser.add_argument(
        "--template",
        type=Path,
        default=None,
        help="Optional dashboard-template.html path",
    )
    args = parser.parse_args()

    # Locate template
    template_path = args.template
    if not template_path:
        candidate = (
            Path(__file__).resolve().parents[1]
            / ".fractal/skills/quote-processing/assets/dashboard-template.html"
        )
        if candidate.exists():
            template_path = candidate

    # Read input
    data = json.loads(args.input.read_text(encoding="utf-8"))

    # Enrich
    data = enrich_data(data)

    # Write enriched JSON
    output_json = args.output_dir / "data.json"
    output_json.parent.mkdir(parents=True, exist_ok=True)
    output_json.write_text(
        json.dumps(data, ensure_ascii=False, indent=2), encoding="utf-8"
    )
    print(f"JSON enriched and written: {output_json}")

    # Generate HTML
    html_content = build_html(data, template_path)
    if html_content:
        output_html = args.output_dir / "DASHBOARD.html"
        output_html.write_text(html_content, encoding="utf-8")
        print(f"DASHBOARD.html generated: {output_html}")

    # Generate XLSX
    output_xlsx = args.output_dir / "DASHBOARD.xlsx"
    build_xlsx(data, output_xlsx)
    print(f"DASHBOARD.xlsx generated: {output_xlsx}")

    print("\n✅ Pacote completo gerado com sucesso!")
    print(f"  data.json       → {output_json}")
    print(f"  DASHBOARD.html  → {args.output_dir / 'DASHBOARD.html'}")
    print(f"  DASHBOARD.xlsx  → {output_xlsx}")


if __name__ == "__main__":
    main()

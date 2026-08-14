from __future__ import annotations

import argparse
import json
import math
from collections import defaultdict
from datetime import datetime, timezone
from pathlib import Path


ROOT = Path(
    "/Users/felipebarcelospro/Library/CloudStorage/OneDrive-Personal/Dema Instalacoes/Obras/WISE/Mapa de Cotação"
)
JSON_PATH = ROOT / "MAPA_DE_COTACAO_REF_PEDIDO_006_ELETRICA_WISE_VILA_CLEMENTINO_16062026.json"
HTML_PATH = ROOT / "MAPA_DE_COTACAO_REF_PEDIDO_006_ELETRICA_WISE_VILA_CLEMENTINO_16062026.html"

CUSTOMER_PATH = Path(
    "/Volumes/Sandbox/Sandbox/nubler/dema-instalacoes/.fractal/collections/customers/data/03be712a-263a-46d1-82af-aa18a473d7ed.customers.json"
)

SUPPLIERS = [
    {
        "id": "696bac28-2bdb-493a-a9f6-9bcf134958c5",
        "name": "Santil Comercial Elétrica LTDA",
        "sheet": "Santil",
        "color": "var(--accent)",
    },
    {
        "id": "7891e5e6-8c8c-47b9-a180-f679b40fdb34",
        "name": "FF Guarulhos",
        "sheet": "FF Guarulhos",
        "color": "var(--accent-2)",
    },
    {
        "id": "fb678903-523c-448f-9044-03079e86dfd6",
        "name": "A3 Eletro Comercial LTDA",
        "sheet": "A3 Eletro",
        "color": "#6b5d8f",
    },
    {
        "id": "c8b1a978-fadb-4f7c-a851-28b79b7533bc",
        "name": "Coflex",
        "sheet": "Coflex",
        "color": "#8b6b2e",
    },
    {
        "id": "38160912-1d45-4943-9333-5d2983ef91de",
        "name": "Elecon Indústria e Comércio LTDA",
        "sheet": "Elecon",
        "color": "#4f6b74",
    },
]

SUPPLIER_BY_SHEET = {s["sheet"].lower(): s for s in SUPPLIERS}
SUPPLIER_BY_ID = {s["id"]: s for s in SUPPLIERS}


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


def parse_quantity(value):
    quantity = parse_number(value)
    return quantity if quantity is not None else None


def iso_date(value):
    if not value or value == "-":
        return None
    text = str(value).strip()
    for fmt in ("%d/%m/%Y", "%Y-%m-%d"):
        try:
            return datetime.strptime(text, fmt).date().isoformat()
        except ValueError:
            continue
    return text


def currency_br(value):
    if value is None:
        return "—"
    return f"R$ {float(value):,.2f}".replace(",", "X").replace(".", ",").replace("X", ".")


def classify_group(position: int, description: str) -> dict:
    if 1 <= position <= 7:
        return {
            "id": "linha-4-galvanizada",
            "title": 'Linha 4" galvanizada',
            "subtitle": "Estrutura pesada, curvas e acessórios para o primeiro bloco do mapa.",
        }
    if 8 <= position <= 13 or position in {31, 32, 52, 53, 54}:
        return {
            "id": "pvc-1-1-4-a-3",
            "title": 'PVC 1.1/4" a 3"',
            "subtitle": "Eletrodutos e curvas de PVC que normalmente dominam o comparativo de preço.",
        }
    if 14 <= position <= 17:
        return {
            "id": "acessorios-3",
            "title": 'Acessórios 3"',
            "subtitle": "Peças em alumínio, buchas e arruelas da linha 3.",
        }
    if 18 <= position <= 26 or position == 46 or 61 <= position <= 63:
        return {
            "id": "conduletes-3-4-e-1",
            "title": 'Conduletes 3/4" e 1"',
            "subtitle": "Peças de condulete, tampas e acessórios de uso recorrente.",
        }
    if 27 <= position <= 30 or 39 <= position <= 43 or 55 <= position <= 58:
        return {
            "id": "linha-2-1-2-e-2",
            "title": 'Linha 2" e 2.1/2"',
            "subtitle": "Acessórios de meio porte e itens equivalentes dentro do comparativo.",
        }
    if 33 <= position <= 37 or position in {44, 45, 49, 50, 51, 64, 65, 66, 79, 80}:
        return {
            "id": "fixacao",
            "title": "Fixação",
            "subtitle": "Abraçadeiras, parafusos, arruelas, porcas e itens de suporte.",
        }
    if position in {38, 47, 48, 67, 74}:
        return {
            "id": "caixas-passagem",
            "title": "Caixas de passagem",
            "subtitle": "Caixas, chapas e itens de inspeção ou passagem.",
        }
    if 59 <= position <= 60:
        return {
            "id": "tomadas",
            "title": "Tomadas e módulos",
            "subtitle": "Itens elétricos de acabamento e ponto de consumo.",
        }
    if 68 <= position <= 73:
        return {
            "id": "linha-5",
            "title": 'Linha 5" / 127 mm',
            "subtitle": "Acesso de maior diâmetro, normalmente com menor cobertura entre fornecedores.",
        }
    if 75 <= position <= 83:
        return {
            "id": "validacao",
            "title": "Pendências para validar",
            "subtitle": "Itens sem cotação ou com observação técnica que merecem conferência manual.",
        }
    return {
        "id": "outros",
        "title": "Outros itens",
        "subtitle": "Itens isolados no mapa.",
    }


def item_best_offer(item):
    available = [offer for offer in item["offers"] if offer["unitPrice"] is not None]
    if not available:
        return None
    best = min(available, key=lambda offer: (offer["unitPrice"], offer["totalPrice"] or 0))
    if "supplierName" not in best:
        best = {**best, "supplierName": SUPPLIER_BY_ID[best["supplierId"]]["name"]}
    return best


def item_worst_offer(item):
    available = [offer for offer in item["offers"] if offer["unitPrice"] is not None]
    if not available:
        return None
    worst = max(available, key=lambda offer: (offer["unitPrice"], offer["totalPrice"] or 0))
    if "supplierName" not in worst:
        worst = {**worst, "supplierName": SUPPLIER_BY_ID[worst["supplierId"]]["name"]}
    return worst


def load_base_data():
    data = json.loads(JSON_PATH.read_text(encoding="utf-8"))
    customer = json.loads(CUSTOMER_PATH.read_text(encoding="utf-8"))
    return data, customer


def enrich_items(data):
    items = []
    for raw in data["items"]:
        position = int(raw["position"])
        group = classify_group(position, raw["description"])
        item = {**raw, **group}
        items.append(item)
    return items


def build_groups(items):
    grouped = defaultdict(list)
    for item in items:
        grouped[item["id"]].append(item)

    groups = []
    for group_id, group_items in grouped.items():
        suppliers = []
        for supplier in SUPPLIERS:
            total = 0.0
            covered = 0
            for item in group_items:
                offer = next((o for o in item["offers"] if o["supplierId"] == supplier["id"] and o["unitPrice"] is not None), None)
                if offer and item["quantity"] is not None:
                    total += float(offer["unitPrice"]) * float(item["quantity"])
                    covered += 1
            suppliers.append(
                {
                    "supplierId": supplier["id"],
                    "name": supplier["name"],
                    "sheet": supplier["sheet"],
                    "total": total if covered else None,
                    "covered": covered,
                    "coveragePct": round((covered / len(group_items)) * 100, 1) if group_items else 0.0,
                }
            )

        quoted_suppliers = [s for s in suppliers if s["covered"] > 0]
        best_total_supplier = min(
            quoted_suppliers,
            key=lambda s: (s["total"] if s["total"] is not None else float("inf"), -s["covered"]),
        ) if quoted_suppliers else None
        best_coverage_supplier = max(
            quoted_suppliers,
            key=lambda s: (s["covered"], -(s["total"] or float("inf"))),
        ) if quoted_suppliers else None
        best_offer_total = 0.0
        savings = 0.0
        resolved = 0
        unresolved = []
        for item in group_items:
            best = item_best_offer(item)
            worst = item_worst_offer(item)
            if best and item["quantity"] is not None:
                resolved += 1
                best_offer_total += float(best["unitPrice"]) * float(item["quantity"])
                if worst and worst["unitPrice"] is not None:
                    savings += (float(worst["unitPrice"]) - float(best["unitPrice"])) * float(item["quantity"])
            else:
                unresolved.append(item)

        groups.append(
            {
                "id": group_id,
                "title": group_items[0]["title"],
                "subtitle": group_items[0]["subtitle"],
                "items": sorted(group_items, key=lambda item: item["position"]),
                "suppliers": sorted(
                    suppliers,
                    key=lambda s: (
                        s["total"] is None,
                        s["total"] if s["total"] is not None else float("inf"),
                        -s["covered"],
                    ),
                ),
                "bestTotalSupplier": best_total_supplier,
                "bestCoverageSupplier": best_coverage_supplier,
                "bestOfferTotal": best_offer_total,
                "savings": savings,
                "resolved": resolved,
                "unresolved": unresolved,
            }
        )

    groups.sort(key=lambda group: (-group["savings"], group["title"]))
    return groups


def build_basket(items):
    allocations = {supplier["id"]: {"supplier": supplier, "items": [], "total": 0.0} for supplier in SUPPLIERS}
    unresolved = []
    total = 0.0
    savings = 0.0
    for item in items:
        best = item_best_offer(item)
        worst = item_worst_offer(item)
        if best and item["quantity"] is not None:
            total += float(best["unitPrice"]) * float(item["quantity"])
            allocations[best["supplierId"]]["items"].append(
                {
                    "position": item["position"],
                    "description": item["description"],
                    "group": item["title"],
                    "quantity": item["quantity"],
                    "unit": item["unit"],
                    "price": float(best["unitPrice"]),
                }
            )
            allocations[best["supplierId"]]["total"] += float(best["unitPrice"]) * float(item["quantity"])
            if worst and worst["unitPrice"] is not None:
                savings += (float(worst["unitPrice"]) - float(best["unitPrice"])) * float(item["quantity"])
        else:
            unresolved.append(item)

    supplier_allocations = sorted(
        [
            {
                "supplierId": data["supplier"]["id"],
                "name": data["supplier"]["name"],
                "sheet": data["supplier"]["sheet"],
                "total": data["total"],
                "count": len(data["items"]),
                "items": data["items"],
            }
            for data in allocations.values()
            if data["items"]
        ],
        key=lambda row: row["total"],
    )

    return {
        "total": total,
        "savings": savings,
        "resolvedCount": sum(len(row["items"]) for row in supplier_allocations),
        "unresolvedCount": len(unresolved),
        "supplierAllocations": supplier_allocations,
        "unresolvedItems": unresolved,
    }


def build_item_rows(items):
    rows = []
    for item in items:
        offers = []
        for supplier in SUPPLIERS:
            offer = next((o for o in item["offers"] if o["supplierId"] == supplier["id"]), None)
            offers.append(
                {
                    "supplierId": supplier["id"],
                    "sheet": supplier["sheet"],
                    "name": supplier["name"],
                    "unitPrice": offer["unitPrice"] if offer else None,
                    "totalPrice": offer["totalPrice"] if offer else None,
                    "available": offer is not None and offer["unitPrice"] is not None,
                }
            )
        best = item_best_offer(item)
        worst = item_worst_offer(item)
        rows.append(
            {
                **item,
                "offers": offers,
                "bestSupplierId": best["supplierId"] if best else None,
                "bestSupplierName": best["supplierName"] if best else None,
                "bestUnitPrice": best["unitPrice"] if best else None,
                "bestTotalPrice": best["totalPrice"] if best else None,
                "spread": ((worst["unitPrice"] - best["unitPrice"]) * item["quantity"]) if best and worst and item["quantity"] is not None else None,
                "coverage": sum(1 for offer in offers if offer["available"]),
            }
        )
    return rows


def summarize(data, items, groups, basket):
    total_items = len(items)
    items_without_quotes = len([item for item in items if not item_best_offer(item)])
    group_with_quotes = [group for group in groups if group["resolved"] > 0]
    best_group = group_with_quotes[0] if group_with_quotes else None
    return {
        "totalItems": total_items,
        "supplierCount": len(SUPPLIERS),
        "groupCount": len(groups),
        "groupWithQuotes": len(group_with_quotes),
        "itemsWithoutQuotes": items_without_quotes,
        "basketTotal": basket["total"],
        "basketSavings": basket["savings"],
        "basketResolved": basket["resolvedCount"],
        "basketUnresolved": basket["unresolvedCount"],
        "bestGroupTitle": best_group["title"] if best_group else None,
        "bestGroupSavings": best_group["savings"] if best_group else 0,
    }


HTML_TEMPLATE = r"""<!doctype html>
<html lang="pt-BR">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>__TITLE__</title>
  <style>
    :root {
      --bg: #f4eee5;
      --surface: rgba(255, 255, 255, 0.78);
      --surface-strong: #fffaf2;
      --ink: #201a16;
      --muted: #675a50;
      --line: rgba(79, 56, 40, 0.14);
      --accent: #b5562f;
      --accent-2: #31594d;
      --good: #2d7a54;
      --warn: #a96b18;
      --shadow: 0 18px 48px rgba(58, 35, 22, 0.12);
      --radius-xl: 28px;
      --radius-lg: 20px;
      --radius-md: 14px;
      --radius-sm: 10px;
    }

    * { box-sizing: border-box; }
    html { scroll-behavior: smooth; }
    body {
      margin: 0;
      color: var(--ink);
      background:
        radial-gradient(circle at top left, rgba(181, 86, 47, 0.12), transparent 30%),
        radial-gradient(circle at top right, rgba(49, 89, 77, 0.08), transparent 28%),
        linear-gradient(180deg, #f7f1e8 0%, #f4eee5 40%, #eee5d8 100%);
      font-family: ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
    }
    body::before {
      content: "";
      position: fixed;
      inset: 0;
      pointer-events: none;
      background-image: linear-gradient(rgba(73, 52, 39, 0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(73, 52, 39, 0.04) 1px, transparent 1px);
      background-size: 90px 90px;
      mask-image: linear-gradient(180deg, rgba(0,0,0,0.28), rgba(0,0,0,0.08) 55%, transparent 100%);
      opacity: 0.7;
    }
    a { color: inherit; }
    .wrap { position: relative; z-index: 1; max-width: 1500px; margin: 0 auto; padding: 22px; }
    .page {
      border: 1px solid var(--line);
      border-radius: var(--radius-xl);
      overflow: hidden;
      background: rgba(255,255,255,0.7);
      backdrop-filter: blur(16px);
      box-shadow: var(--shadow);
    }
    .hero {
      padding: 28px;
      background:
        linear-gradient(135deg, rgba(255, 250, 242, 0.96), rgba(255, 247, 236, 0.84)),
        linear-gradient(180deg, rgba(181, 86, 47, 0.06), transparent 55%);
      border-bottom: 1px solid var(--line);
    }
    .eyebrow {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      border-radius: 999px;
      padding: 6px 12px;
      border: 1px solid rgba(181, 86, 47, 0.18);
      background: rgba(255,255,255,0.8);
      color: var(--accent);
      font-size: 11px;
      font-weight: 800;
      text-transform: uppercase;
      letter-spacing: 0.22em;
    }
    .title {
      margin: 14px 0 10px;
      max-width: 1040px;
      font-family: Georgia, "Times New Roman", serif;
      font-size: clamp(36px, 4.6vw, 66px);
      line-height: 0.96;
      letter-spacing: -0.045em;
    }
    .subtitle {
      margin: 0;
      max-width: 920px;
      color: var(--muted);
      font-size: 18px;
      line-height: 1.6;
    }
    .meta {
      display: flex;
      flex-wrap: wrap;
      gap: 10px;
      margin-top: 18px;
    }
    .pill {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      padding: 10px 14px;
      border-radius: 999px;
      border: 1px solid var(--line);
      background: rgba(255,255,255,0.85);
      color: var(--muted);
      font-size: 13px;
    }
    .pill strong { color: var(--ink); }
    .metrics {
      display: grid;
      grid-template-columns: repeat(4, minmax(0, 1fr));
      gap: 14px;
      margin-top: 22px;
    }
    .card {
      border: 1px solid var(--line);
      border-radius: 22px;
      background: rgba(255,255,255,0.8);
      padding: 18px;
    }
    .card .label {
      margin-bottom: 10px;
      color: var(--accent);
      font-size: 11px;
      font-weight: 800;
      text-transform: uppercase;
      letter-spacing: 0.2em;
    }
    .card .value {
      margin: 0 0 8px;
      font-family: Georgia, "Times New Roman", serif;
      font-size: 30px;
      line-height: 1;
      letter-spacing: -0.04em;
    }
    .card .detail {
      margin: 0;
      color: var(--muted);
      font-size: 13px;
      line-height: 1.55;
    }
    .layout {
      display: grid;
      grid-template-columns: minmax(0, 1fr) 340px;
      gap: 18px;
      padding: 20px;
    }
    .main, .side {
      display: grid;
      gap: 18px;
      align-content: start;
    }
    .section {
      border: 1px solid var(--line);
      border-radius: var(--radius-xl);
      background: rgba(255,255,255,0.68);
      box-shadow: var(--shadow);
      overflow: hidden;
    }
    .section-head { padding: 20px 20px 0; }
    .section-head h2 {
      margin: 0;
      font-family: Georgia, "Times New Roman", serif;
      font-size: 28px;
      line-height: 1.1;
      letter-spacing: -0.03em;
    }
    .section-head p {
      margin: 10px 0 0;
      color: var(--muted);
      font-size: 14px;
      line-height: 1.55;
    }
    .toolbar {
      display: flex;
      flex-wrap: wrap;
      gap: 10px;
      padding: 16px 20px 4px;
    }
    .toolbar a, .toolbar button {
      border: 1px solid var(--line);
      border-radius: 999px;
      background: rgba(255,255,255,0.84);
      padding: 10px 14px;
      font-size: 13px;
      font-weight: 700;
      text-decoration: none;
      cursor: pointer;
    }
    .toolbar .primary {
      background: linear-gradient(180deg, rgba(181, 86, 47, 0.96), rgba(154, 70, 39, 0.96));
      color: #fff;
      border-color: rgba(181, 86, 47, 0.88);
    }
    .basket {
      display: grid;
      gap: 12px;
      padding: 18px 20px 20px;
    }
    .basket-hero {
      padding: 18px;
      border-radius: 18px;
      background: linear-gradient(180deg, rgba(49, 89, 77, 0.08), rgba(255,255,255,0.86));
      border: 1px solid rgba(49, 89, 77, 0.14);
    }
    .basket-hero .eyebrow { margin-bottom: 12px; }
    .basket-hero h3 {
      margin: 0 0 8px;
      font-family: Georgia, "Times New Roman", serif;
      font-size: 24px;
      line-height: 1.05;
      letter-spacing: -0.03em;
    }
    .basket-hero p {
      margin: 0;
      color: var(--muted);
      line-height: 1.55;
      font-size: 14px;
    }
    .supplier-grid {
      display: grid;
      gap: 10px;
    }
    .supplier-box {
      border: 1px solid var(--line);
      border-radius: 18px;
      background: rgba(255,255,255,0.9);
      padding: 14px;
    }
    .supplier-box .row {
      display: flex;
      justify-content: space-between;
      gap: 12px;
      align-items: flex-start;
    }
    .supplier-box h4 { margin: 0; font-size: 16px; line-height: 1.2; }
    .supplier-box .amount {
      margin: 8px 0 4px;
      font-family: Georgia, "Times New Roman", serif;
      font-size: 24px;
      letter-spacing: -0.03em;
    }
    .supplier-box .meta {
      margin-top: 8px;
      gap: 8px;
    }
    .chip {
      display: inline-flex;
      align-items: center;
      padding: 4px 8px;
      border-radius: 999px;
      background: rgba(49, 89, 77, 0.08);
      color: var(--accent-2);
      font-size: 12px;
      font-weight: 700;
    }
    .group-nav {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
      padding: 12px 20px 18px;
    }
    .group-nav a {
      text-decoration: none;
      border: 1px solid var(--line);
      background: rgba(255,255,255,0.84);
      border-radius: 999px;
      padding: 8px 12px;
      font-size: 12px;
      font-weight: 700;
      color: var(--muted);
    }
    .group-nav a:hover { color: var(--ink); }
    .groups {
      display: grid;
      gap: 14px;
      padding: 0 20px 20px;
    }
    details.group {
      border: 1px solid var(--line);
      border-radius: 24px;
      background: rgba(255,255,255,0.9);
      overflow: hidden;
    }
    details.group[open] { background: rgba(255,255,255,0.98); }
    details.group summary {
      list-style: none;
      cursor: pointer;
      padding: 18px;
      display: grid;
      grid-template-columns: minmax(0, 1.35fr) repeat(3, minmax(0, 0.75fr));
      gap: 12px;
      align-items: start;
    }
    details.group summary::-webkit-details-marker { display: none; }
    .group-title h3 {
      margin: 0 0 6px;
      font-family: Georgia, "Times New Roman", serif;
      font-size: 24px;
      line-height: 1.08;
      letter-spacing: -0.03em;
    }
    .group-title p {
      margin: 0;
      color: var(--muted);
      font-size: 13px;
      line-height: 1.5;
    }
    .group-stat {
      padding-left: 16px;
      border-left: 1px solid rgba(79, 56, 40, 0.12);
    }
    .group-stat .label {
      color: var(--muted);
      font-size: 11px;
      font-weight: 800;
      text-transform: uppercase;
      letter-spacing: 0.18em;
      margin-bottom: 8px;
    }
    .group-stat .value {
      margin: 0;
      font-family: Georgia, "Times New Roman", serif;
      font-size: 24px;
      line-height: 1.1;
      letter-spacing: -0.03em;
    }
    .group-stat .small {
      margin-top: 6px;
      color: var(--muted);
      font-size: 12px;
      line-height: 1.45;
    }
    .group-body {
      border-top: 1px solid var(--line);
      padding: 16px 18px 18px;
      display: grid;
      gap: 14px;
    }
    .group-suppliers {
      display: grid;
      grid-template-columns: repeat(5, minmax(0, 1fr));
      gap: 10px;
    }
    .price-chip {
      border: 1px solid var(--line);
      border-radius: 16px;
      padding: 12px;
      background: rgba(255,255,255,0.85);
    }
    .price-chip.best {
      border-color: rgba(45, 122, 84, 0.25);
      background: linear-gradient(180deg, rgba(45, 122, 84, 0.08), rgba(255,255,255,0.94));
    }
    .price-chip .name {
      font-size: 12px;
      font-weight: 800;
      text-transform: uppercase;
      letter-spacing: 0.16em;
      color: var(--muted);
      margin-bottom: 8px;
    }
    .price-chip .total {
      font-family: Georgia, "Times New Roman", serif;
      font-size: 22px;
      line-height: 1;
      letter-spacing: -0.03em;
      margin-bottom: 6px;
    }
    .price-chip .foot {
      color: var(--muted);
      font-size: 12px;
      line-height: 1.4;
    }
    .item-table-wrap { overflow-x: auto; }
    table {
      width: 100%;
      border-collapse: separate;
      border-spacing: 0 10px;
      min-width: 980px;
    }
    thead th {
      padding: 0 12px 4px;
      text-align: left;
      color: var(--muted);
      font-size: 11px;
      text-transform: uppercase;
      letter-spacing: 0.16em;
      font-weight: 800;
    }
    tbody tr td {
      background: rgba(255,255,255,0.86);
      border-top: 1px solid var(--line);
      border-bottom: 1px solid var(--line);
      padding: 12px;
      vertical-align: top;
    }
    tbody tr td:first-child {
      border-left: 1px solid var(--line);
      border-radius: 16px 0 0 16px;
    }
    tbody tr td:last-child {
      border-right: 1px solid var(--line);
      border-radius: 0 16px 16px 0;
    }
    .item-name {
      font-weight: 800;
      line-height: 1.35;
    }
    .item-meta {
      margin-top: 6px;
      color: var(--muted);
      font-size: 12px;
      line-height: 1.4;
    }
    .offer-cell {
      font-size: 13px;
      line-height: 1.45;
    }
    .offer-cell.best {
      color: var(--good);
      font-weight: 800;
    }
    .offer-cell.missing {
      color: #a08f82;
    }
    .summary-cell {
      min-width: 150px;
    }
    .mini-chip {
      display: inline-flex;
      margin-top: 6px;
      padding: 4px 8px;
      border-radius: 999px;
      background: rgba(49, 89, 77, 0.08);
      color: var(--accent-2);
      font-size: 12px;
      font-weight: 700;
    }
    .notes {
      padding: 0 20px 20px;
      display: grid;
      gap: 14px;
    }
    .note-box {
      border-left: 4px solid rgba(181, 86, 47, 0.42);
      background: rgba(181, 86, 47, 0.07);
      border-radius: 14px;
      padding: 14px 16px;
      color: var(--muted);
      font-size: 13px;
      line-height: 1.6;
    }
    .pending-list {
      display: grid;
      gap: 10px;
    }
    .pending-item {
      border: 1px solid var(--line);
      border-radius: 16px;
      background: rgba(255,255,255,0.88);
      padding: 12px 14px;
      display: flex;
      justify-content: space-between;
      gap: 12px;
      align-items: flex-start;
    }
    .pending-item strong { display: block; margin-bottom: 4px; }
    .footer {
      padding: 18px 20px 22px;
      color: var(--muted);
      font-size: 13px;
      line-height: 1.6;
      display: flex;
      flex-wrap: wrap;
      justify-content: space-between;
      gap: 10px;
      align-items: center;
    }
    .footer .buttons {
      display: flex;
      gap: 10px;
      flex-wrap: wrap;
    }
    .footer a {
      display: inline-flex;
      align-items: center;
      border: 1px solid var(--line);
      border-radius: 999px;
      background: rgba(255,255,255,0.85);
      padding: 10px 14px;
      font-size: 13px;
      font-weight: 700;
      text-decoration: none;
    }
    .footer a.primary {
      background: linear-gradient(180deg, rgba(181, 86, 47, 0.96), rgba(154, 70, 39, 0.96));
      color: #fff;
      border-color: rgba(181, 86, 47, 0.88);
    }
    @media (max-width: 1220px) {
      .layout { grid-template-columns: 1fr; }
      details.group summary { grid-template-columns: 1fr 1fr; }
      .group-stat { padding-left: 0; border-left: 0; }
      .group-suppliers { grid-template-columns: repeat(2, minmax(0, 1fr)); }
      .metrics { grid-template-columns: repeat(2, minmax(0, 1fr)); }
    }
    @media (max-width: 760px) {
      .wrap { padding: 12px; }
      .hero { padding: 20px; }
      .layout { padding: 14px; }
      .metrics { grid-template-columns: 1fr; }
      details.group summary { grid-template-columns: 1fr; }
      .group-suppliers { grid-template-columns: 1fr; }
      .footer { flex-direction: column; align-items: stretch; }
      .footer .buttons { width: 100%; }
      .footer a { justify-content: center; }
      table { min-width: 860px; }
    }
  </style>
</head>
<body>
  <div class="wrap">
    <main class="page" id="top">
      <section class="hero">
        <div class="eyebrow">Dema Instalações • Mapa de Cotação Inteligente</div>
        <h1 class="title">Mapa de cotação pronto para decisão, com grupos de compra e cesta ótima por fornecedor.</h1>
        <p class="subtitle">Esta versão foi desenhada para um gestor tradicional: primeiro ele vê o melhor jeito de comprar, depois os grupos de itens e só então o detalhe linha a linha. A ideia é simplificar a leitura sem esconder informação técnica.</p>
        <div class="meta">
          <span class="pill"><strong>Pedido ref.</strong> 006 • Elétrica</span>
          <span class="pill"><strong>Obra</strong> __CUSTOMER__</span>
          <span class="pill"><strong>Mapa</strong> __MAP_DATE__</span>
          <span class="pill"><strong>Origem</strong> __EMAIL_SUBJECT__</span>
        </div>
        <div class="metrics">
          <article class="card"><div class="label">Cesta ótima</div><h3 class="value">__BASKET_TOTAL__</h3><p class="detail">Menor custo linha a linha usando o melhor preço disponível em cada item cotado.</p></article>
          <article class="card"><div class="label">Economia capturável</div><h3 class="value">__SAVINGS__</h3><p class="detail">Diferença entre o pior e o melhor preço disponível nas linhas comparáveis do mapa.</p></article>
          <article class="card"><div class="label">Itens sem cotação</div><h3 class="value">__NO_QUOTE__</h3><p class="detail">Linhas que precisam validação manual antes de fechar a compra.</p></article>
          <article class="card"><div class="label">Fornecedores</div><h3 class="value">__SUPPLIER_COUNT__</h3><p class="detail">Comparativo consolidado entre todos os fornecedores presentes no mapa.</p></article>
        </div>
      </section>

      <div class="layout">
        <div class="main">
          <section class="section" id="basket">
            <div class="section-head">
              <h2>1. A compra mais econômica</h2>
              <p>Se a prioridade for economia, esta é a combinação sugerida pelo mapa: cada item vai para o fornecedor com o menor preço unitário disponível.</p>
            </div>
            <div class="basket">
              <div class="basket-hero">
                <div class="eyebrow">Recomendação principal</div>
                <h3>Pedido distribuído entre fornecedores, com foco no menor preço por item.</h3>
                <p>O total abaixo soma só as linhas com cotação disponível. As pendências aparecem separadas, para o gestor não misturar compra pronta com item ainda em aberto.</p>
              </div>
              <div class="supplier-grid" id="basketSuppliers"></div>
            </div>
          </section>

          <section class="section" id="groups">
            <div class="section-head">
              <h2>2. Grupos de compra</h2>
              <p>Os itens foram agrupados por família técnica. Cada grupo mostra os fornecedores que realmente têm cotação naquela família, sem deixar o gestor perdido numa lista única gigante.</p>
            </div>
            <div class="group-nav" id="groupNav"></div>
            <div class="groups" id="groupList"></div>
          </section>

          <section class="section" id="pending">
            <div class="section-head">
              <h2>3. Pendências para validar</h2>
              <p>Itens sem cotação ou com necessidade técnica ficaram separados da compra principal para não contaminar a leitura da proposta.</p>
            </div>
            <div class="notes">
              <div class="pending-list" id="pendingList"></div>
              <div class="note-box">
                <strong>Critério do painel:</strong> grupo bom é grupo com fornecedor e preço. Se um item não tem cotação, ele não entra em grupo comparável e vai para pendência.
              </div>
            </div>
          </section>
        </div>

        <aside class="side">
          <section class="section">
            <div class="section-head">
              <h2>Painel rápido</h2>
              <p>Leitura executiva para bater o olho e decidir por onde começar.</p>
            </div>
            <div class="basket">
              <div class="card" style="background: linear-gradient(180deg, rgba(49, 89, 77, 0.08), rgba(255,255,255,0.84));">
                <div class="label">Grupo mais sensível</div>
                <h3 class="value" style="font-size:24px;">__BEST_GROUP__</h3>
                <p class="detail">Maior potencial de economia entre os grupos já comparáveis.</p>
              </div>
              <div class="card">
                <div class="label">Itens comparáveis</div>
                <h3 class="value" style="font-size:24px;">__RESOLVED_COUNT__</h3>
                <p class="detail">Linhas que permitem escolher preço com segurança entre os fornecedores.</p>
              </div>
              <div class="card">
                <div class="label">Cobertura de grupos</div>
                <h3 class="value" style="font-size:24px;">__GROUP_COUNT__</h3>
                <p class="detail">Agrupamentos técnicos úteis, pensados para um gestor tradicional ler sem esforço.</p>
              </div>
            </div>
          </section>
          <section class="section">
            <div class="section-head">
              <h2>Legenda</h2>
              <p>Como ler o destaque dos valores.</p>
            </div>
            <div class="basket">
              <div class="chip">Verde: melhor preço</div>
              <div class="chip">Marrom: prioridade estratégica</div>
              <div class="chip">Cinza: item sem cotação suficiente</div>
              <div class="chip">Tabela: comparação por fornecedor</div>
            </div>
          </section>
        </aside>
      </div>

      <div class="footer">
        <div>Fonte: __EMAIL_SUBJECT__ • __EMAIL_ID__ • JSON único com customer, suppliers, quotes, items e timestamps.</div>
        <div class="buttons">
          <a class="primary" href="./data.json" download>Baixar JSON</a>
          <a href="./DASHBOARD.xlsx">Abrir XLSX</a>
          <a href="#top">Voltar ao topo</a>
        </div>
      </div>
    </main>
  </div>

  <script id="data" type="application/json">__DATA__</script>
  <script>
    const data = JSON.parse(document.getElementById('data').textContent);
    const currency = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });
    const integer = new Intl.NumberFormat('pt-BR');
    const fmtMoney = (value) => value == null ? '—' : currency.format(Number(value));
    const fmtInt = (value) => value == null ? '—' : integer.format(Number(value));
    const escapeHtml = (value) => String(value ?? '')
      .replaceAll('&', '&amp;')
      .replaceAll('<', '&lt;')
      .replaceAll('>', '&gt;')
      .replaceAll('"', '&quot;')
      .replaceAll("'", '&#39;');

    const el = {
      basketSuppliers: document.getElementById('basketSuppliers'),
      groupNav: document.getElementById('groupNav'),
      groupList: document.getElementById('groupList'),
      pendingList: document.getElementById('pendingList'),
    };

    const groupSummaries = data.groups.map((group) => ({
      id: group.id,
      title: group.title,
      items: group.items.length,
      savings: group.savings,
    }));

    function renderBasket() {
      el.basketSuppliers.innerHTML = data.basket.supplierAllocations.map((supplier) => {
        const items = supplier.items.slice(0, 5).map((item) => `${item.position}. ${item.description}`).join('<br>');
        return `
          <article class="supplier-box">
            <div class="row">
              <div>
                <h4>${escapeHtml(supplier.name)}</h4>
                <div class="meta">
                  <span class="chip">${supplier.count} itens</span>
                  <span class="chip">melhor cesta</span>
                </div>
              </div>
              <div class="chip">#${supplier.sheet}</div>
            </div>
            <div class="amount">${fmtMoney(supplier.total)}</div>
            <div class="meta" style="margin-bottom: 8px;">
              <span class="chip">Itens alocados: ${supplier.count}</span>
              <span class="chip">Participação: ${data.basket.total ? ((supplier.total / data.basket.total) * 100).toFixed(1) : '0.0'}%</span>
            </div>
            <div class="detail" style="color: var(--muted); font-size: 12px; line-height: 1.5;">${items || 'Sem itens alocados.'}</div>
          </article>
        `;
      }).join('');
    }

    function renderGroupNav() {
      el.groupNav.innerHTML = data.groups.map((group) => `
        <a href="#group-${group.id}">${escapeHtml(group.title)} (${group.items.length})</a>
      `).join('');
    }

    function renderGroups() {
      el.groupList.innerHTML = data.groups.map((group, index) => {
        const supplierCards = group.suppliers.map((supplier, supplierIndex) => {
          const isBest = group.bestTotalSupplier && supplier.supplierId === group.bestTotalSupplier.supplierId;
          return `
            <div class="price-chip ${isBest ? 'best' : ''}">
              <div class="name">${escapeHtml(supplier.sheet)}</div>
              <div class="total">${supplier.total == null ? '—' : fmtMoney(supplier.total)}</div>
              <div class="foot">${supplier.covered}/${group.items.length} itens neste grupo</div>
            </div>
          `;
        }).join('');

        const rows = group.items.map((item) => {
          const offers = item.offers.map((offer) => {
            const price = offer.available ? fmtMoney((offer.unitPrice || 0) * (item.quantity || 0)) : '—';
            const cls = offer.available ? (offer.supplierId === item.bestSupplierId ? 'offer-cell best' : 'offer-cell') : 'offer-cell missing';
            return `<td><div class="${cls}">${price}</div></td>`;
          }).join('');
          const bestLabel = item.bestSupplierName ? `${item.bestSupplierName} • ${fmtMoney(item.bestUnitPrice)}` : 'Sem cotação';
          return `
            <tr>
              <td>
                <div class="item-name">${item.position}. ${escapeHtml(item.description)}</div>
                <div class="item-meta">${escapeHtml(item.reference || '—')} • ${escapeHtml(item.manufacturer || '—')} • ${escapeHtml(item.ncm || '—')}</div>
              </td>
              <td class="summary-cell">
                <div class="item-name">${fmtInt(item.quantity)} ${escapeHtml(item.unit || '')}</div>
                <div class="mini-chip">Cobertura ${item.coverage}/5</div>
              </td>
              ${offers}
              <td class="summary-cell">
                <div class="item-name">${escapeHtml(bestLabel)}</div>
                <div class="item-meta">${item.spread ? `Economia por linha: ${fmtMoney(item.spread)}` : 'Sem spread calculável.'}</div>
              </td>
            </tr>
          `;
        }).join('');

        const summaryOpen = index === 0 ? 'open' : '';
        const bestGroup = group.bestTotalSupplier ? `${group.bestTotalSupplier.name}` : 'Sem grupo vencedor';
        const coverageGroup = group.bestCoverageSupplier ? `${group.bestCoverageSupplier.name}` : 'Sem cobertura total';
        return `
          <details class="group" id="group-${group.id}" ${summaryOpen}>
            <summary>
              <div class="group-title">
                <h3>${escapeHtml(group.title)}</h3>
                <p>${escapeHtml(group.subtitle)}</p>
              </div>
              <div class="group-stat">
                <div class="label">Itens</div>
                <p class="value">${group.items.length}</p>
                <div class="small">Grupo pensado para leitura rápida do gestor.</div>
              </div>
              <div class="group-stat">
                <div class="label">Melhor soma disponível</div>
                <p class="value">${group.bestTotalSupplier ? fmtMoney(group.bestTotalSupplier.total) : '—'}</p>
                <div class="small">${escapeHtml(bestGroup)}</div>
              </div>
              <div class="group-stat">
                <div class="label">Economia capturável</div>
                <p class="value">${fmtMoney(group.savings)}</p>
                <div class="small">${escapeHtml(coverageGroup)}</div>
              </div>
            </summary>
            <div class="group-body">
              <div class="group-suppliers">${supplierCards}</div>
              <div class="item-table-wrap">
                <table>
                  <thead>
                    <tr>
                      <th>Item</th>
                      <th>Qtd</th>
                      <th>Santil</th>
                      <th>FF</th>
                      <th>A3</th>
                      <th>Coflex</th>
                      <th>Elecon</th>
                      <th>Leitura</th>
                    </tr>
                  </thead>
                  <tbody>
                    ${rows}
                  </tbody>
                </table>
              </div>
            </div>
          </details>
        `;
      }).join('');
    }

    function renderPending() {
      el.pendingList.innerHTML = data.pendingItems.map((item) => `
        <article class="pending-item">
          <div>
            <strong>${item.position}. ${escapeHtml(item.description)}</strong>
            <div style="color: var(--muted); font-size: 13px; line-height: 1.5;">${escapeHtml(item.reference || '—')} • ${escapeHtml(item.manufacturer || '—')} • ${escapeHtml(item.ncm || '—')}</div>
          </div>
          <div class="chip">Validar antes de fechar</div>
        </article>
      `).join('');
    }

    renderBasket();
    renderGroupNav();
    renderGroups();
    renderPending();
  </script>
</body>
</html>
"""


def build_html(data, customer):
    number = data.get("number") or data.get("pedido", {}).get("number") or ""
    quote_type = data.get("type", "")
    approved_template = (
        Path(__file__).resolve().parents[1]
        / ".fractal/skills/quote-processing/assets/dashboard-template.html"
    )
    html = (
        approved_template.read_text(encoding="utf-8")
        if approved_template.exists()
        else HTML_TEMPLATE
    )
    heading = f"Pedido {number} {quote_type} | {customer['name']}".replace("  ", " ").strip()
    html = html.replace("__HEADING__", heading)
    html = html.replace("__TITLE__", f"Mapa de Cotação | Pedido {number} {quote_type} | {customer['name']}")
    html = html.replace("__CUSTOMER__", customer["name"])
    html = html.replace("__MAP_DATE__", data.get("timestamps", {}).get("mapDate") or "—")
    html = html.replace("__EMAIL_SUBJECT__", data.get("source", {}).get("emailSubject") or "Fontes reconciliadas")
    html = html.replace("__EMAIL_ID__", str(data.get("source", {}).get("emailId") or "—"))
    html = html.replace("__BASKET_TOTAL__", currency_br(data["summary"]["basketTotal"]))
    html = html.replace("__SAVINGS__", currency_br(data["summary"]["basketSavings"]))
    html = html.replace("__NO_QUOTE__", str(data["summary"]["itemsWithoutQuotes"]))
    html = html.replace("__SUPPLIER_COUNT__", str(data["summary"]["supplierCount"]))
    html = html.replace("__BEST_GROUP__", data["summary"]["bestGroupTitle"] or "—")
    html = html.replace("__RESOLVED_COUNT__", str(data["summary"]["basketResolved"]))
    html = html.replace("__GROUP_COUNT__", str(data["summary"]["groupCount"]))

    serializable = json.dumps(data, ensure_ascii=False)
    serializable = serializable.replace("</", "<\\/")
    html = html.replace("__DATA__", serializable)
    return html


def parse_args():
    parser = argparse.ArgumentParser(description="Build or render a Dema quotation-map dashboard.")
    parser.add_argument("--input", type=Path, default=JSON_PATH, help="Input JSON path.")
    parser.add_argument("--output-json", type=Path, default=None, help="Canonical JSON output path.")
    parser.add_argument("--output-html", type=Path, default=HTML_PATH, help="Dashboard HTML output path.")
    parser.add_argument("--canonical", action="store_true", help="Render an already canonical map JSON.")
    return parser.parse_args()


def main():
    args = parse_args()
    if args.canonical:
        output = json.loads(args.input.read_text(encoding="utf-8"))
        customer = output.get("customer") or {"name": "Cliente"}
        output_json = args.output_json or args.input
        output_json.parent.mkdir(parents=True, exist_ok=True)
        output_json.write_text(json.dumps(output, ensure_ascii=False, indent=2), encoding="utf-8")
        args.output_html.parent.mkdir(parents=True, exist_ok=True)
        args.output_html.write_text(build_html(output, customer), encoding="utf-8")
        return

    raw_data, customer = load_base_data()
    items = enrich_items(raw_data)
    items = build_item_rows(items)
    groups = build_groups(items)
    basket = build_basket(items)
    summary = summarize(raw_data, items, groups, basket)

    pending_items = [item for item in items if not item_best_offer(item)]

    output = {
        "id": raw_data["id"],
        "name": raw_data["name"],
        "type": raw_data["type"],
        "customer": raw_data["customer"],
        "timestamps": raw_data["timestamps"],
        "source": raw_data["source"],
        "summary": summary,
        "suppliers": raw_data["suppliers"],
        "quotes": raw_data["quotes"],
        "items": items,
        "groups": groups,
        "basket": basket,
        "pendingItems": pending_items,
    }

    output_json = args.output_json or args.input
    output_json.parent.mkdir(parents=True, exist_ok=True)
    output_json.write_text(json.dumps(output, ensure_ascii=False, indent=2), encoding="utf-8")
    args.output_html.parent.mkdir(parents=True, exist_ok=True)
    args.output_html.write_text(build_html(output, customer), encoding="utf-8")


if __name__ == "__main__":
    main()

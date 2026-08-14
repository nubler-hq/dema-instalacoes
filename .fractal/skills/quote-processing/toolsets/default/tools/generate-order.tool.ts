import { spawnSync } from "child_process"
import * as fs from "fs"
import * as path from "path"
import { FractalTool } from "@fractal-os/plugin"
import { z } from "zod"

const OBRA_NAME: Record<string, string> = {
  "gtz-84": "GTZ-84",
  "or-ryt": "OR-RYT",
  wise: "WISE",
}

function ascii(value: unknown): string {
  return String(value ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
}

function filePart(value: unknown, separator = "-"): string {
  return ascii(value)
    .replace(/[^a-zA-Z0-9]+/g, separator)
    .replace(new RegExp(`^\\${separator}+|\\${separator}+$`, "g"), "")
}

function supplierFileName(supplier: Record<string, unknown>): string {
  return filePart(supplier.slug ?? supplier.name ?? "Fornecedor")
}

function quoteStem(
  quote: Record<string, any>,
  supplier: Record<string, unknown>
): string {
  const source =
    quote.sourceFile ??
    (String(quote.file ?? "")
      .toLowerCase()
      .endsWith(".pdf")
      ? quote.file
      : "")
  if (source) return path.basename(source, path.extname(source))
  const reference = filePart(quote.quote || "Sem-Referencia")
  return `Orcamento-${supplierFileName(supplier)}-${reference}`
}

async function generateSpreadsheet(
  quoteId: string,
  fractal: any
): Promise<Record<string, unknown>> {
  const collections = fractal.workspace.core.collections
  const quote = await collections
    .get("quotes")
    .findUnique({ where: { id: quoteId } })
  if (!quote) return { status: "error", message: `Quote not found: ${quoteId}` }
  if (!quote.customer || !quote.supplier) {
    return {
      status: "error",
      message: `Quote ${quoteId} must reference customer and supplier`,
    }
  }

  const customer = await collections
    .get("customers")
    .findUnique({ where: { id: quote.customer } })
  const supplier = await collections
    .get("suppliers")
    .findUnique({ where: { id: quote.supplier } })
  if (!customer)
    return { status: "error", message: `Customer not found: ${quote.customer}` }
  if (!supplier)
    return { status: "error", message: `Supplier not found: ${quote.supplier}` }

  const slug = customer.slug ?? filePart(customer.name).toLowerCase()
  const templateCandidates: Array<[string, string]> = [
    [
      `.fractal/artifacts/docs/customers/${slug}/templates/PEDIDO.xlsx`,
      `.fractal/artifacts/docs/customers/${slug}/templates/PEDIDO.script.py`,
    ],
    [
      `.fractal/artifacts/docs/customers/or-${slug}/templates/PEDIDO.xlsx`,
      `.fractal/artifacts/docs/customers/or-${slug}/templates/PEDIDO.script.py`,
    ],
    [
      `.fractal/artifacts/docs/templates/PEDIDO-GERAL.xlsx`,
      `.fractal/artifacts/docs/templates/PEDIDO-GERAL.script.py`,
    ],
  ]

  let template = ""
  let script = ""
  for (const [templateRel, scriptRel] of templateCandidates) {
    const templateAbs = fractal.workspace.path("workspace", templateRel)
    const scriptAbs = fractal.workspace.path("workspace", scriptRel)
    if (fs.existsSync(templateAbs) && fs.existsSync(scriptAbs)) {
      template = templateAbs
      script = scriptAbs
      break
    }
  }
  if (!template) {
    return {
      status: "error",
      message: `No Dema spreadsheet template found for customer "${slug}"`,
    }
  }

  const obra = OBRA_NAME[slug] ?? filePart(slug).toUpperCase()
  const number = String(quote.number ?? "").padStart(3, "0")
  const pedidoFolder = `${number}-${quote.type}`
  const stem = quoteStem(quote, supplier)
  const outputRel = `.fractal/drive/Obras/${obra}/Pedidos/${pedidoFolder}/Orçamentos/${stem}.xlsx`
  const outputAbs = fractal.workspace.path("workspace", outputRel)

  const ctx: Record<string, unknown> = {
    "quote.number": number,
    "quote.type": quote.type ?? "",
    "quote.paymentTerms": quote.paymentTerms ?? "",
    "quote.freight": quote.freight ?? "",
    "quote.deliveryDays": quote.deliveryDays ?? "",
    "quote.quote": quote.quote ?? "",
    datetime: new Date().toLocaleDateString("pt-BR"),
    "customer.name": customer.name ?? "",
    "customer.slug": slug,
    "customer.document": customer.document ?? "",
    "customer.ie": customer.ie ?? "",
    "customer.address":
      customer.addresses?.billing ?? customer.addresses?.delivery ?? "",
    "customer.postalCode": customer.postalCode ?? "",
    "customer.phone": customer.phone ?? "",
    "customer.billingEmail": customer.billingEmail ?? "",
    "customer.client": customer.client ?? customer.name ?? "",
    // Mapeamento project.* (mesmo que customer.*) para templates que usam {project.name} etc.
    "project.name": customer.name ?? "",
    "project.slug": slug,
    "project.document": customer.document ?? "",
    "project.ie": customer.ie ?? "",
    "project.address":
      customer.addresses?.billing ?? customer.addresses?.delivery ?? "",
    "project.postalCode": customer.postalCode ?? "",
    "project.phone": customer.phone ?? "",
    "project.billingEmail": customer.billingEmail ?? "",
    "obra.name": obra,
    "pedido.number": number,
    "pedido.folder": pedidoFolder,
    "supplier.name": supplier.name ?? "",
    "supplier.documents.cnpj": supplier.documents?.cnpj ?? "",
    "supplier.documents.ie": supplier.documents?.ie ?? "",
    "supplier.address": supplier.address ?? "",
    "supplier.phone": supplier.phone ?? "",
    "supplier.email": supplier.email ?? "",
    "supplier.contact": supplier.contact ?? "",
    "supplier.postalCode": supplier.postalCode ?? "",
    notes: quote.notes ?? "",
    _items: quote.items ?? [],
  }

  fs.mkdirSync(path.dirname(outputAbs), { recursive: true })
  const result = spawnSync(
    "python3",
    [script, template, JSON.stringify(ctx), outputAbs],
    {
      encoding: "utf-8",
      timeout: 60_000,
    }
  )
  if (result.status !== 0) {
    return {
      status: "error",
      message: `Spreadsheet generator failed (${result.status}): ${result.stderr || result.stdout}`,
    }
  }

  await collections.get("quotes").update({
    where: { id: quoteId },
    data: {
      normalizedFile: outputRel,
      file: outputRel,
      comparisonStatus: "ready",
    },
  })

  return {
    status: "success",
    quoteId,
    customer: customer.name,
    supplier: supplier.name,
    order: `${number}-${quote.type}`,
    sourceFile: quote.sourceFile ?? null,
    normalizedFile: outputRel,
    items: quote.items?.length ?? 0,
  }
}

function spreadsheetTool(name: string, description: string) {
  return FractalTool.create(name)
    .withDescription(description)
    .withSchema(
      z.object({
        quoteId: z.string().describe("UUID of the quotes collection record"),
      })
    )
    .withHandler(async ({ input, fractal }) =>
      generateSpreadsheet(input.quoteId, fractal)
    )
    .build()
}

export const generateQuoteSpreadsheetTool = spreadsheetTool(
  "generate_quote_spreadsheet",
  "Generates the normalized Dema XLSX beside the supplier PDF with the same filename stem."
)

export const generateOrderTool = spreadsheetTool(
  "generate_order",
  "Backward-compatible alias for generate_quote_spreadsheet."
)

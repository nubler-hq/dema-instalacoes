import * as fs from "fs"
import * as path from "path"
import { FractalTool } from "@fractal-os/plugin"
import { z } from "zod"

const OBRA_NAME: Record<string, string> = {
  "gtz-84": "GTZ-84",
  "or-ryt": "OR-RYT",
  wise: "WISE",
}

function normalizeReference(value: unknown): string {
  return String(value ?? "").toUpperCase().replace(/[^A-Z0-9]/g, "")
}

export const auditPedidoTool = FractalTool.create("audit_pedido")
  .withDescription("Reconciles quote collection records with PDF/XLSX files in a pedido Drive folder.")
  .withSchema(
    z.object({
      customerId: z.string(),
      number: z.string().regex(/^\d{1,3}$/),
      type: z.string().min(1),
    }),
  )
  .withHandler(async ({ input, fractal }) => {
    const collections: any = fractal.workspace.core.collections
    const customer = await collections.get("customers").findUnique({ where: { id: input.customerId } })
    if (!customer) return { status: "error", message: `Customer not found: ${input.customerId}` }

    const allQuotes = await collections.get("quotes").findMany()
    const number = input.number.padStart(3, "0")
    const quotes = allQuotes.filter(
      (quote: any) =>
        quote.customer === input.customerId &&
        String(quote.number).padStart(3, "0") === number &&
        quote.type === input.type,
    )

    const obra = OBRA_NAME[customer.slug] ?? String(customer.slug ?? customer.name).toUpperCase()
    const folderRel = `.fractal/drive/Obras/${obra}/Pedidos/${number}-${input.type}/Orçamentos`
    const folderAbs = fractal.workspace.path("workspace", folderRel)
    const files = fs.existsSync(folderAbs)
      ? fs.readdirSync(folderAbs).filter((file) => /\.(pdf|xlsx)$/i.test(file))
      : []

    const pdfs = files.filter((file) => file.toLowerCase().endsWith(".pdf"))
    const xlsx = files.filter((file) => file.toLowerCase().endsWith(".xlsx"))
    const missingSidecars = pdfs.filter(
      (pdf) => !xlsx.some((sheet) => path.basename(sheet, ".xlsx") === path.basename(pdf, ".pdf")),
    )
    const orphanSidecars = xlsx.filter(
      (sheet) => !pdfs.some((pdf) => path.basename(pdf, ".pdf") === path.basename(sheet, ".xlsx")),
    )

    const records = quotes.map((quote: any) => ({
      id: quote.id,
      supplier: quote.supplier,
      proposal: quote.quote ?? null,
      email: quote.email ?? null,
      sourceFile: quote.sourceFile ?? (String(quote.file ?? "").endsWith(".pdf") ? quote.file : null),
      normalizedFile:
        quote.normalizedFile ?? (String(quote.file ?? "").endsWith(".xlsx") ? quote.file : null),
      sourceExists: Boolean(
        quote.sourceFile && fs.existsSync(fractal.workspace.path("workspace", quote.sourceFile)),
      ),
      normalizedExists: Boolean(
        quote.normalizedFile && fs.existsSync(fractal.workspace.path("workspace", quote.normalizedFile)),
      ),
    }))

    const duplicateKeys = new Map<string, string[]>()
    for (const quote of quotes) {
      const key = `${quote.supplier}:${normalizeReference(quote.quote)}`
      duplicateKeys.set(key, [...(duplicateKeys.get(key) ?? []), quote.id])
    }
    const duplicates = [...duplicateKeys.entries()]
      .filter(([, ids]) => ids.length > 1)
      .map(([identity, ids]) => ({ identity, quoteIds: ids }))

    const issues = [
      ...missingSidecars.map((file) => `Missing XLSX sidecar for ${file}`),
      ...orphanSidecars.map((file) => `XLSX sidecar has no matching PDF: ${file}`),
      ...records.filter((record) => !record.email).map((record) => `Quote ${record.id} has no email ID`),
      ...records
        .filter((record) => record.sourceFile && !record.sourceExists)
        .map((record) => `Quote ${record.id} sourceFile does not exist`),
      ...records
        .filter((record) => record.normalizedFile && !record.normalizedExists)
        .map((record) => `Quote ${record.id} normalizedFile does not exist`),
      ...duplicates.map((duplicate) => `Duplicate quote identity: ${duplicate.identity}`),
    ]

    return {
      status: issues.length ? "needs_review" : "ready",
      pedido: { customerId: input.customerId, customer: customer.name, obra, number, type: input.type },
      folder: folderRel,
      counts: { records: quotes.length, pdfs: pdfs.length, xlsx: xlsx.length },
      records,
      files: { pdfs, xlsx },
      missingSidecars,
      orphanSidecars,
      duplicates,
      issues,
    }
  })
  .build()

import z from "zod"

import { FractalCollection } from "@fractal-os/plugin"

/**
 * Ordena os itens por description (A-Z, com locale pt-BR) e valida
 * se não há descrições duplicadas. Lança erro detalhado se encontrar.
 */
function _validateAndSortItems(
  items: Array<{ description: string; [key: string]: unknown }>
): void {
  // 1. Detecta duplicatas (case-insensitive, ignorando espaços nas pontas)
  const seen = new Map<string, number[]>()
  for (let i = 0; i < items.length; i++) {
    const key = items[i].description.trim().toLowerCase()
    if (!seen.has(key)) {
      seen.set(key, [])
    }
    seen.get(key)!.push(i + 1) // posição 1-based para o usuário
  }

  const duplicates = Array.from(seen.entries()).filter(
    ([_, positions]) => positions.length > 1
  )

  if (duplicates.length > 0) {
    const details = duplicates
      .map(
        ([desc, positions]) =>
          `"${desc}" aparece nas linhas ${positions.join(", ")}`
      )
      .join("; ")
    throw new Error(
      `[Itens duplicados] ${details}. ` +
        `Remova ou renomeie os itens duplicados antes de salvar.`
    )
  }

  // 2. Ordena alfabeticamente por description (locale pt-BR)
  items.sort((a, b) =>
    a.description.localeCompare(b.description, "pt-BR", {
      sensitivity: "base",
      ignorePunctuation: true,
    })
  )
}

/**
 * Fractal Custom Collection: quotes
 *
 * Registro completo de pedidos de compra/cotações.
 * Referencia customers e fornecedores por ID (sem redundância de dados).
 *
 * @see https://zod.dev/v4 - Zod v4 documentation
 */
export default FractalCollection.create("quotes")
  .withPatterns([".fractal/collections/quotes/data/{id}.quotes.json"])
  .withSchema(
    z.object({
      // Referências (IDs de outras collections)
      customer: z.string(), // ID do customer/obra (ex: "wise-vila-clementino")
      supplier: z.string().optional(), // ID do fornecedor (quando definido)

      // Identificação do pedido
      number: z.string(), // Número do pedido: "005", "006", "2105/26"
      type: z.string(), // Tipo: "Elétrica", "Hidráulica", "Fixação"
      quote: z.string().optional(), // Número da cotação/proposta: "23876", "844.448"

      // Condições comerciais
      paymentTerms: z.string().optional(), // "28 dias"
      freight: z.string().optional(), // "CIF", "FOB"
      deliveryDays: z.number().optional(), // 7

      // Termos personalizados do pedido (substituem textos fixos do template)
      terms: z
        .object({
          deliveryTimeframe: z.string().optional(), // Ex: "Itens de estoque em até 2 dias para a Grande São Paulo"
          billingNote: z.string().optional(), // Ex: "Não emitir nota fiscal após o dia 25"
          deliveryHours: z.string().optional(), // Ex: "8:00 HS AS 11:00 HS E DAS 13:00 HS AS 16:00 HS"
          generalTerms: z.string().optional(), // Ex: "NÃO SERÁ ACEITO EM HIPOTESE NENHUMA NEGOCIAÇÃO DE TÍTULOS CONTRA TERCEIROS"
          observations: z.string().optional(), // Ex: "Pedido mínimo R$ 300,00. Trocas em até 60 dias..."
        })
        .optional(),

      // Faturamento
      invoice: z
        .object({
          name: z.string(), // "SMG22 Empreendimentos Imobiliários SPE LTDA"
          cnpj: z.string(), // "48.868.032/0001-30"
        })
        .optional(),

      // Itens orçados
      items: z
        .array(
          z.object({
            position: z.number().int().positive().optional(),
            description: z.string(), // "Caixa Octogonal Teto Snap Fit"
            sourceDescription: z.string().optional(),
            reference: z.string().optional(),
            manufacturer: z.string().optional(),
            ncm: z.string().optional(),
            quantity: z.number(), // 1700
            unit: z.string(), // "pc", "rolos"
            sourceQuantity: z.number().optional(),
            sourceUnit: z.string().optional(),
            unitPrice: z.number().optional(),
            totalPrice: z.number().optional(),
            comparisonUnitPrice: z.number().optional(),
            comparisonTotalPrice: z.number().optional(),
            notes: z.string().optional(),
          })
        )
        .optional(),

      // Totais
      subtotal: z.number().optional(),
      taxes: z.number().optional(),
      total: z.number().optional(), // R$ 6.930,00

      // Arquivos operacionais (file permanece como alias legado)
      file: z.string().optional(),
      sourceFile: z.string().optional(),
      normalizedFile: z.string().optional(),
      mapPath: z.string().optional(),

      // Rastreabilidade
      email: z.string().optional(), // ID do e-mail do orçamento original no Himalaya (ex: "63764")
      sourceAttachmentName: z.string().optional(),
      sourceHash: z.string().optional(),
      normalizedHash: z.string().optional(),
      revision: z.number().int().positive().optional(),
      comparisonStatus: z
        .enum(["pending", "ready", "needs_review", "excluded"])
        .optional(),
      sourceHistory: z
        .array(
          z.object({
            file: z.string(),
            hash: z.string().optional(),
            email: z.string().optional(),
            revision: z.number().int().positive().optional(),
            receivedAt: z.string().datetime().optional(),
          })
        )
        .optional(),

      // Status & Tracking
      status: z.string(), // "quoted" | "sent" | "approved" | "ordered" | "rejected"
      notes: z.string().optional(),

      // Datas
      quotedAt: z.string().datetime().optional(), // quando recebeu a cotação
      sentAt: z.string().datetime().optional(), // quando enviou pro Ademar
      approvedAt: z.string().datetime().optional(), // quando aprovou
      createdAt: z.string().datetime().optional(),
    })
  )
  /** Triggered after a record is created. */
  // .onCreated(async (ctx) => {
  //   const { value } = ctx
  //   if (value.items && value.items.length > 0) {
  //     _validateAndSortItems(value.items)
  //   }
  //   return value
  // })
  /** Triggered after a record is updated. */
  // .onUpdated(async (ctx) => {
  //   const { value } = ctx
  //   if (value.items && value.items.length > 0) {
  //     _validateAndSortItems(value.items)
  //   }
  //   return value
  // })
  /** Triggered after a record is deleted. */
  // .onDeleted(async (ctx) => { return ctx.value; })
  /** Triggered when reading a single record. */
  // .onRead(async (ctx) => { return ctx.value; })
  /** Triggered when listing records. */
  // .onList(async (ctx) => { return ctx.value; })
  .build()

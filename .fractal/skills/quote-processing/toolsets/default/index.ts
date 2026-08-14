import { FractalToolset } from "@fractal-os/plugin";
import { auditPedidoTool } from "./tools/audit-pedido.tool";
import {
  generateOrderTool,
  generateQuoteSpreadsheetTool,
} from "./tools/generate-order.tool";
import { generateMapPackageTool } from "./tools/generate-map-package.tool";

/**
 * Default toolset for the quote-processing skill.
 *
 * Contains the core tools for the quote-to-order pipeline:
 * extracting, validating, registering, and spreadsheet generation.
 */
export default FractalToolset.create("default")
  .withDescription(`
Quote-to-order processing tools for Dema Instalações.

### Usage
Use \`audit_pedido\` before map generation. Use
\`generate_quote_spreadsheet\` to create the normalized XLSX beside a supplier
PDF. Use \`generate_map_package\` after producing a validated canonical JSON.
\`generate_order\` remains as a backward-compatible spreadsheet alias.

### Rules
- Always validate that the quote record exists before calling.
- The quote must have valid \`project\` and \`supplier\` references.
- The project record must have a \`templates.order\` field with the template path.
  `)
  .withRules([
    {
      type: "always",
      instruction:
        "Generate spreadsheets only after the quote record contains customer, supplier, pedido number, canonical type, source provenance, and extracted items.",
    },
    {
      type: "always",
      instruction:
        "Run audit_pedido before generate_map_package and report unresolved synchronization issues.",
    },
  ])
  .withConnection({ type: "custom" })
  .addTool(auditPedidoTool)
  .addTool(generateQuoteSpreadsheetTool)
  .addTool(generateOrderTool)
  .addTool(generateMapPackageTool)
  .build();

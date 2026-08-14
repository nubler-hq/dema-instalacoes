import { spawnSync } from "child_process"
import * as fs from "fs"
import * as path from "path"
import { FractalTool } from "@fractal-os/plugin"
import { z } from "zod"

function runPython(script: string, args: string[]) {
  const result = spawnSync("python3", [script, ...args], {
    encoding: "utf-8",
    timeout: 120_000,
  })
  if (result.status !== 0) {
    throw new Error(`${path.basename(script)} failed (${result.status}): ${result.stderr || result.stdout}`)
  }
}

export const generateMapPackageTool = FractalTool.create("generate_map_package")
  .withDescription("Renders data.json, DASHBOARD.html and DASHBOARD.xlsx from canonical map JSON.")
  .withSchema(
    z.object({
      dataPath: z.string().describe("Workspace-relative path to a validated canonical map JSON."),
      outputDirectory: z
        .string()
        .describe("Workspace-relative pedido Mapa de Cotação directory."),
    }),
  )
  .withHandler(async ({ input, fractal }) => {
    const source = fractal.workspace.path("workspace", input.dataPath)
    const output = fractal.workspace.path("workspace", input.outputDirectory)
    if (!fs.existsSync(source)) {
      return { status: "error", message: `Canonical JSON not found: ${input.dataPath}` }
    }

    const data = JSON.parse(fs.readFileSync(source, "utf-8"))
    const required = [
      "id",
      "name",
      "number",
      "type",
      "customer",
      "suppliers",
      "groups",
      "basket",
      "summary",
    ]
    const missing = required.filter((key) => data[key] == null)
    if (missing.length) {
      return { status: "error", message: `Canonical JSON missing fields: ${missing.join(", ")}` }
    }

    fs.mkdirSync(output, { recursive: true })
    const jsonOutput = path.join(output, "data.json")
    const htmlOutput = path.join(output, "DASHBOARD.html")
    const xlsxOutput = path.join(output, "DASHBOARD.xlsx")
    fs.copyFileSync(source, jsonOutput)

    const htmlScript = fractal.workspace.path("workspace", "scripts/build_mapa_cotacao_dashboard.py")
    const xlsxScript = fractal.workspace.path("workspace", "scripts/build_mapa_cotacao_excel_dashboard.py")
    runPython(htmlScript, [
      "--input",
      jsonOutput,
      "--output-json",
      jsonOutput,
      "--output-html",
      htmlOutput,
      "--canonical",
    ])
    runPython(xlsxScript, [jsonOutput, xlsxOutput])

    return {
      status: "success",
      files: {
        json: path.posix.join(input.outputDirectory, "data.json"),
        html: path.posix.join(input.outputDirectory, "DASHBOARD.html"),
        xlsx: path.posix.join(input.outputDirectory, "DASHBOARD.xlsx"),
      },
    }
  })
  .build()

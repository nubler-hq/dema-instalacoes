#!/usr/bin/env bun

type SymbolMatch = {
  filePath: string;
  line: number;
  statement: string;
  source?: string | null;
};

type SymbolMap = {
  symbol: string;
  root: string;
  definitions: SymbolMatch[];
  importers: SymbolMatch[];
  exporters: SymbolMatch[];
};

const args = process.argv.slice(2);

const getArg = (flag: string) => {
  const index = args.indexOf(flag);
  return index >= 0 ? args[index + 1] : undefined;
};

const root = getArg("--path") ?? ".";
const symbol = getArg("--symbol") ?? getArg("--query");
const extArg = getArg("--exts") ?? "ts,tsx,js,jsx,mjs,cjs,d.ts";
const format = (getArg("--format") ?? "md") as "md" | "json";

if (!symbol) {
  console.error("Usage: bun scripts/symbol-map.ts --path <dir> --symbol <Name> [--exts ts,tsx] [--format md|json]");
  process.exit(1);
}

const allowedExts = extArg
  .split(",")
  .map((ext) => (ext.startsWith(".") ? ext : `.${ext}`));

const isAllowed = (filePath: string) => allowedExts.some((ext) => filePath.endsWith(ext));
const pattern = new Bun.Glob("**/*");

const definitionRegex = new RegExp(
  `(^|\\s)(export\\s+)?(declare\\s+)?(type|interface|class|function|const|enum)\\s+${symbol}\\b`,
);
const importRegex = new RegExp(`\\bimport\\s+(type\\s+)?\\{[^}]*\\b${symbol}\\b[^}]*\\}\\s+from\\s+['\"](.+)['\"]`);
const importDefaultRegex = new RegExp(`\\bimport\\s+${symbol}\\s+from\\s+['\"](.+)['\"]`);
const exportRegex = new RegExp(`\\bexport\\s+\\{[^}]*\\b${symbol}\\b[^}]*\\}\\s+from\\s+['\"](.+)['\"]`);
const exportLocalRegex = new RegExp(`\\bexport\\s+\\{[^}]*\\b${symbol}\\b[^}]*\\}`);

const map: SymbolMap = {
  symbol,
  root,
  definitions: [],
  importers: [],
  exporters: [],
};

for await (const file of pattern.scan({ cwd: root })) {
  if (!isAllowed(file)) continue;
  const fullPath = `${root.replace(/\/$/, "")}/${file}`;

  let text = "";
  try {
    text = await Bun.file(fullPath).text();
  } catch {
    continue;
  }

  const lines = text.split(/\r?\n/);
  for (let i = 0; i < lines.length; i += 1) {
    const line = lines[i];
    if (definitionRegex.test(line)) {
      map.definitions.push({
        filePath: fullPath,
        line: i + 1,
        statement: line.trimEnd(),
      });
    }

    const importMatch = line.match(importRegex) ?? line.match(importDefaultRegex);
    if (importMatch) {
      map.importers.push({
        filePath: fullPath,
        line: i + 1,
        statement: line.trimEnd(),
        source: importMatch[2] ?? importMatch[1] ?? null,
      });
    }

    const exportMatch = line.match(exportRegex);
    if (exportMatch) {
      map.exporters.push({
        filePath: fullPath,
        line: i + 1,
        statement: line.trimEnd(),
        source: exportMatch[1] ?? null,
      });
      continue;
    }

    if (exportLocalRegex.test(line)) {
      map.exporters.push({
        filePath: fullPath,
        line: i + 1,
        statement: line.trimEnd(),
      });
    }
  }
}

if (format === "json") {
  console.log(JSON.stringify(map, null, 2));
} else {
  console.log(`# Symbol Map`);
  console.log(`- Symbol: ${map.symbol}`);
  console.log(`- Root: ${map.root}\n`);

  printSection("Definitions", map.definitions);
  printSection("Importers", map.importers);
  printSection("Exporters", map.exporters);
}

export {};

function printSection(title: string, items: SymbolMatch[]) {
  console.log(`## ${title}`);
  if (items.length === 0) {
    console.log("_none_\n");
    return;
  }

  items.forEach((item, index) => {
    console.log(`${index + 1}. ${item.filePath}:${item.line}`);
    console.log("```");
    console.log(item.statement);
    console.log("```");
    if (item.source) {
      console.log(`Source: ${item.source}`);
    }
    console.log("");
  });
}

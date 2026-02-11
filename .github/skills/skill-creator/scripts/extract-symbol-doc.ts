#!/usr/bin/env bun

type SymbolDoc = {
  symbol: string;
  filePath: string;
  line: number;
  signature: string;
  tsdoc: string | null;
  snippet: string;
};

const args = process.argv.slice(2);

const getArg = (flag: string) => {
  const index = args.indexOf(flag);
  return index >= 0 ? args[index + 1] : undefined;
};

const root = getArg("--path") ?? ".";
const symbol = getArg("--symbol") ?? getArg("--query");
const extArg = getArg("--exts") ?? "d.ts,ts,tsx";
const format = (getArg("--format") ?? "md") as "md" | "json";
const limit = Number.parseInt(getArg("--limit") ?? "1", 10) || 1;

if (!symbol) {
  console.error("Usage: bun scripts/extract-symbol-doc.ts --path <dir> --symbol <Name> [--exts d.ts] [--format md|json] [--limit N]");
  process.exit(1);
}

const allowedExts = extArg
  .split(",")
  .map((ext) => (ext.startsWith(".") ? ext : `.${ext}`));

const isAllowed = (filePath: string) => allowedExts.some((ext) => filePath.endsWith(ext));
const pattern = new Bun.Glob("**/*");

const docs: SymbolDoc[] = [];
const declRegex = new RegExp(
  `(^|\\s)(export\\s+)?(declare\\s+)?(type|interface|class|function|const|enum)\\s+${symbol}\\b`,
);

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
    if (!declRegex.test(line)) continue;

    const tsdoc = extractTSDoc(lines, i);
    const snippet = extractSnippet(lines, i);

    docs.push({
      symbol,
      filePath: fullPath,
      line: i + 1,
      signature: line.trimEnd(),
      tsdoc,
      snippet,
    });

    if (docs.length >= limit) break;
  }
  if (docs.length >= limit) break;
}

if (format === "json") {
  console.log(JSON.stringify({ symbol, root, total: docs.length, docs }, null, 2));
} else {
  console.log(`# Symbol Docs`);
  console.log(`- Symbol: ${symbol}`);
  console.log(`- Root: ${root}`);
  console.log(`- Total: ${docs.length}\n`);

  docs.forEach((doc, index) => {
    console.log(`## ${index + 1}. ${doc.filePath}:${doc.line}`);
    console.log("**Signature**");
    console.log("```ts");
    console.log(doc.signature);
    console.log("```");

    console.log("**Snippet**");
    console.log("```ts");
    console.log(doc.snippet);
    console.log("```");

    if (doc.tsdoc) {
      console.log("**TSDoc**");
      console.log("```ts");
      console.log(doc.tsdoc);
      console.log("```\n");
    } else {
      console.log("**TSDoc**: _not found_\n");
    }
  });
}

export {};

function extractSnippet(lines: string[], startIndex: number) {
  const snippet: string[] = [];
  let openBraces = 0;
  for (let i = startIndex; i < lines.length && snippet.length < 30; i += 1) {
    const line = lines[i];
    snippet.push(line);
    openBraces += (line.match(/\{/g) ?? []).length;
    openBraces -= (line.match(/\}/g) ?? []).length;
    if (line.trim().endsWith(";") && openBraces <= 0 && i !== startIndex) break;
    if (openBraces <= 0 && line.trim().endsWith("}")) break;
  }
  return snippet.join("\n");
}

function extractTSDoc(lines: string[], startIndex: number) {
  let i = startIndex - 1;
  let steps = 0;

  while (i >= 0 && lines[i].trim() === "" && steps < 80) {
    i -= 1;
    steps += 1;
  }

  if (i < 0) return null;
  if (!lines[i].includes("*/")) return null;

  const end = i;
  let j = i;
  while (j >= 0 && steps < 120) {
    if (lines[j].includes("/**")) {
      return lines.slice(j, end + 1).join("\n");
    }
    if (!lines[j].trim().startsWith("*") && !lines[j].includes("*/")) {
      break;
    }
    j -= 1;
    steps += 1;
  }

  return null;
}

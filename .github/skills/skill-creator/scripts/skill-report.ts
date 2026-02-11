#!/usr/bin/env bun

type SkillAudit = {
  root: string;
  typesPath: string;
  entrypoints: unknown;
  exportsList: unknown;
  publicApi: unknown;
  apiDoc: unknown;
  missingTsdoc: unknown;
  searchSymbol: unknown;
  graph: string;
  symbolMap?: unknown;
  symbolDoc?: unknown;
};

const args = process.argv.slice(2);

const getArg = (flag: string) => {
  const index = args.indexOf(flag);
  return index >= 0 ? args[index + 1] : undefined;
};

const inputPath = getArg("--input");

if (!inputPath) {
  console.error("Usage: bun scripts/skill-report.ts --input <skill-audit.json>");
  process.exit(1);
}

const text = await Bun.file(inputPath).text();
const data = JSON.parse(text) as SkillAudit;

console.log(`# Skill Report`);
console.log(`- Root: ${data.root}`);
console.log(`- Types: ${data.typesPath}`);
console.log("");

printSection("Entry Points", data.entrypoints);
printSection("Exports", data.exportsList);
printSection("Public API", data.publicApi);
printSection("API Docs", data.apiDoc);
printSection("Missing TSDoc", data.missingTsdoc);
printSection("Symbol Search", data.searchSymbol);

console.log("## Graph");
console.log(data.graph);
console.log("");

if (data.symbolMap) {
  printSection("Symbol Map", data.symbolMap);
}

if (data.symbolDoc) {
  printSection("Symbol Doc", data.symbolDoc);
}

function printSection(title: string, payload: unknown) {
  console.log(`## ${title}`);
  console.log("```json");
  console.log(JSON.stringify(payload, null, 2));
  console.log("```\n");
}

export {};

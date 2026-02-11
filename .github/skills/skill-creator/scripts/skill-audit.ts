#!/usr/bin/env bun

const args = process.argv.slice(2);

const getArg = (flag: string) => {
  const index = args.indexOf(flag);
  return index >= 0 ? args[index + 1] : undefined;
};

const root = getArg("--path") ?? getArg("--package") ?? ".";
const typesPath = getArg("--types") ?? "dist/index.d.ts";
const format = (getArg("--format") ?? "json") as "json" | "md";
const searchQuery = getArg("--search") ?? "create(";
const symbol = getArg("--symbol");
const pathAlias = getArg("--path-alias") ?? (root.includes("node_modules/") ? root.split("node_modules/")[1] : "<package>");

const scriptsRoot = ".claude/skills/skill-creator/scripts";
const decode = async (stream: ReadableStream<Uint8Array> | null) => {
  if (!stream) return "";
  return new Response(stream).text();
};

const runJson = async (command: string[]) => {
  const result = await Bun.spawn(command, { stdout: "pipe", stderr: "pipe" });
  const stdout = await decode(result.stdout);
  const stderr = await decode(result.stderr);
  const code = await result.exited;

  if (code !== 0) {
    throw new Error(`Command failed: ${command.join(" ")}\n${stderr}`);
  }

  return JSON.parse(stdout);
};

const runMermaid = async (command: string[]) => {
  const result = await Bun.spawn(command, { stdout: "pipe", stderr: "pipe" });
  const stdout = await decode(result.stdout);
  const stderr = await decode(result.stderr);
  const code = await result.exited;

  if (code !== 0) {
    throw new Error(`Command failed: ${command.join(" ")}\n${stderr}`);
  }

  return stdout.trim();
};

const entrypoints = await runJson([
  "bun",
  `${scriptsRoot}/list-entrypoints.ts`,
  "--package",
  root,
  "--format",
  "json",
]);

const exportsList = await runJson([
  "bun",
  `${scriptsRoot}/list-exports.ts`,
  "--package",
  root,
  "--format",
  "json",
]);

const publicApi = await runJson([
  "bun",
  `${scriptsRoot}/extract-public-api.ts`,
  "--path",
  root,
  "--types",
  typesPath,
  "--format",
  "json",
]);

const apiDoc = await runJson([
  "bun",
  `${scriptsRoot}/extract-api-doc.ts`,
  "--path",
  root,
  "--types",
  typesPath,
  "--normalize-paths",
  "true",
  "--path-alias",
  pathAlias,
  "--format",
  "json",
]);

const missingTsdoc = await runJson([
  "bun",
  `${scriptsRoot}/find-missing-tsdoc.ts`,
  "--path",
  `${root.replace(/\/$/, "")}/dist`,
  "--exts",
  "d.ts",
  "--format",
  "json",
]);

const searchSymbol = await runJson([
  "bun",
  `${scriptsRoot}/search-symbol.ts`,
  "--path",
  root,
  "--query",
  searchQuery,
  "--only-dts",
  "--exclude-default",
  "--format",
  "json",
  "--summary",
]);

const graph = await runMermaid([
  "bun",
  `${scriptsRoot}/package-graph.ts`,
  "--path",
  `${root.replace(/\/$/, "")}/dist`,
  "--exts",
  "d.ts",
  "--format",
  "mmd",
]);

let symbolMap = null;
let symbolDoc = null;

if (symbol) {
  symbolMap = await runJson([
    "bun",
    `${scriptsRoot}/symbol-map.ts`,
    "--path",
    root,
    "--symbol",
    symbol,
    "--format",
    "json",
  ]);

  symbolDoc = await runJson([
    "bun",
    `${scriptsRoot}/extract-symbol-doc.ts`,
    "--path",
    `${root.replace(/\/$/, "")}/dist`,
    "--symbol",
    symbol,
    "--format",
    "json",
  ]);
}

const output = {
  root,
  typesPath,
  entrypoints,
  exportsList,
  publicApi,
  apiDoc,
  missingTsdoc,
  searchSymbol,
  graph,
  symbolMap,
  symbolDoc,
};

if (format === "json") {
  console.log(JSON.stringify(output, null, 2));
} else {
  console.log(`# Skill Audit`);
  console.log(`- Root: ${root}`);
  console.log(`- Types: ${typesPath}`);
  console.log("");

  console.log("## Entry Points");
  console.log(JSON.stringify(entrypoints, null, 2));
  console.log("");

  console.log("## Exports");
  console.log(JSON.stringify(exportsList, null, 2));
  console.log("");

  console.log("## Public API");
  console.log(JSON.stringify(publicApi, null, 2));
  console.log("");

  console.log("## API Docs");
  console.log(JSON.stringify(apiDoc, null, 2));
  console.log("");

  console.log("## Missing TSDoc");
  console.log(JSON.stringify(missingTsdoc, null, 2));
  console.log("");

  console.log("## Search Symbol");
  console.log(JSON.stringify(searchSymbol, null, 2));
  console.log("");

  console.log("## Graph");
  console.log(graph);
  console.log("");

  if (symbol) {
    console.log("## Symbol Map");
    console.log(JSON.stringify(symbolMap, null, 2));
    console.log("");

    console.log("## Symbol Doc");
    console.log(JSON.stringify(symbolDoc, null, 2));
  }
}

export {};

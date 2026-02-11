#!/usr/bin/env bun

type ExportEntry = {
  name: string;
  from: string;
  line: number;
  kind: "named" | "star" | "decl";
};

type ApiItem = {
  file: string;
  exports: ExportEntry[];
};

const args = process.argv.slice(2);

const getArg = (flag: string) => {
  const index = args.indexOf(flag);
  return index >= 0 ? args[index + 1] : undefined;
};

const root = getArg("--path") ?? getArg("--package") ?? ".";
const typesPath = getArg("--types") ?? "dist/index.d.ts";
const format = (getArg("--format") ?? "md") as "md" | "json";

const filePath = `${root.replace(/\/$/, "")}/${typesPath}`;

let text = "";
try {
  text = await Bun.file(filePath).text();
} catch (error) {
  console.error(`Failed to read ${filePath}`);
  console.error(error);
  process.exit(1);
}

const exports: ExportEntry[] = [];
const seen = new Set<string>();
const lines = text.split(/\r?\n/);

for (const [index, line] of lines.entries()) {
  const trimmed = line.trim();
  if (!trimmed.startsWith("export ")) continue;

  const fromMatch = trimmed.match(/from\s+['"](.+)['"];?$/);
  const from = fromMatch ? fromMatch[1] : filePath;

  if (trimmed.startsWith("export *")) {
    pushExport("*", from, index + 1, "star");
    continue;
  }

  const namedMatch = trimmed.match(/export\s+\{([^}]+)\}/);
  if (namedMatch) {
    const names = namedMatch[1]
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean)
      .map((name) => name.split(/\s+as\s+/)[0].trim())
      .map(normalizeName);
    names.forEach((name) => pushExport(name, from, index + 1, "named"));
  }

  const declMatch = trimmed.match(/export\s+(type|interface|class|function|const|enum)\s+([A-Za-z0-9_]+)/);
  if (declMatch) {
    pushExport(normalizeName(declMatch[2]), filePath, index + 1, "decl");
  }
}

const output: ApiItem = {
  file: filePath,
  exports,
};

if (format === "json") {
  console.log(JSON.stringify(output, null, 2));
} else {
  console.log(`# Public API`);
  console.log(`- File: ${filePath}`);
  console.log(`- Exports: ${exports.length}`);
  console.log("");
  exports.forEach((entry) => {
    console.log(`- ${entry.name} (from ${entry.from})`);
  });
}

export {};

function normalizeName(value: string) {
  return value
    .replace(/^[\s\u00A0]*(type|interface|const|class|function|enum)[\s\u00A0]+/i, "")
    .trim();
}

function pushExport(name: string, from: string, line: number, kind: ExportEntry["kind"]) {
  if (!name) return;
  const key = `${name}@@${from}@@${line}@@${kind}`;
  if (seen.has(key)) return;
  seen.add(key);
  exports.push({ name, from, line, kind });
}

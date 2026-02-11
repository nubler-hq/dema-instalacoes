#!/usr/bin/env bun

type MissingEntry = {
  filePath: string;
  line: number;
  signature: string;
};

const args = process.argv.slice(2);

const getArg = (flag: string) => {
  const index = args.indexOf(flag);
  return index >= 0 ? args[index + 1] : undefined;
};

const root = getArg("--path") ?? ".";
const extArg = getArg("--exts") ?? "d.ts,ts,tsx";
const format = (getArg("--format") ?? "md") as "md" | "json";

const allowedExts = extArg
  .split(",")
  .map((ext) => (ext.startsWith(".") ? ext : `.${ext}`));

const isAllowed = (filePath: string) => allowedExts.some((ext) => filePath.endsWith(ext));
const pattern = new Bun.Glob("**/*");

const results: MissingEntry[] = [];

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
    if (!line.trim().startsWith("export ")) continue;

    const isDeclaration = /(export\s+)(interface|type|class|function|const|enum)\s+/.test(line);
    if (!isDeclaration) continue;

    const tsdoc = extractTSDoc(lines, i);
    if (!tsdoc) {
      results.push({
        filePath: fullPath,
        line: i + 1,
        signature: line.trimEnd(),
      });
    }
  }
}

if (format === "json") {
  console.log(JSON.stringify({ total: results.length, results }, null, 2));
} else {
  console.log(`# Missing TSDoc Report`);
  console.log(`- Root: ${root}`);
  console.log(`- Total: ${results.length}\n`);
  results.forEach((entry, index) => {
    console.log(`## ${index + 1}. ${entry.filePath}:${entry.line}`);
    console.log("```");
    console.log(entry.signature);
    console.log("```\n");
  });
}

export {};

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

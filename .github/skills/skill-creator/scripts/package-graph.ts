#!/usr/bin/env bun

type Edge = {
  from: string;
  to: string;
};

type GraphOutput = {
  root: string;
  nodes: string[];
  edges: Edge[];
};

const args = process.argv.slice(2);

const getArg = (flag: string) => {
  const index = args.indexOf(flag);
  return index >= 0 ? args[index + 1] : undefined;
};

const root = getArg("--path") ?? ".";
const extArg = getArg("--exts") ?? "ts,tsx,js,jsx,mjs,cjs,d.ts";
const format = (getArg("--format") ?? "mmd") as "mmd" | "json";
const includePatterns = parseListArg(getArg("--include"));
const excludePatterns = parseListArg(getArg("--exclude"));

const allowedExts = extArg
  .split(",")
  .map((ext) => (ext.startsWith(".") ? ext : `.${ext}`));

const isAllowed = (filePath: string) => allowedExts.some((ext) => filePath.endsWith(ext));
const pattern = new Bun.Glob("**/*");

const includeMatchers = includePatterns.map(buildGlobMatcher);
const excludeMatchers = excludePatterns.map(buildGlobMatcher);
const hasIncludes = includeMatchers.length > 0;

const shouldInclude = (filePath: string) => {
  const includeOk = !hasIncludes || includeMatchers.some((matcher) => matcher(filePath));
  const excludeOk = !excludeMatchers.some((matcher) => matcher(filePath));
  return includeOk && excludeOk;
};

const edges: Edge[] = [];
const nodes = new Set<string>();

for await (const file of pattern.scan({ cwd: root })) {
  if (!isAllowed(file)) continue;
  if (!shouldInclude(file)) continue;

  const fullPath = `${root.replace(/\/$/, "")}/${file}`;

  let text = "";
  try {
    text = await Bun.file(fullPath).text();
  } catch {
    continue;
  }

  nodes.add(file);

  const lines = text.split(/\r?\n/);
  for (const line of lines) {
    const importMatch = line.match(/\bimport\s+(type\s+)?[^;]+from\s+['"](.+)['"]/);
    if (importMatch) {
      edges.push({ from: file, to: importMatch[2] });
      continue;
    }

    const exportMatch = line.match(/\bexport\s+\{[^}]+\}\s+from\s+['"](.+)['"]/);
    if (exportMatch) {
      edges.push({ from: file, to: exportMatch[1] });
    }
  }
}

const output: GraphOutput = {
  root,
  nodes: Array.from(nodes),
  edges,
};

if (format === "json") {
  console.log(JSON.stringify(output, null, 2));
} else {
  console.log("```mermaid");
  console.log("graph TD");
  edges.forEach((edge) => {
    const from = sanitize(edge.from);
    const to = sanitize(edge.to);
    console.log(`  ${from} --> ${to}`);
  });
  console.log("```");
}

export {};

function sanitize(value: string) {
  return value.replace(/[^A-Za-z0-9_]/g, "_");
}

function parseListArg(value?: string) {
  if (!value) return [] as string[];
  return value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

function buildGlobMatcher(pattern: string) {
  const escaped = pattern
    .replace(/[.+^${}()|[\]\\]/g, "\\$&")
    .replace(/\*\*/g, "::DOUBLE_STAR::")
    .replace(/\*/g, "[^/]*")
    .replace(/\?/g, ".")
    .replace(/::DOUBLE_STAR::/g, ".*");
  const regex = new RegExp(`^${escaped}$`);
  return (input: string) => regex.test(input);
}

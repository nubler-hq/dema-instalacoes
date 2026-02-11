#!/usr/bin/env bun

const matchCount = await performSearch();

if (matchCount === 0) {
  console.log("No matches found.");
}

export {};

type MatchResult = {
  filePath: string;
  line: number;
  column: number;
  preview: string;
  tsdoc: string | null;
};

type OutputFormat = "md" | "json";

type SearchOptions = {
  root: string;
  query: string;
  extArg: string;
  useRegex: boolean;
  format: OutputFormat;
  includePatterns: string[];
  excludePatterns: string[];
  limit: number;
  offset: number;
  onlyTsdoc: boolean;
  dtsFirst: boolean;
  summary: boolean;
};

async function performSearch() {
  const args = process.argv.slice(2);

  const getArg = (flag: string) => {
    const index = args.indexOf(flag);
    return index >= 0 ? args[index + 1] : undefined;
  };

  const root = getArg("--path") ?? ".";
  const query = getArg("--query") ?? getArg("--symbol");
  const extArg = args.includes("--only-dts") ? "d.ts" : getArg("--exts") ?? "ts,tsx,js,jsx,mjs,cjs,d.ts,json";
  const useRegex = args.includes("--regex");
  const format = (getArg("--format") ?? "md") as OutputFormat;
  const includePatterns = parseListArg(getArg("--include"));
  const excludePatterns = parseListArg(getArg("--exclude"));
  const excludeDefault = args.includes("--exclude-default");
  const limit = Number.parseInt(getArg("--limit") ?? "0", 10) || Number.POSITIVE_INFINITY;
  const offset = Number.parseInt(getArg("--offset") ?? "0", 10) || 0;
  const onlyTsdoc = args.includes("--only-tsdoc");
  const dtsFirst = args.includes("--dts-first");
  const summary = args.includes("--summary");

  if (!query) {
    console.error(
      "Usage: bun scripts/search-symbol.ts --path <dir> --query <text> [--regex] [--exts ts,tsx] [--only-dts] [--format md|json] [--include pattern1,pattern2] [--exclude pattern1,pattern2] [--exclude-default] [--limit N] [--offset N] [--only-tsdoc] [--dts-first] [--summary]",
    );
    process.exit(1);
  }

  const options: SearchOptions = {
    root,
    query,
    extArg,
    useRegex,
    format,
    includePatterns,
    excludePatterns: excludeDefault
      ? [...excludePatterns, "node_modules/**"]
      : excludePatterns,
    limit,
    offset,
    onlyTsdoc,
    dtsFirst,
    summary,
  };

  const { results, total } = await collectResults(options);

  printResults({
    format,
    query,
    root,
    results,
    summary,
    total,
  });
  return total;
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

async function collectResults(options: SearchOptions) {
  const {
    root,
    query,
    extArg,
    useRegex,
    includePatterns,
    excludePatterns,
    limit,
    offset,
    onlyTsdoc,
    dtsFirst,
  } = options;

  const allowedExts = extArg
    .split(",")
    .map((ext) => (ext.startsWith(".") ? ext : `.${ext}`));

  const isAllowed = (filePath: string) => allowedExts.some((ext) => filePath.endsWith(ext));
  const includeMatchers = includePatterns.map(buildGlobMatcher);
  const excludeMatchers = excludePatterns.map(buildGlobMatcher);
  const hasIncludes = includeMatchers.length > 0;

  const shouldInclude = (filePath: string) => {
    const includeOk = !hasIncludes || includeMatchers.some((matcher) => matcher(filePath));
    const excludeOk = !excludeMatchers.some((matcher) => matcher(filePath));
    return includeOk && excludeOk;
  };

  const regex = useRegex ? new RegExp(query, "g") : null;
  const results: MatchResult[] = [];
  let totalMatches = 0;

  const pattern = new Bun.Glob("**/*");
  const rootNormalized = root.replace(/\/$/, "");
  const files: string[] = [];

  for await (const file of pattern.scan({ cwd: rootNormalized })) {
    if (!isAllowed(file)) continue;
    if (!shouldInclude(file)) continue;
    files.push(file);
  }

  if (dtsFirst) {
    files.sort((a, b) => {
      const aIsDts = a.endsWith(".d.ts");
      const bIsDts = b.endsWith(".d.ts");
      if (aIsDts === bIsDts) return a.localeCompare(b);
      return aIsDts ? -1 : 1;
    });
  }

  for (const file of files) {
    const fullPath = `${rootNormalized}/${file}`;

    let text = "";
    try {
      text = await Bun.file(fullPath).text();
    } catch {
      continue;
    }

    const lines = text.split(/\r?\n/);
    for (let i = 0; i < lines.length; i += 1) {
      const line = lines[i];

      const recordMatch = (col: number) => {
        const tsdoc = extractTSDoc(lines, i);
        if (onlyTsdoc && !tsdoc) return;
        totalMatches += 1;
        if (totalMatches <= offset) return;
        if (results.length >= limit) return;
        results.push({
          filePath: fullPath,
          line: i + 1,
          column: col + 1,
          preview: line.trimEnd(),
          tsdoc,
        });
      };

      if (regex) {
        regex.lastIndex = 0;
        if (regex.test(line)) {
          const col = Math.max(0, line.search(regex));
          recordMatch(col);
        }
        continue;
      }

      const col = line.indexOf(query);
      if (col >= 0) {
        recordMatch(col);
      }
    }
  }

  return { results, total: totalMatches };
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

function printResults({
  format,
  query,
  root,
  results,
  summary,
  total,
}: {
  format: OutputFormat;
  query: string;
  root: string;
  results: MatchResult[];
  summary: boolean;
  total: number;
}) {
  if (format === "json") {
    console.log(
      JSON.stringify(
        {
          query,
          root,
          total,
          results,
          summary: summary ? buildSummary(results) : undefined,
        },
        null,
        2,
      ),
    );
    return;
  }

  console.log(`# Search Results\n`);
  console.log(`- Query: ${query}`);
  console.log(`- Root: ${root}`);
  console.log(`- Total: ${total}\n`);

  if (summary) {
    const summaryData = buildSummary(results);
    console.log("## Summary\n");
    summaryData.forEach((item) => {
      console.log(`- ${item.filePath} — ${item.count} matches (${item.tsdocCount} with TSDoc)`);
    });
    console.log("");
  }

  results.forEach((result, index) => {
    console.log(`## ${index + 1}. ${result.filePath}:${result.line}:${result.column}`);
    console.log("```");
    console.log(result.preview);
    console.log("```");

    if (result.tsdoc) {
      console.log("**TSDoc**");
      console.log("```ts");
      console.log(result.tsdoc);
      console.log("```\n");
    } else {
      console.log("**TSDoc**: _not found_\n");
    }
  });
}

function buildSummary(results: MatchResult[]) {
  const byFile = new Map<string, { count: number; tsdocCount: number }>();
  results.forEach((result) => {
    const entry = byFile.get(result.filePath) ?? { count: 0, tsdocCount: 0 };
    entry.count += 1;
    if (result.tsdoc) entry.tsdocCount += 1;
    byFile.set(result.filePath, entry);
  });
  return Array.from(byFile.entries()).map(([filePath, data]) => ({
    filePath,
    count: data.count,
    tsdocCount: data.tsdocCount,
  }));
}

#!/usr/bin/env bun

await run();

export {};

async function run() {
  const args = process.argv.slice(2);

  const getArg = (flag: string) => {
    const index = args.indexOf(flag);
    return index >= 0 ? args[index + 1] : undefined;
  };

  const pkgRoot = getArg("--package") ?? ".";
  const pkgJsonPath = getArg("--package-json") ?? `${pkgRoot.replace(/\/$/, "")}/package.json`;
  const format = (getArg("--format") ?? "md") as "md" | "json";

  let pkg: Record<string, any>;
  try {
    const text = await Bun.file(pkgJsonPath).text();
    pkg = JSON.parse(text);
  } catch (error) {
    console.error(`Failed to read ${pkgJsonPath}`);
    console.error(error);
    process.exit(1);
  }

  const exportsField = pkg.exports;

  if (!exportsField) {
    if (format === "json") {
      console.log(JSON.stringify({ message: "No exports field found in package.json." }, null, 2));
      process.exit(0);
    }
    console.log("No exports field found in package.json.");
    process.exit(0);
  }

  const printEntry = (key: string, value: unknown) => {
    if (format === "json") {
      return { key, value };
    }
    if (typeof value === "string") {
      console.log(`${key} -> ${value}`);
      return null;
    }
    console.log(`${key} -> ${JSON.stringify(value, null, 2)}`);
    return null;
  };

  const entries: Array<{ key: string; value: unknown }> = [];

  if (typeof exportsField === "string") {
    const entry = printEntry(".", exportsField);
    if (entry) entries.push(entry);
  } else if (typeof exportsField === "object") {
    for (const [key, value] of Object.entries(exportsField)) {
      const entry = printEntry(key, value);
      if (entry) entries.push(entry);
    }
  } else {
    if (format === "json") {
      console.log(JSON.stringify({ message: "Unsupported exports field format." }, null, 2));
      process.exit(0);
    }
    console.log("Unsupported exports field format.");
  }

  if (format === "json") {
    console.log(JSON.stringify({ package: pkg.name ?? "(unknown)", exports: entries }, null, 2));
  }
}

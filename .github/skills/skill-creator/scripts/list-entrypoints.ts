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

  const fields = ["name", "version", "main", "module", "types", "typings", "exports", "bin"] as const;

  if (format === "json") {
    const output: Record<string, unknown> = {
      package: pkg.name ?? "(unknown)",
      version: pkg.version ?? "(unknown)",
    };
    for (const field of fields) {
      if (pkg[field] === undefined) continue;
      output[field] = pkg[field];
    }
    console.log(JSON.stringify(output, null, 2));
    return;
  }

  console.log(`Package: ${pkg.name ?? "(unknown)"}`);
  console.log(`Version: ${pkg.version ?? "(unknown)"}`);

  for (const field of fields) {
    if (pkg[field] === undefined) continue;
    console.log(`\n${field}:`);
    console.log(JSON.stringify(pkg[field], null, 2));
  }
}

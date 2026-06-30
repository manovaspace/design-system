#!/usr/bin/env node
/** Fail if publishable fields still use pnpm catalog: (breaks external consumers). */
import { readFileSync } from "node:fs";
import { join } from "node:path";

const pkgDir = process.cwd();
const pkg = JSON.parse(readFileSync(join(pkgDir, "package.json"), "utf8"));

for (const field of ["dependencies", "peerDependencies", "optionalDependencies"]) {
  const deps = pkg[field];
  if (!deps) continue;
  for (const [name, spec] of Object.entries(deps)) {
    if (spec === "catalog:" || String(spec).includes("catalog:")) {
      console.error(`${pkg.name}: ${field}.${name} uses catalog: — use real semver before publish`);
      process.exit(1);
    }
  }
}

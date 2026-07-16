import { execSync } from "node:child_process";
import { existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");

const packages = [
  { filter: "@manovaspace/tokens", marker: "packages/tokens/dist/tokens.css" },
  { filter: "@manovaspace/ui", marker: "packages/ui/dist/index.js" },
  { filter: "@manovaspace/devtools", marker: "packages/devtools/dist/index.js" },
];

const missing = packages.filter(({ marker }) => !existsSync(join(root, marker)));

if (missing.length > 0) {
  console.log(
    `[manovaspace/design-system] missing dist for ${missing.map((p) => p.filter).join(", ")}; building...`,
  );
  execSync("pnpm build", { cwd: root, stdio: "inherit" });
}

import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const workspaceRoot = join(root, "..", "..");

const versions = {
  "@manovaspace/tokens": JSON.parse(
    readFileSync(join(root, "packages/tokens/package.json"), "utf8"),
  ).version,
  "@manovaspace/ui": JSON.parse(
    readFileSync(join(root, "packages/ui/package.json"), "utf8"),
  ).version,
  "@manovaspace/devtools": JSON.parse(
    readFileSync(join(root, "packages/devtools/package.json"), "utf8"),
  ).version,
};

const packageJsonPaths = [
  "orbit/orbit-frontend/apps/template/package.json",
  "orbit/orbit-frontend/apps/storybook/package.json",
  "clients/jtash/frontend/package.json",
  "clients/fryto/ops/apps/web/package.json",
  "clients/kohan_kherad/website/package.json",
  "clients/manova/waypoint/package.json",
  "clients/manova/manova-frontend/package.json",
];

const linkRe =
  /^link:.*manovaspace\/design-system\/packages\/(tokens|ui|devtools)$/;

for (const rel of packageJsonPaths) {
  const path = join(workspaceRoot, rel);
  if (!existsSync(path)) continue;
  const pkg = JSON.parse(readFileSync(path, "utf8"));

  for (const section of [
    "dependencies",
    "devDependencies",
    "peerDependencies",
  ]) {
    const deps = pkg[section];
    if (!deps) continue;

    for (const [name, spec] of Object.entries(deps)) {
      if (!name.startsWith("@manovaspace/") || !(name in versions)) continue;
      if (typeof spec !== "string") continue;
      const next = `^${versions[name]}`;
      if (spec === next) continue;
      if (
        linkRe.test(spec) ||
        spec.startsWith("^") ||
        spec.startsWith("workspace:")
      ) {
        deps[name] = next;
        console.log(`${rel}: ${section}.${name} → ${next}`);
      }
    }
  }

  writeFileSync(path, `${JSON.stringify(pkg, null, 2)}\n`);
}

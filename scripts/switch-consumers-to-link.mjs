import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const workspaceRoot = join(dirname(fileURLToPath(import.meta.url)), "..", "..", "..");

const ds = (pkg) => `link:../../../manovaspace/design-system/packages/${pkg}`;
const dsFromOrbitApp = (pkg) =>
  `link:../../../../manovaspace/design-system/packages/${pkg}`;

const targets = [
  {
    path: "orbit/orbit-frontend/apps/template/package.json",
    links: {
      "@manovaspace/tokens": dsFromOrbitApp("tokens"),
      "@manovaspace/ui": dsFromOrbitApp("ui"),
      "@manovaspace/devtools": dsFromOrbitApp("devtools"),
    },
  },
  {
    path: "clients/kaazhe/frontend/package.json",
    links: {
      "@manovaspace/tokens": ds("tokens"),
      "@manovaspace/ui": ds("ui"),
    },
  },
  {
    path: "clients/jtash/frontend/package.json",
    links: {
      "@manovaspace/tokens": ds("tokens"),
      "@manovaspace/ui": ds("ui"),
    },
  },
  {
    path: "clients/manova/waypoint/package.json",
    links: {
      "@manovaspace/tokens": ds("tokens"),
      "@manovaspace/ui": ds("ui"),
    },
  },
  {
    path: "clients/manova/manova-frontend/package.json",
    links: {
      "@manovaspace/tokens": ds("tokens"),
      "@manovaspace/ui": ds("ui"),
    },
  },
];

for (const { path, links } of targets) {
  const file = join(workspaceRoot, path);
  const pkg = JSON.parse(readFileSync(file, "utf8"));

  for (const section of ["dependencies", "devDependencies", "peerDependencies"]) {
    const deps = pkg[section];
    if (!deps) continue;

    for (const [name, link] of Object.entries(links)) {
      if (deps[name]?.startsWith("^") || deps[name]?.includes("manovaspace/ts")) {
        deps[name] = link;
        console.log(`${path}: ${section}.${name} → ${link}`);
      }
    }
  }

  writeFileSync(file, `${JSON.stringify(pkg, null, 2)}\n`);
}

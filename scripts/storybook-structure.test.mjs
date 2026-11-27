import { describe, expect, test } from "bun:test";
import fs from "node:fs";
import path from "node:path";

const ROOT = path.resolve(import.meta.dir, "..");
const ALLOWED_TITLE_RE =
  /^(Introduction|Foundations\/(Color roles|Typography|Spacing|Shape|Elevation|Motion|Icons|Density|Brand playground|Charts & email hex)|Guidelines\/(Forms|Content & microcopy|Accessibility|RTL & locale|Data display|Corner cases|Writing component docs)|Components\/(Actions|Inputs|Selection|Navigation|Containment|Feedback|Data display)\/.+|Patterns\/(App catalog|Entity browser|Field groups|Wizards)|Templates\/(ListPage|DetailPage|FormSheet|SummaryPage))$/;

function collectFiles(dir, matchRe, out = []) {
  if (!fs.existsSync(dir)) return out;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (entry.name === "node_modules" || entry.name === "dist") continue;
      collectFiles(full, matchRe, out);
    } else if (matchRe.test(entry.name)) {
      out.push(full);
    }
  }
  return out.sort();
}

function readTitle(file) {
  const raw = fs.readFileSync(file, "utf8");
  if (file.endsWith(".mdx")) {
    return raw.match(/<Meta\s+title="([^"]+)"/)?.[1] ?? null;
  }
  return raw.match(/\btitle:\s*"([^"]+)"/)?.[1] ?? null;
}

describe("Storybook taxonomy and co-location", () => {
  test("legacy apps/storybook/src/stories directory is removed", () => {
    expect(fs.existsSync(path.join(ROOT, "apps/storybook/src/stories"))).toBe(
      false,
    );
  });

  test("all story and MDX titles match ADR-078 M3 sidebar taxonomy", () => {
    const storyFiles = [
      ...collectFiles(
        path.join(ROOT, "packages/ui/src"),
        /\.stories\.(ts|tsx)$/,
      ),
      ...collectFiles(
        path.join(ROOT, "apps/storybook/src"),
        /(\.stories\.(ts|tsx)|\.mdx)$/,
      ),
    ];

    expect(storyFiles.length).toBeGreaterThanOrEqual(50);

    for (const file of storyFiles) {
      const title = readTitle(file);
      const rel = path.relative(ROOT, file);
      expect(title, `${rel} is missing a Meta title`).not.toBeNull();
      expect(
        ALLOWED_TITLE_RE.test(title),
        `${rel} has non-standard title "${title}"`,
      ).toBe(true);
    }
  });
});

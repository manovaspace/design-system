import { readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative } from "node:path";
import { describe, expect, it } from "vitest";

const srcDir = join(import.meta.dirname, ".");

function storyFiles(dir: string): string[] {
  return readdirSync(dir).flatMap((entry) => {
    const path = join(dir, entry);
    if (statSync(path).isDirectory()) return storyFiles(path);
    return entry.endsWith(".stories.tsx") ? [path] : [];
  });
}

const privateImport =
  /(?:from\s+|import\s*\(\s*|import\s+)["'][^"']*\/?primitives\/[^"']*["']/g;

describe("stories import public modules only", () => {
  it("finds story files", () => {
    expect(storyFiles(srcDir).length).toBeGreaterThan(0);
  });

  it("no *.stories.tsx imports from a primitives/ path", () => {
    const offenders = storyFiles(srcDir).flatMap((file) => {
      const source = readFileSync(file, "utf8");
      const matches = source.match(privateImport) ?? [];
      return matches.map((match) => `${relative(srcDir, file)}: ${match}`);
    });
    expect(offenders).toEqual([]);
  });
});

import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const SRC_DIR = path.resolve(import.meta.dirname);
const STYLES_PATH = path.join(SRC_DIR, "styles.css");
const OUTLINE_NONE_RE = /(?<![\w-])outline-none(?![\w-])/;

function listSourceFiles(dir: string): string[] {
  const out: string[] = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      out.push(...listSourceFiles(full));
      continue;
    }
    if (!/\.(ts|tsx|js|jsx|mjs|cjs)$/.test(entry.name)) continue;
    if (/\.(test|stories)\./.test(entry.name)) continue;
    out.push(full);
  }
  return out;
}

/** Returns [start, end) offsets of the body of the first `@layer base { ... }` block. */
function layerBaseRange(css: string): [number, number] {
  const open = css.indexOf("@layer base {");
  if (open === -1) throw new Error("@layer base block not found in styles.css");
  const bodyStart = open + "@layer base {".length;
  let depth = 1;
  for (let i = bodyStart; i < css.length; i++) {
    const ch = css[i];
    if (ch === "{") depth++;
    else if (ch === "}") {
      depth--;
      if (depth === 0) return [bodyStart, i];
    }
  }
  throw new Error("unterminated @layer base block in styles.css");
}

/** Offsets of every rule block whose selector ends with :focus-visible and that sets the forced-colors Highlight outline. */
function forcedColorsFocusRuleOffsets(css: string): number[] {
  const re = /:focus-visible\s*\{([^}]*)\}/g;
  const offsets: number[] = [];
  for (const match of css.matchAll(re)) {
    if (/outline:\s*2px solid Highlight/.test(match[1] ?? "")) {
      offsets.push(match.index ?? 0);
    }
  }
  return offsets;
}

describe("forced-colors focus guard", () => {
  it("contains no outline-none token in non-test, non-story UI source", () => {
    const offenders = listSourceFiles(SRC_DIR).filter((file) =>
      OUTLINE_NONE_RE.test(fs.readFileSync(file, "utf8")),
    );
    expect(offenders.map((file) => path.relative(SRC_DIR, file))).toEqual([]);
  });

  it("keeps the forced-colors :focus-visible outline outside @layer base", () => {
    const css = fs.readFileSync(STYLES_PATH, "utf8");
    const [baseStart, baseEnd] = layerBaseRange(css);
    const offsets = forcedColorsFocusRuleOffsets(css);

    expect(offsets.length).toBeGreaterThan(0);
    for (const offset of offsets) {
      const insideBase = offset > baseStart && offset < baseEnd;
      expect(
        insideBase,
        `forced-colors focus rule at offset ${offset} is inside @layer base`,
      ).toBe(false);
    }
  });
});

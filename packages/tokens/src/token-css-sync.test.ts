import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

import { describe, expect, it } from "vitest";

import defaultJson from "./default.json" with { type: "json" };

const cssDir = join(dirname(fileURLToPath(import.meta.url)), "css");

function readCss(name: string): string {
  return readFileSync(join(cssDir, name), "utf-8");
}

function extractCssVars(block: string): string[] {
  const vars: string[] = [];
  for (const match of block.matchAll(/(--[\w-]+):/g)) {
    vars.push(match[1]!);
  }
  return vars;
}

describe("token CSS sync", () => {
  it("semantic.light keys exist in generated :root CSS", () => {
    const semanticCss = readCss("semantic.css");
    const rootBlock = semanticCss.match(/:root\s*\{([^}]+)\}/s)?.[1] ?? "";
    const cssVars = new Set(extractCssVars(rootBlock));
    const lightKeys = Object.keys(defaultJson.semantic.light);

    for (const key of lightKeys) {
      expect(cssVars.has(`--${key}`)).toBe(true);
    }
  });

  it("semantic.dark keys exist in generated .dark CSS", () => {
    const semanticCss = readCss("semantic.css");
    const darkBlock = semanticCss.match(/\.dark\s*\{([^}]+)\}/s)?.[1] ?? "";
    const cssVars = new Set(extractCssVars(darkBlock));
    const darkKeys = Object.keys(defaultJson.semantic.light);

    for (const key of darkKeys) {
      expect(cssVars.has(`--${key}`)).toBe(true);
    }
  });

  it("color families emit scale vars in colors.css", () => {
    const colorsCss = readCss("colors.css");
    for (const family of Object.keys(defaultJson.color)) {
      expect(colorsCss).toContain(`--mnv-${family}-900`);
      expect(colorsCss).toContain(`--mnv-${family}-50`);
    }
  });
});

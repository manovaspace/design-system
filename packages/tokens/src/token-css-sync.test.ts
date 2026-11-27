import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

import { describe, expect, it } from "vitest";
import { tokensToRuntimeCss } from "./apply-tokens.js";
import { defaultTokens, defaultTokensRaw } from "./default-tokens.js";
import { resolveBrandTokens } from "./dtcg/brand-pipeline.js";
import { SHADCN_SEMANTIC_VAR_NAMES } from "./dtcg/m3-to-shadcn-aliases.js";
import { v1ToBrandInput } from "./dtcg/v1-bridge.js";
import { normalizeSemanticColor } from "./hsl-color.js";

const srcDir = dirname(fileURLToPath(import.meta.url));
const cssDir = join(srcDir, "css");

/** Declarations of every `selector { ... }` block, last declaration wins. */
function declarationsOf(css: string, selector: string): Map<string, string> {
  const decls = new Map<string, string>();
  const escaped = selector.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  for (const block of css.matchAll(
    new RegExp(`(?:^|\\s)${escaped}\\s*\\{([^}]*)\\}`, "gm"),
  )) {
    for (const decl of (block[1] ?? "").matchAll(
      /(--[\w-]+)\s*:\s*([^;]+);/g,
    )) {
      if (decl[1] && decl[2]) decls.set(decl[1], decl[2].trim());
    }
  }
  return decls;
}

function readCss(name: string): string {
  return readFileSync(join(cssDir, name), "utf-8");
}

function extractCssVars(block: string): string[] {
  const vars: string[] = [];
  for (const match of block.matchAll(/(--[\w-]+):/g)) {
    const variable = match[1];
    if (variable) vars.push(variable);
  }
  return vars;
}

describe("token CSS sync", () => {
  it("semantic.light keys and canonical --md-sys-color-* exist in generated :root CSS", () => {
    const semanticCss = readCss("semantic.css");
    const rootBlock = semanticCss.match(/:root\s*\{([^}]+)\}/s)?.[1] ?? "";
    const cssVars = new Set(extractCssVars(rootBlock));
    const lightKeys = Object.keys(defaultTokensRaw.semantic.light);

    for (const key of lightKeys) {
      expect(cssVars.has(`--${key}`)).toBe(true);
    }

    for (const base of [
      "primary",
      "secondary",
      "destructive",
      "accent",
      "muted",
    ]) {
      expect(cssVars.has(`--${base}-hover`)).toBe(true);
    }

    for (const m3Var of [
      "--md-sys-color-primary",
      "--md-sys-color-on-primary",
      "--md-sys-color-surface",
      "--md-sys-color-surface-container-lowest",
      "--md-sys-color-outline",
      "--md-sys-state-hover-opacity",
    ]) {
      expect(cssVars.has(m3Var)).toBe(true);
    }
  });

  it("semantic.dark keys and canonical --md-sys-color-* exist in generated .dark CSS", () => {
    const semanticCss = readCss("semantic.css");
    const darkBlock = semanticCss.match(/\.dark\s*\{([^}]+)\}/s)?.[1] ?? "";
    const cssVars = new Set(extractCssVars(darkBlock));
    const darkKeys = Object.keys(defaultTokensRaw.semantic.light);

    for (const key of darkKeys) {
      expect(cssVars.has(`--${key}`)).toBe(true);
    }

    for (const base of [
      "primary",
      "secondary",
      "destructive",
      "accent",
      "muted",
    ]) {
      expect(cssVars.has(`--${base}-hover`)).toBe(true);
    }

    expect(cssVars.has("--md-sys-color-primary")).toBe(true);
    expect(cssVars.has("--md-sys-color-surface")).toBe(true);
  });

  it("emits medium and high contrast override blocks", () => {
    const semanticCss = readCss("semantic.css");
    expect(semanticCss).toContain('[data-contrast="medium"]');
    expect(semanticCss).toContain('.dark[data-contrast="medium"]');
    expect(semanticCss).toContain('[data-contrast="high"]');
    expect(semanticCss).toContain('.dark[data-contrast="high"]');
  });

  it("color families emit legacy and M3 palette scale vars in colors.css", () => {
    const colorsCss = readCss("colors.css");
    for (const family of Object.keys(defaultTokensRaw.color)) {
      expect(colorsCss).toContain(`--mnv-${family}-900`);
      expect(colorsCss).toContain(`--mnv-${family}-50`);
    }
    expect(colorsCss).toContain("--md-ref-palette-primary-40");
    expect(colorsCss).toContain("--md-ref-palette-neutral-98");
  });

  it("resolveTokens dark shadcn colours equal the M3 dark standard roles for the v1-mapped seeds", () => {
    const m3Dark = resolveBrandTokens(v1ToBrandInput(defaultTokensRaw)).schemes
      .dark.standard.semanticHex;
    let checked = 0;
    for (const key of SHADCN_SEMANTIC_VAR_NAMES) {
      const hex = m3Dark[key];
      if (!hex?.startsWith("#")) continue;
      checked += 1;
      expect(defaultTokens.semantic.dark[key]).toBe(
        normalizeSemanticColor(hex),
      );
    }
    expect(checked).toBeGreaterThan(40);
  });

  it("tokensToRuntimeCss(defaultTokens) matches semantic.css for every shared var in :root and .dark", () => {
    const runtime = tokensToRuntimeCss(defaultTokens);
    const semanticCss = readCss("semantic.css");
    for (const selector of [":root", ".dark"]) {
      const expected = declarationsOf(semanticCss, selector);
      const actual = declarationsOf(runtime, selector);
      const shared = [...expected.keys()].filter((name) => actual.has(name));
      expect(shared.length, selector).toBeGreaterThan(40);
      for (const name of shared) {
        expect(actual.get(name), `${selector} ${name}`).toBe(
          expected.get(name),
        );
      }
    }
  });

  it("resolve-tokens.ts does not import the v1 HSL dark derivation", () => {
    const source = readFileSync(join(srcDir, "resolve-tokens.ts"), "utf8");
    expect(source).not.toMatch(/import[^;]*\bderiveSemanticDark\b/s);
    expect(source).not.toMatch(/import[^;]*\binvertHslLightness\b/s);
  });
});

import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import { defaultDtcgDocument } from "../default-tokens.js";
import { validateDtcgDocument } from "../validate-tokens.js";
import {
  resolveBrandTokens,
  resolvedBrandTokensToCss,
} from "./brand-pipeline.js";
import { SHADCN_SEMANTIC_VAR_NAMES } from "./m3-to-shadcn-aliases.js";

const cssDir = join(dirname(fileURLToPath(import.meta.url)), "..", "css");

function extractVarsFromBlock(css: string, selectorRegex: RegExp): Set<string> {
  const block = css.match(selectorRegex)?.[1] ?? "";
  const vars = new Set<string>();
  for (const match of block.matchAll(/(--[\w-]+):/g)) {
    if (match[1]) vars.add(match[1]);
  }
  return vars;
}

describe("DTCG 2025.10 & shadcn CSS variable snapshot compatibility", () => {
  it("default.json is valid DTCG 2025.10 with 3 tiers and resolver", () => {
    expect(() => validateDtcgDocument(defaultDtcgDocument)).not.toThrow();
    expect(defaultDtcgDocument.ref).toBeDefined();
    expect(defaultDtcgDocument.sys).toBeDefined();
    expect(defaultDtcgDocument.comp).toBeDefined();
    expect(defaultDtcgDocument.resolver.version).toBe("2025.10");
    expect(
      defaultDtcgDocument.resolver.modifiers.colorScheme.contexts,
    ).toHaveProperty("light");
    expect(
      defaultDtcgDocument.resolver.modifiers.colorScheme.contexts,
    ).toHaveProperty("dark");
    expect(
      defaultDtcgDocument.resolver.modifiers.contrast.contexts,
    ).toHaveProperty("standard");
    expect(
      defaultDtcgDocument.resolver.modifiers.contrast.contexts,
    ).toHaveProperty("medium");
    expect(
      defaultDtcgDocument.resolver.modifiers.contrast.contexts,
    ).toHaveProperty("high");
    expect(defaultDtcgDocument.comp.field).toBeDefined();
    expect(defaultDtcgDocument.comp.button).toBeDefined();
  });

  it("preserves exact shadcn & kit CSS variable names across generated semantic.css and runtime v2 CSS", () => {
    const generatedCss = readFileSync(join(cssDir, "semantic.css"), "utf8");
    const runtimeCss = resolvedBrandTokensToCss(
      resolveBrandTokens({ seed: { primary: "#b82132" } }),
    );

    const expectedVars = SHADCN_SEMANTIC_VAR_NAMES.map((name) => `--${name}`);

    for (const css of [generatedCss, runtimeCss]) {
      const rootVars = extractVarsFromBlock(css, /:root\s*\{([^}]+)\}/s);
      const darkVars = extractVarsFromBlock(css, /\.dark\s*\{([^}]+)\}/s);

      for (const expected of expectedVars) {
        expect(rootVars.has(expected), `Missing ${expected} in :root`).toBe(
          true,
        );
        expect(darkVars.has(expected), `Missing ${expected} in .dark`).toBe(
          true,
        );
      }

      // Exact color aliases point to canonical --md-sys-color-* variables
      expect(css).toContain("--primary: var(--md-sys-color-primary);");
      expect(css).toContain("--background: var(--md-sys-color-background);");
      expect(css).toContain("--foreground: var(--md-sys-color-on-background);");
      expect(css).toContain(
        "--muted-foreground: var(--md-sys-color-on-surface-variant);",
      );
      expect(css).toContain("--destructive: var(--md-sys-color-error);");
      expect(css).toContain("--border: var(--md-sys-color-outline-variant);");
      expect(css).toContain("--input: var(--md-sys-color-outline);");
      expect(css).toContain(
        "--rounded-field: var(--md-sys-shape-field, var(--radius-lg));",
      );
    }
  });
});

import { describe, expect, it } from "vitest";
import { mnvColors } from "./colors.js";
import { defaultTokens, defaultTokensRaw } from "./default-tokens.js";
import { resolveBrandTokens } from "./dtcg/brand-pipeline.js";
import { v1ToBrandInput } from "./dtcg/v1-bridge.js";
import { normalizeSemanticColor } from "./hsl-color.js";
import {
  mergeTokenOverrides,
  mergeTokenOverridesRaw,
  resolveTokens,
} from "./resolve-tokens.js";
import { tokensToSplitCss } from "./tokens-to-css.js";
import { validateMnvColors, validateTokens } from "./validate-tokens.js";

describe("orbit tokens", () => {
  it("has six families with 50-950 steps", () => {
    expect(Object.keys(mnvColors)).toHaveLength(6);
    for (const family of Object.values(mnvColors)) {
      expect(Object.keys(family)).toHaveLength(11);
    }
  });

  it("passes validateMnvColors", () => {
    expect(() => validateMnvColors()).not.toThrow();
  });

  it("passes validateTokens on default JSON", () => {
    expect(() => validateTokens(defaultTokensRaw)).not.toThrow();
  });

  it("anchors match brand spec", () => {
    expect(mnvColors.primary[900]).toBe("#0a0a0a");
    expect(mnvColors.secondary[800]).toBe("#525252");
    expect(mnvColors.action[500]).toBe("#2563eb");
    expect(mnvColors.tertiary[700]).toBe("#1d4ed8");
    expect(mnvColors.content[200]).toBe("#e5e5e5");
    expect(mnvColors.supporting[500]).toBe("#3b82f6");
  });

  it("resolves semantic colours to HSL from the M3 pipeline", () => {
    const m3 = resolveBrandTokens(v1ToBrandInput(defaultTokensRaw));
    expect(defaultTokens.semantic.light.background).toBe(
      normalizeSemanticColor(
        m3.schemes.light.standard.semanticHex.background ?? "",
      ),
    );
    expect(defaultTokens.semantic.dark.foreground).toMatch(/^hsl\(/);
    expect(defaultTokens.semantic.dark.background).toBe(
      normalizeSemanticColor(
        m3.schemes.dark.standard.semanticHex.background ?? "",
      ),
    );
  });

  it("rejects authored semantic.dark in raw JSON", () => {
    const withDark = {
      ...defaultTokensRaw,
      semantic: {
        light: defaultTokensRaw.semantic.light,
        dark: { background: "#000000" },
      },
    };
    expect(() => validateTokens(withDark)).toThrow(/semantic\.dark/);
  });

  it("codegen round-trip produces CSS blocks", () => {
    const css = tokensToSplitCss(defaultTokens);
    expect(css.colors).toContain("--mnv-primary-900: #0a0a0a");
    expect(css.semantic).toContain(
      `--background: ${defaultTokens.semantic.light.background}`,
    );
    expect(css.radiiShadows).toContain("--breakpoint-md: 768px");
  });

  it("mergeTokenOverrides deep-merges color scales", () => {
    const merged = mergeTokenOverrides(defaultTokensRaw, {
      color: {
        primary: { 900: "#000000" },
      },
    });
    expect(merged.color.primary?.[900]).toBe("#000000");
    expect(merged.color.primary?.[50]).toBe(mnvColors.primary[50]);
  });

  it("strips legacy semantic.dark from merged overrides", () => {
    const merged = mergeTokenOverridesRaw(defaultTokensRaw, {
      semantic: {
        light: { background: "#000000" },
        dark: { background: "#ffffff" },
      },
    });
    expect(merged.semantic.dark).toBeUndefined();
    const resolved = resolveTokens(merged);
    // Light background is not a brand anchor: dark stays the M3 dark value.
    expect(resolved.semantic.dark.background).toBe(
      resolveTokens(defaultTokensRaw).semantic.dark.background,
    );
  });

  it("resolveTokens re-resolves semantic refs when brand colors change", () => {
    const raw = mergeTokenOverridesRaw(defaultTokensRaw, {
      color: {
        action: { 500: "#ebd024" },
      },
    });
    expect(raw.semantic.light.primary).toBe("{color.action.500}");
    const resolved = resolveTokens(raw);
    expect(resolved.semantic.light.primary).toMatch(/^hsl\(/);
  });
});

import { describe, expect, it } from "vitest";
import {
  resolveBrandTokens,
  resolveTenantBranding,
  toFlattenedHexTokens,
} from "./brand-pipeline.js";
import { CONTRAST_LEVELS } from "./constants.js";
import {
  assertWcagContrast,
  buildSchemeContrastPairs,
  contrastRatio,
  TokenContrastError,
} from "./wcag.js";

const TEST_SEEDS = [
  { name: "Manova default blue", primary: "#2563eb" },
  { name: "Fryto crimson", primary: "#b82132" },
  { name: "Teal", primary: "#0d9488" },
  { name: "Bright yellow", primary: "#facc15" },
  { name: "Vivid pink", primary: "#ec4899" },
  { name: "Pure black", primary: "#000000" },
  { name: "Pure white", primary: "#ffffff" },
  { name: "Emerald", primary: "#16a34a" },
] as const;

describe("WCAG contrast CI across M3 roles x light/dark x standard/medium/high", () => {
  for (const seed of TEST_SEEDS) {
    it(`all declared role pairs clear WCAG AA for ${seed.name} (${seed.primary})`, () => {
      const resolved = resolveBrandTokens({ seed: { primary: seed.primary } });

      for (const scheme of ["light", "dark"] as const) {
        for (const contrast of CONTRAST_LEVELS) {
          const schemeTokens = resolved.schemes[scheme][contrast];
          const pairs = buildSchemeContrastPairs(
            schemeTokens.m3,
            schemeTokens.semanticHex,
            { scheme, contrast },
          );
          expect(pairs.length).toBeGreaterThanOrEqual(35);

          for (const pair of pairs) {
            const ratio = contrastRatio(pair.foreground, pair.background);
            const required = pair.level === "text" ? 4.5 : 3.0;
            expect(
              ratio,
              `${seed.name} ${scheme}/${contrast} ${pair.pair}: ${ratio.toFixed(2)} < ${required}`,
            ).toBeGreaterThanOrEqual(required - 1e-6);
          }
        }
      }
    });
  }

  it("all declared role pairs clear WCAG AA for multi-seed brand.tokens.json and tenant seeds", () => {
    const brand = resolveBrandTokens({
      seed: {
        primary: "#1e40af",
        secondary: "#0f766e",
        tertiary: "#7c3aed",
        neutral: "#64748b",
        error: "#b91c1c",
      },
      shape: "round",
      density: "comfortable",
      motion: "expressive",
      contrast: "high",
    });

    for (const scheme of ["light", "dark"] as const) {
      for (const contrast of CONTRAST_LEVELS) {
        const s = brand.schemes[scheme][contrast];
        expect(() =>
          assertWcagContrast(
            buildSchemeContrastPairs(s.m3, s.semanticHex, { scheme, contrast }),
          ),
        ).not.toThrow();
      }
    }

    const tenant = resolveTenantBranding(
      { seed: { primary: "#b82132" }, logo: "fryto.svg" },
      brand.config,
    );
    expect(tenant.tenant.logo).toBe("fryto.svg");
    expect(tenant.resolved.config.font).toEqual(brand.config.font);
    expect(tenant.resolved.config.shape).toBe("round");
  });

  it("throws structured TokenContrastError when contrast gate fails", () => {
    expect(() =>
      assertWcagContrast([
        {
          pair: "low-text / surface",
          foreground: "#888888",
          background: "#ffffff",
          level: "text",
        },
        {
          pair: "low-ui / surface",
          foreground: "#d4d4d4",
          background: "#ffffff",
          level: "ui",
        },
      ]),
    ).toThrow(TokenContrastError);

    try {
      assertWcagContrast([
        {
          pair: "yellow / white",
          foreground: "#ffff00",
          background: "#ffffff",
          level: "text",
        },
      ]);
      expect.unreachable("should have thrown");
    } catch (err) {
      expect(err).toBeInstanceOf(TokenContrastError);
      const contrastErr = err as TokenContrastError;
      expect(contrastErr.code).toBe("WCAG_CONTRAST_VIOLATION");
      expect(contrastErr.violations).toHaveLength(1);
      expect(contrastErr.violations[0]?.pair).toBe("yellow / white");
      expect(contrastErr.violations[0]?.required).toBe(4.5);
      expect(contrastErr.violations[0]?.ratio).toBeLessThan(2);
    }
  });

  it("computes colour-blind-safe chart palette, M3 state layers, scale knobs, and flattened hex export", () => {
    const resolved = resolveBrandTokens({
      seed: { primary: "#2563eb" },
      shape: "sharp",
      density: "compact",
      motion: "reduced",
      contrast: "medium",
    });

    expect(resolved.stateLayers).toEqual({
      hoverOpacity: 0.08,
      focusOpacity: 0.1,
      pressedOpacity: 0.1,
      draggedOpacity: 0.16,
      disabledContentOpacity: 0.38,
      disabledContainerOpacity: 0.12,
    });
    expect(resolved.scale.radii.field).toBe("0.25rem");
    expect(resolved.scale.densityVars.controlHeightDefault).toBe("2.25rem");
    expect(resolved.scale.densityVars.controlHeightTouch).toBe("2.75rem");
    expect(resolved.scale.motionVars.duration).toBe("0ms");

    const lightCharts = [
      resolved.schemes.light.medium.m3.chart1,
      resolved.schemes.light.medium.m3.chart2,
      resolved.schemes.light.medium.m3.chart3,
      resolved.schemes.light.medium.m3.chart4,
      resolved.schemes.light.medium.m3.chart5,
    ];
    expect(new Set(lightCharts).size).toBe(5);

    const flat = toFlattenedHexTokens(resolved, {
      scheme: "light",
      contrast: "standard",
    });
    expect(Object.keys(flat.colors).length).toBeGreaterThan(60);
    for (const [key, val] of Object.entries(flat.colors)) {
      expect(val, `${key} should be flattened hex`).toMatch(/^#[0-9a-f]{6}$/);
      expect(val).not.toContain("var(");
    }
  });
});

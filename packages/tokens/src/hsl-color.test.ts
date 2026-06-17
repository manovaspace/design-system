import { describe, expect, it } from "vitest";

import {
  deriveSemanticDark,
  invertHslLightness,
  isColorValue,
  normalizeSemanticColor,
  parseColorToHsl,
  SEMANTIC_DARK_EXCLUDE,
} from "./hsl-color.js";

describe("hsl-color", () => {
  it("parses hex to hsl", () => {
    expect(parseColorToHsl("#ffffff")).toEqual({ h: 0, s: 0, l: 100 });
    expect(parseColorToHsl("#000000")).toEqual({ h: 0, s: 0, l: 0 });
  });

  it("parses hsl strings", () => {
    expect(parseColorToHsl("hsl(210 50% 40%)")).toEqual({
      h: 210,
      s: 50,
      l: 40,
    });
  });

  it("parses oklch strings", () => {
    const hsl = parseColorToHsl("oklch(0.55 0.2 25)");
    expect(hsl.l).toBeGreaterThan(0);
    expect(hsl.l).toBeLessThan(100);
  });

  it("inverts lightness", () => {
    expect(invertHslLightness({ h: 0, s: 0, l: 100 })).toEqual({
      h: 0,
      s: 0,
      l: 0,
    });
    expect(invertHslLightness({ h: 210, s: 50, l: 20 })).toEqual({
      h: 210,
      s: 50,
      l: 80,
    });
  });

  it("detects color vs non-color values", () => {
    expect(isColorValue("#ffffff")).toBe(true);
    expect(isColorValue("hsl(0 0% 100%)")).toBe(true);
    expect(isColorValue("oklch(0.55 0.2 25)")).toBe(true);
    expect(isColorValue("0.75rem")).toBe(false);
    expect(isColorValue("768px")).toBe(false);
  });

  it("normalizes colors to hsl css", () => {
    expect(normalizeSemanticColor("#ffffff")).toBe("hsl(0 0% 100%)");
    expect(normalizeSemanticColor("0.75rem")).toBe("0.75rem");
  });

  it("derives dark by inverting L except excluded keys", () => {
    const light = {
      background: "hsl(0 0% 100%)",
      foreground: "hsl(0 0% 4%)",
      primary: "hsl(220 84% 53%)",
      radius: "0.75rem",
      destructive: "oklch(0.55 0.2 25)",
    };

    const dark = deriveSemanticDark(light);

    expect(dark.background).toBe("hsl(0 0% 0%)");
    expect(dark.foreground).toBe("hsl(0 0% 96%)");
    expect(dark.primary).toBe(light.primary);
    expect(dark.radius).toBe("0.75rem");
    expect(dark.destructive).toBe(light.destructive);
  });

  it("excludes brand and chart keys", () => {
    for (const key of SEMANTIC_DARK_EXCLUDE) {
      expect(SEMANTIC_DARK_EXCLUDE.has(key)).toBe(true);
    }
  });
});

import { describe, expect, it } from "vitest";

import { defaultTokensRaw } from "../default-tokens.js";
import { resolveTokens } from "../resolve-tokens.js";
import type { OrbitTokensRaw } from "../schema/types.js";
import { DEFAULT_BRAND_SEEDS } from "./constants.js";
import { colorValueToSeedHex, v1ToBrandInput } from "./v1-bridge.js";

describe("v1ToBrandInput", () => {
  it("maps defaultTokens to exactly the codegen DEFAULT_BRAND_SEEDS it covers", () => {
    const { seed } = v1ToBrandInput(defaultTokensRaw);
    expect(seed).toEqual({
      primary: DEFAULT_BRAND_SEEDS.primary,
      neutral: DEFAULT_BRAND_SEEDS.neutral,
      secondary: DEFAULT_BRAND_SEEDS.secondary,
      tertiary: DEFAULT_BRAND_SEEDS.tertiary,
      error: DEFAULT_BRAND_SEEDS.error,
    });
  });

  it("omits secondary when it equals primary", () => {
    const raw: OrbitTokensRaw = {
      ...defaultTokensRaw,
      color: {
        ...defaultTokensRaw.color,
        secondary: { ...defaultTokensRaw.color.secondary, "800": "#2563eb" },
      },
    };
    expect(v1ToBrandInput(raw).seed.secondary).toBeUndefined();
  });

  it("falls back from status-danger to destructive for the error seed", () => {
    const { "status-danger": _drop, ...light } =
      defaultTokensRaw.semantic.light;
    const raw: OrbitTokensRaw = {
      ...defaultTokensRaw,
      semantic: { light: { ...light, destructive: "#ff0000" } },
    };
    expect(v1ToBrandInput(raw).seed.error).toBe("#ff0000");
  });

  it("does not throw for a very light primary", () => {
    const raw: OrbitTokensRaw = {
      ...defaultTokensRaw,
      semantic: {
        light: { ...defaultTokensRaw.semantic.light, primary: "#fff59d" },
      },
    };
    expect(() => resolveTokens(raw)).not.toThrow();
    expect(resolveTokens(raw).semantic.light.primary).toMatch(/^hsl\(/);
  });
});

describe("colorValueToSeedHex oklch lightness", () => {
  it("treats a percent lightness the same as the 0-1 form", () => {
    expect(colorValueToSeedHex("oklch(55% 0.2 25)")).toBe(
      colorValueToSeedHex("oklch(0.55 0.2 25)"),
    );
  });
});

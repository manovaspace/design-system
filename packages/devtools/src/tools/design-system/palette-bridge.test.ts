import { defaultTokensRaw } from "@manovaspace/tokens";
import { describe, expect, it } from "vitest";

import {
  applyPaletteColor,
  assertPaletteBridgeRoundTrip,
  readPaletteColor,
  readPaletteColors,
} from "./palette-bridge.js";

describe("palette-bridge", () => {
  it("reads five palette roles from defaults", () => {
    const colors = readPaletteColors(defaultTokensRaw);
    expect(Object.keys(colors)).toHaveLength(5);
    expect(colors.text).toMatch(/^#[0-9a-f]{6}$/);
    expect(colors.primary).toMatch(/^#[0-9a-f]{6}$/);
  });

  it("round-trips each role on default tokens", () => {
    expect(() => assertPaletteBridgeRoundTrip(defaultTokensRaw)).not.toThrow();
  });

  it("applies text color via primary anchor", () => {
    const next = applyPaletteColor(defaultTokensRaw, "text", "#050315");
    expect(next.color.primary?.["900"]).toBe("#050315");
    expect(readPaletteColor(next, "text")).toBe("#050315");
  });

  it("applies primary via action anchor", () => {
    const next = applyPaletteColor(defaultTokensRaw, "primary", "#2f27ce");
    expect(next.color.action?.["500"]).toBe("#2f27ce");
    expect(readPaletteColor(next, "primary")).toBe("#2f27ce");
  });
});

import { defaultTokensRaw } from "@manovaspace/tokens";
import { describe, expect, it } from "vitest";

import { mergeLoadedTokens } from "./token-provider.js";

const brandTokens = {
  ...defaultTokensRaw,
  semantic: {
    ...defaultTokensRaw.semantic,
    light: {
      ...defaultTokensRaw.semantic.light,
      primary: "#0d9488",
    },
  },
};

describe("mergeLoadedTokens", () => {
  it("keeps base tokens when fetches return undefined", () => {
    const merged = mergeLoadedTokens(brandTokens, undefined, undefined, undefined);
    expect(merged.semantic.light.primary).toBe("#0d9488");
  });

  it("applies local override on top of base", () => {
    const merged = mergeLoadedTokens(brandTokens, {
      semantic: { light: { primary: "#ff0000" } },
    }, undefined, undefined);
    expect(merged.semantic.light.primary).toBe("#ff0000");
  });

  it("does not reset to platform defaults when base is brand tokens", () => {
    const merged = mergeLoadedTokens(
      brandTokens,
      undefined,
      undefined,
      undefined,
    );
    expect(merged.semantic.light.primary).not.toBe(
      defaultTokensRaw.semantic.light.primary,
    );
  });
});

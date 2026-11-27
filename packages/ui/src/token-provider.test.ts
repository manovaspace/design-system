import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { defaultTokensRaw } from "@manovaspace/tokens";
import { describe, expect, it } from "vitest";

import { resolveInitialBrandTokens } from "./server/resolve-initial-tokens.js";
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
    const merged = mergeLoadedTokens(
      brandTokens,
      undefined,
      undefined,
      undefined,
    );
    expect(merged.semantic.light.primary).toBe("#0d9488");
  });

  it("applies local override on top of base", () => {
    const merged = mergeLoadedTokens(
      brandTokens,
      {
        semantic: { light: { primary: "#ff0000" } },
      },
      undefined,
      undefined,
    );
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

describe("resolveInitialBrandTokens (v2 DTCG SSR)", () => {
  it("reads public/brand.tokens.json and layers tenant seed.primary cleanly", () => {
    const dir = mkdtempSync(join(tmpdir(), "orbit-brand-"));
    try {
      mkdirSync(join(dir, "public"), { recursive: true });
      writeFileSync(
        join(dir, "public", "brand.tokens.json"),
        JSON.stringify({
          seed: { primary: "#2563eb" },
          font: {
            sans: "var(--font-vazirmatn), sans-serif",
            data: "var(--font-vazirmatn), sans-serif",
          },
          shape: "round",
        }),
      );

      const resolved = resolveInitialBrandTokens({
        cwd: dir,
        tenantSeed: {
          seed: { primary: "#b82132" },
          logo: "https://cdn.example.com/fryto.svg",
        },
      });

      expect(resolved.version).toBe(2);
      expect(resolved.config.seed.primary).toBe("#b82132");
      expect(resolved.config.font.sans).toBe(
        "var(--font-vazirmatn), sans-serif",
      );
      expect(resolved.config.shape).toBe("round");
      expect(resolved.schemes.light.standard.m3.primary).toMatch(
        /^#[0-9a-f]{6}$/,
      );
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
  });
});

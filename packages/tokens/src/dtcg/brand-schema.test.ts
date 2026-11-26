import { describe, expect, it } from "vitest";
import {
  parseBrandTokens,
  parseHexOrDtcgColor,
  parseTenantSeed,
  TokenSchemaError,
} from "./brand-schema.js";

describe("brand.tokens.json schema validator", () => {
  it("parses minimal brand.tokens.json with seed.primary hex", () => {
    const config = parseBrandTokens({
      seed: { primary: "#2563EB" },
    });
    expect(config.seed.primary).toBe("#2563eb");
    expect(config.shape).toBe("default");
    expect(config.density).toBe("default");
    expect(config.motion).toBe("standard");
    expect(config.contrast).toBe("standard");
  });

  it("parses full DTCG 2025.10 leaf nodes and sRGB color objects", () => {
    const config = parseBrandTokens({
      $schema: "https://tr.designtokens.org/format/",
      $description: "Product brand theme",
      seed: {
        primary: {
          $value: {
            colorSpace: "srgb",
            components: [0.721569, 0.129412, 0.196078],
            hex: "#B82132",
          },
          $type: "color",
        },
        secondary: { $value: "#475569", $type: "color" },
        tertiary: { $value: "#0f766e", $type: "color" },
        neutral: { $value: "#64748b", $type: "color" },
        error: { $value: "#dc2626", $type: "color" },
      },
      font: {
        sans: {
          $value: ["var(--font-vazirmatn)", "sans-serif"],
          $type: "fontFamily",
        },
        data: {
          $value: "var(--font-vazirmatn), monospace",
          $type: "fontFamily",
        },
      },
      shape: { $value: "round", $type: "string" },
      density: { $value: "compact", $type: "string" },
      motion: { $value: "expressive", $type: "string" },
      contrast: { $value: "medium", $type: "string" },
    });

    expect(config.seed.primary).toBe("#b82132");
    expect(config.seed.secondary).toBe("#475569");
    expect(config.seed.tertiary).toBe("#0f766e");
    expect(config.seed.neutral).toBe("#64748b");
    expect(config.seed.error).toBe("#dc2626");
    expect(config.font.sans).toBe("var(--font-vazirmatn), sans-serif");
    expect(config.font.data).toBe("var(--font-vazirmatn), monospace");
    expect(config.shape).toBe("round");
    expect(config.density).toBe("compact");
    expect(config.motion).toBe("expressive");
    expect(config.contrast).toBe("medium");
  });

  it("normalizes 3-char hex and DTCG srgb components without hex property", () => {
    expect(parseHexOrDtcgColor("#F0a", "seed.primary")).toBe("#ff00aa");
    expect(
      parseHexOrDtcgColor(
        { colorSpace: "srgb", components: [1, 0, 0] },
        "seed.primary",
      ),
    ).toBe("#ff0000");
  });

  it("rejects unknown root, seed, font, and leaf keys", () => {
    expect(() =>
      parseBrandTokens({ seed: { primary: "#2563eb" }, colors: {} }),
    ).toThrow(TokenSchemaError);

    expect(() =>
      parseBrandTokens({
        seed: { primary: "#2563eb", accent: "#ff0000" },
      }),
    ).toThrow(/Unknown key "accent"/);

    expect(() =>
      parseBrandTokens({
        seed: { primary: "#2563eb" },
        font: { mono: "monospace" },
      }),
    ).toThrow(/Unknown key "mono"/);

    expect(() =>
      parseBrandTokens({
        seed: { primary: { $value: "#2563eb", extra: true } },
      }),
    ).toThrow(/Unknown key "extra"/);
  });

  it("rejects missing seed.primary, bad colors, and invalid enums", () => {
    expect(() => parseBrandTokens({})).toThrow(TokenSchemaError);
    expect(() => parseBrandTokens({ seed: {} })).toThrow(/seed\.primary/);
    expect(() =>
      parseBrandTokens({ seed: { primary: "not-a-color" } }),
    ).toThrow(TokenSchemaError);
    expect(() =>
      parseBrandTokens({ seed: { primary: "#2563eb" }, shape: "pill" }),
    ).toThrow(TokenSchemaError);
    expect(() =>
      parseBrandTokens({ seed: { primary: "#2563eb" }, contrast: "ultra" }),
    ).toThrow(TokenSchemaError);
  });
});

describe("white-label tenant seed validator", () => {
  it("accepts seed.primary and optional logo only", () => {
    const minimal = parseTenantSeed({ seed: { primary: "#b82132" } });
    expect(minimal).toEqual({ seed: { primary: "#b82132" } });

    const withLogo = parseTenantSeed({
      seed: { primary: { $value: "#0d9488", $type: "color" } },
      logo: "tenants/fryto/logo.svg",
    });
    expect(withLogo).toEqual({
      seed: { primary: "#0d9488" },
      logo: "tenants/fryto/logo.svg",
    });
  });

  it("rejects any extra seed or brand knob on tenant config", () => {
    expect(() =>
      parseTenantSeed({
        seed: { primary: "#b82132", secondary: "#000000" },
      }),
    ).toThrow(/Unknown key "secondary"/);

    expect(() =>
      parseTenantSeed({
        seed: { primary: "#b82132" },
        font: { sans: "Inter" },
      }),
    ).toThrow(/Unknown key "font"/);

    expect(() =>
      parseTenantSeed({
        seed: { primary: "#b82132" },
        shape: "sharp",
      }),
    ).toThrow(/Unknown key "shape"/);

    expect(() =>
      parseTenantSeed({
        seed: { primary: "#b82132" },
        accent: "#ff0000",
      }),
    ).toThrow(/Unknown key "accent"/);

    expect(() =>
      parseTenantSeed({
        seed: { primary: "#b82132" },
        logo: "",
      }),
    ).toThrow(/logo/);
  });
});

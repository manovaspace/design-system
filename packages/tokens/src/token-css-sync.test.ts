import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

import { describe, expect, it } from "vitest";

import defaultJson from "./default.json" with { type: "json" };

const cssDir = join(dirname(fileURLToPath(import.meta.url)), "css");

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

function relativeLuminance(hex: string): number {
  const value = hex.replace(/^#/, "");
  const channels = value.match(/.{2}/g);
  if (channels?.length !== 3) {
    throw new Error(`Expected a six-digit hex color, got ${hex}`);
  }
  const [red, green, blue] = channels.map((channel) => {
    const normalized = parseInt(channel, 16) / 255;
    return normalized <= 0.04045
      ? normalized / 12.92
      : ((normalized + 0.055) / 1.055) ** 2.4;
  });
  if (red === undefined || green === undefined || blue === undefined) {
    throw new Error(`Expected three color channels, got ${hex}`);
  }
  return 0.2126 * red + 0.7152 * green + 0.0722 * blue;
}

function contrastRatio(first: string, second: string): number {
  const firstLuminance = relativeLuminance(first);
  const secondLuminance = relativeLuminance(second);
  return (
    (Math.max(firstLuminance, secondLuminance) + 0.05) /
    (Math.min(firstLuminance, secondLuminance) + 0.05)
  );
}

describe("token CSS sync", () => {
  it("semantic.light keys exist in generated :root CSS", () => {
    const semanticCss = readCss("semantic.css");
    const rootBlock = semanticCss.match(/:root\s*\{([^}]+)\}/s)?.[1] ?? "";
    const cssVars = new Set(extractCssVars(rootBlock));
    const lightKeys = Object.keys(defaultJson.semantic.light);

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
  });

  it("semantic.dark keys exist in generated .dark CSS", () => {
    const semanticCss = readCss("semantic.css");
    const darkBlock = semanticCss.match(/\.dark\s*\{([^}]+)\}/s)?.[1] ?? "";
    const cssVars = new Set(extractCssVars(darkBlock));
    const darkKeys = Object.keys(defaultJson.semantic.light);

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
  });

  it("color families emit scale vars in colors.css", () => {
    const colorsCss = readCss("colors.css");
    for (const family of Object.keys(defaultJson.color)) {
      expect(colorsCss).toContain(`--mnv-${family}-900`);
      expect(colorsCss).toContain(`--mnv-${family}-50`);
    }
  });

  it("warning text and foreground meet AA contrast in the light theme", () => {
    const theme = defaultJson.semantic.light;
    expect(
      contrastRatio(theme["status-warning"], theme.background),
    ).toBeGreaterThanOrEqual(4.5);
    expect(
      contrastRatio(
        theme["status-warning-foreground"],
        theme["status-warning"],
      ),
    ).toBeGreaterThanOrEqual(4.5);
  });
});

#!/usr/bin/env node
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const srcDir = join(root, "src");
const cssDir = join(srcDir, "css");

const REF = /^\{([^}]+)\}$/;
const HEX = /^#[0-9a-f]{6}$/i;
const HEX_COLOR = /^#([0-9a-f]{3}|[0-9a-f]{6}|[0-9a-f]{8})$/i;
const HSL_COLOR = /^hsla?\(/i;
const OKLCH_COLOR = /^oklch\(/i;

const SEMANTIC_DARK_EXCLUDE = new Set([
  "primary",
  "primary-foreground",
  "ring",
  "chart-1",
  "chart-2",
  "chart-3",
  "chart-4",
  "chart-5",
  "sidebar-primary",
  "sidebar-primary-foreground",
  "sidebar-ring",
  "destructive",
]);

function lookup(path, tokens) {
  let current = tokens;
  for (const part of path.split(".")) {
    if (current == null || typeof current !== "object") return undefined;
    current = current[part];
  }
  return typeof current === "string" ? current : undefined;
}

function resolveValue(value, tokens, depth = 0) {
  if (depth > 32) throw new Error(`Token depth exceeded: ${value}`);
  const match = value.match(REF);
  if (!match) return value;
  const next = lookup(match[1], tokens);
  if (next === undefined) throw new Error(`Unresolved: ${value}`);
  return resolveValue(next, tokens, depth + 1);
}

function resolveRecord(record, tokens) {
  const resolved = { ...record };
  for (let pass = 0; pass < 32; pass += 1) {
    let changed = false;
    for (const [key, value] of Object.entries(resolved)) {
      const next = resolveValue(value, tokens);
      if (next !== value) {
        resolved[key] = next;
        changed = true;
      }
    }
    if (!changed) break;
  }
  return resolved;
}

function hexToRgb(hex) {
  const n = hex.replace("#", "");
  const full =
    n.length === 3
      ? n
          .split("")
          .map((c) => c + c)
          .join("")
      : n.slice(0, 6);
  const num = Number.parseInt(full, 16);
  return [
    ((num >> 16) & 255) / 255,
    ((num >> 8) & 255) / 255,
    (num & 255) / 255,
  ];
}

function rgbToHsl(r, g, b) {
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0;
  let s = 0;
  const l = (max + min) / 2;
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r:
        h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
        break;
      case g:
        h = ((b - r) / d + 2) / 6;
        break;
      default:
        h = ((r - g) / d + 4) / 6;
        break;
    }
  }
  return {
    h: Math.round(h * 360 * 10) / 10,
    s: Math.round(s * 1000) / 10,
    l: Math.round(l * 1000) / 10,
  };
}

function linearize(c) {
  return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
}

function delinearize(c) {
  return c <= 0.0031308 ? c * 12.92 : 1.055 * c ** (1 / 2.4) - 0.055;
}

function _rgbToOklch(r, g, b) {
  const lr = linearize(r);
  const lg = linearize(g);
  const lb = linearize(b);
  const l_ = 0.4122214708 * lr + 0.5363325363 * lg + 0.0514459929 * lb;
  const m_ = 0.2119034982 * lr + 0.6806995451 * lg + 0.1073969566 * lb;
  const s_ = 0.0883024619 * lr + 0.2817188376 * lg + 0.6299787005 * lb;
  const l = Math.cbrt(l_);
  const m = Math.cbrt(m_);
  const s = Math.cbrt(s_);
  const L = 0.2104542553 * l + 0.793617785 * m - 0.0040720468 * s;
  const a = 1.9779984951 * l - 2.428592205 * m + 0.4505937099 * s;
  const b2 = 0.0259040371 * l + 0.7827717662 * m - 0.808675766 * s;
  const C = Math.sqrt(a * a + b2 * b2);
  let H = (Math.atan2(b2, a) * 180) / Math.PI;
  if (H < 0) H += 360;
  return { l: L, c: C, h: H };
}

function oklchToRgb(l, c, h) {
  const hr = (h * Math.PI) / 180;
  const a = c * Math.cos(hr);
  const b = c * Math.sin(hr);
  const l_ = l + 0.3963377774 * a + 0.2158037573 * b;
  const m_ = l - 0.1055613458 * a - 0.0638541728 * b;
  const s_ = l - 0.0894841775 * a - 1.291485548 * b;
  const l3 = l_ ** 3;
  const m3 = m_ ** 3;
  const s3 = s_ ** 3;
  const lr = 4.0767416621 * l3 - 3.3077115913 * m3 + 0.2309699292 * s3;
  const lg = -1.2684380046 * l3 + 2.6097574011 * m3 - 0.3413193965 * s3;
  const lb = -0.0041960863 * l3 - 0.7034186147 * m3 + 1.707614701 * s3;
  return [delinearize(lr), delinearize(lg), delinearize(lb)];
}

function oklchToHex(l, c, h) {
  const [r, g, b] = oklchToRgb(l, c, h);
  const toByte = (v) =>
    Math.round(Math.min(1, Math.max(0, v)) * 255)
      .toString(16)
      .padStart(2, "0");
  return `#${toByte(r)}${toByte(g)}${toByte(b)}`;
}

function isColorValue(value) {
  const trimmed = value.trim();
  return (
    HEX_COLOR.test(trimmed) ||
    HSL_COLOR.test(trimmed) ||
    OKLCH_COLOR.test(trimmed)
  );
}

function parseColorToHsl(value) {
  const trimmed = value.trim();
  if (HEX_COLOR.test(trimmed)) {
    const [r, g, b] = hexToRgb(trimmed);
    return rgbToHsl(r, g, b);
  }
  if (HSL_COLOR.test(trimmed)) {
    const inner = trimmed
      .replace(/^hsla?\(/i, "")
      .replace(/\)$/, "")
      .trim();
    const parts = inner.split(/[\s,/]+/).filter(Boolean);
    return {
      h: Number.parseFloat(parts[0].replace(/deg$/i, "")),
      s: Number.parseFloat(parts[1].replace(/%$/, "")),
      l: Number.parseFloat(parts[2].replace(/%$/, "")),
    };
  }
  if (OKLCH_COLOR.test(trimmed)) {
    const inner = trimmed
      .replace(/^oklch\(/i, "")
      .replace(/\)$/, "")
      .trim();
    const parts = inner.split(/[\s,/]+/).filter(Boolean);
    const hex = oklchToHex(
      Number.parseFloat(parts[0]),
      Number.parseFloat(parts[1]),
      Number.parseFloat(parts[2].replace(/deg$/i, "")),
    );
    const [r, g, b] = hexToRgb(hex);
    return rgbToHsl(r, g, b);
  }
  throw new Error(`Unsupported color: ${value}`);
}

function hslToCss({ h, s, l }) {
  return `hsl(${h} ${s}% ${l}%)`;
}

function normalizeSemanticColor(value) {
  if (!isColorValue(value)) return value;
  return hslToCss(parseColorToHsl(value));
}

function deriveSemanticDark(light) {
  const dark = {};
  for (const [key, value] of Object.entries(light)) {
    if (SEMANTIC_DARK_EXCLUDE.has(key) || !isColorValue(value)) {
      dark[key] = value;
      continue;
    }
    const hsl = parseColorToHsl(value);
    dark[key] = hslToCss({
      ...hsl,
      l: Math.min(100, Math.max(0, 100 - hsl.l)),
    });
  }
  return dark;
}

function resolveTokens(raw) {
  const resolvedLight = Object.fromEntries(
    Object.entries(resolveRecord(raw.semantic.light, raw)).map(
      ([key, value]) => [key, normalizeSemanticColor(value)],
    ),
  );
  return {
    ...raw,
    semantic: {
      light: resolvedLight,
      dark: deriveSemanticDark(resolvedLight),
    },
  };
}

function validateTokens(raw) {
  if (raw.version !== 1) throw new Error(`Unsupported version ${raw.version}`);
  for (const family of Object.keys(raw.color)) {
    for (const step of Object.keys(raw.color[family])) {
      const value = raw.color[family][step];
      if (!HEX.test(value))
        throw new Error(`Invalid ${family}.${step}: ${value}`);
    }
  }
  if (raw.semantic.dark) {
    throw new Error(
      "semantic.dark must not be authored — dark is derived from light",
    );
  }
  const resolved = resolveTokens(raw);
  for (const theme of ["light", "dark"]) {
    for (const [key, value] of Object.entries(resolved.semantic[theme])) {
      if (value.includes("{"))
        throw new Error(`Unresolved semantic.${theme}.${key}`);
    }
  }
}

function tokensToSplitCss(tokens) {
  const header =
    "/* AUTO-GENERATED from default.json — do not edit by hand. */\n\n";
  const colors = [":root {"];
  for (const [family, scale] of Object.entries(tokens.color)) {
    colors.push(`  /* ${family} */`);
    for (const [step, value] of Object.entries(scale)) {
      colors.push(`  --mnv-${family}-${step}: ${value};`);
    }
  }
  colors.push("}");

  const spacing = [":root {"];
  for (const [step, value] of Object.entries(tokens.spacing)) {
    spacing.push(`  --space-${step}: ${value};`);
  }
  spacing.push("}");

  const typography = [":root {"];
  for (const [key, value] of Object.entries(tokens.typography.fontFamily)) {
    typography.push(`  --font-${key}: ${value};`);
  }
  for (const [key, value] of Object.entries(tokens.typography.fontSize)) {
    typography.push(`  --font-size-${key}: ${value};`);
  }
  for (const [key, value] of Object.entries(tokens.typography.lineHeight)) {
    typography.push(`  --line-height-${key}: ${value};`);
  }
  typography.push("}");

  const radiiShadows = [":root {"];
  for (const [key, value] of Object.entries(tokens.radii)) {
    radiiShadows.push(`  --radius-${key}: ${value};`);
  }
  for (const [key, value] of Object.entries(tokens.shadow)) {
    radiiShadows.push(`  --shadow-${key}: ${value};`);
  }
  radiiShadows.push("}", "", ":root {");
  for (const [key, value] of Object.entries(tokens.breakpoint)) {
    radiiShadows.push(`  --breakpoint-${key}: ${value};`);
  }
  radiiShadows.push("}");

  const light = [":root {", "  color-scheme: light;"];
  for (const [key, value] of Object.entries(tokens.semantic.light)) {
    light.push(`  --${key}: ${value};`);
  }
  light.push("}");

  const dark = [".dark {", "  color-scheme: dark;"];
  for (const [key, value] of Object.entries(tokens.semantic.dark)) {
    dark.push(`  --${key}: ${value};`);
  }
  dark.push("}");

  return {
    colors: `${header}${colors.join("\n")}\n`,
    spacing: `${header}${spacing.join("\n")}\n`,
    typography: `${header}${typography.join("\n")}\n`,
    radiiShadows: `${header}${radiiShadows.join("\n")}\n`,
    semantic: `${header}${light.join("\n")}\n\n${dark.join("\n")}\n`,
  };
}

const raw = JSON.parse(readFileSync(join(srcDir, "default.json"), "utf8"));
validateTokens(raw);
const tokens = resolveTokens(raw);
const css = tokensToSplitCss(tokens);

mkdirSync(cssDir, { recursive: true });
writeFileSync(join(cssDir, "colors.css"), css.colors);
writeFileSync(join(cssDir, "spacing.css"), css.spacing);
writeFileSync(join(cssDir, "typography.css"), css.typography);
writeFileSync(join(cssDir, "radii-shadows.css"), css.radiiShadows);
writeFileSync(join(cssDir, "semantic.css"), css.semantic);

const colorEntries = Object.entries(tokens.color)
  .map(([family, scale]) => {
    const steps = Object.entries(scale)
      .map(([step, value]) => `    ${step}: "${value}",`)
      .join("\n");
    return `  ${family}: {\n${steps}\n  },`;
  })
  .join("\n");

writeFileSync(
  join(srcDir, "colors.ts"),
  `/**
 * AUTO-GENERATED from default.json — do not edit by hand.
 */

export const mnvColors = {
${colorEntries}
} as const;

export type MnvColorFamily = keyof typeof mnvColors;
export type MnvColorStep = keyof (typeof mnvColors)["primary"];

export { validateMnvColors } from "./validate-tokens.js";
`,
);

console.log("[@manovaspace/tokens] codegen complete");

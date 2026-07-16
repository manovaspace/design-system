import { oklchToHex } from "./generate-color-scale.js";

export type Hsl = { h: number; s: number; l: number };

export const SEMANTIC_DARK_EXCLUDE = new Set([
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

const HEX_PATTERN = /^#([0-9a-f]{3}|[0-9a-f]{6}|[0-9a-f]{8})$/i;
const HSL_PATTERN = /^hsla?\(/i;
const OKLCH_PATTERN = /^oklch\(/i;

function clamp(n: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, n));
}

function hexToRgb(hex: string): [number, number, number] {
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

function rgbToHsl(r: number, g: number, b: number): Hsl {
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

function parseHslString(value: string): Hsl {
  const inner = value
    .replace(/^hsla?\(/i, "")
    .replace(/\)$/, "")
    .trim();
  const parts = inner.split(/[\s,/]+/).filter(Boolean);
  if (parts.length < 3) {
    throw new Error(`Invalid HSL color: ${value}`);
  }

  const [hRaw, sRaw, lRaw] = parts;
  if (hRaw === undefined || sRaw === undefined || lRaw === undefined) {
    throw new Error(`Invalid HSL color: ${value}`);
  }

  const h = Number.parseFloat(hRaw.replace(/deg$/i, ""));
  const s = Number.parseFloat(sRaw.replace(/%$/, ""));
  const l = Number.parseFloat(lRaw.replace(/%$/, ""));

  if ([h, s, l].some((n) => Number.isNaN(n))) {
    throw new Error(`Invalid HSL color: ${value}`);
  }

  return { h, s, l };
}

function parseOklchString(value: string): Hsl {
  const inner = value
    .replace(/^oklch\(/i, "")
    .replace(/\)$/, "")
    .trim();
  const parts = inner.split(/[\s,/]+/).filter(Boolean);
  if (parts.length < 3) {
    throw new Error(`Invalid OKLCH color: ${value}`);
  }

  const [lRaw, cRaw, hRaw] = parts;
  if (lRaw === undefined || cRaw === undefined || hRaw === undefined) {
    throw new Error(`Invalid OKLCH color: ${value}`);
  }

  const l = Number.parseFloat(lRaw);
  const c = Number.parseFloat(cRaw);
  const h = Number.parseFloat(hRaw.replace(/deg$/i, ""));
  const hex = oklchToHex(l, c, h);
  return parseColorToHsl(hex);
}

export function isColorValue(value: string): boolean {
  const trimmed = value.trim();
  return (
    HEX_PATTERN.test(trimmed) ||
    HSL_PATTERN.test(trimmed) ||
    OKLCH_PATTERN.test(trimmed)
  );
}

export function parseColorToHsl(value: string): Hsl {
  const trimmed = value.trim();

  if (HEX_PATTERN.test(trimmed)) {
    const [r, g, b] = hexToRgb(trimmed);
    return rgbToHsl(r, g, b);
  }

  if (HSL_PATTERN.test(trimmed)) {
    return parseHslString(trimmed);
  }

  if (OKLCH_PATTERN.test(trimmed)) {
    return parseOklchString(trimmed);
  }

  throw new Error(`Unsupported color format: ${value}`);
}

export function hslToCss({ h, s, l }: Hsl): string {
  return `hsl(${h} ${s}% ${l}%)`;
}

export function invertHslLightness(hsl: Hsl): Hsl {
  return { ...hsl, l: clamp(100 - hsl.l, 0, 100) };
}

export function normalizeSemanticColor(value: string): string {
  if (!isColorValue(value)) return value;
  return hslToCss(parseColorToHsl(value));
}

export function deriveSemanticDark(
  light: Record<string, string>,
): Record<string, string> {
  const dark: Record<string, string> = {};

  for (const [key, value] of Object.entries(light)) {
    if (SEMANTIC_DARK_EXCLUDE.has(key) || !isColorValue(value)) {
      dark[key] = value;
      continue;
    }

    const hsl = parseColorToHsl(value);
    dark[key] = hslToCss(invertHslLightness(hsl));
  }

  return dark;
}

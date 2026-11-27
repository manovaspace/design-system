import { oklchToHex } from "../generate-color-scale.js";
import { resolveRecord } from "../ref-resolve.js";
import type { OrbitTokens, OrbitTokensRaw } from "../schema/types.js";
import { DEFAULT_BRAND_SEEDS } from "./constants.js";
import type {
  BrandTokensInput,
  BrandTokensSeed,
  ResolvedBrandTokens,
} from "./types.js";

const HEX6 = /^#([0-9a-f]{6})$/i;
const HEX3 = /^#([0-9a-f]{3})$/i;
const HEX8 = /^#([0-9a-f]{6})[0-9a-f]{2}$/i;
const OKLCH = /^oklch\(\s*([^)]+)\)$/i;
const HSL = /^hsla?\(\s*([^)]+)\)$/i;

function clamp01(n: number): number {
  return Math.min(1, Math.max(0, n));
}

function toHex2(n: number): string {
  return Math.round(clamp01(n) * 255)
    .toString(16)
    .padStart(2, "0");
}

function hslToHex(h: number, s: number, l: number): string {
  const sat = clamp01(s / 100);
  const light = clamp01(l / 100);
  const hue = (((h % 360) + 360) % 360) / 60;
  const chroma = (1 - Math.abs(2 * light - 1)) * sat;
  const x = chroma * (1 - Math.abs((hue % 2) - 1));
  const m = light - chroma / 2;
  const [r, g, b] =
    hue < 1
      ? [chroma, x, 0]
      : hue < 2
        ? [x, chroma, 0]
        : hue < 3
          ? [0, chroma, x]
          : hue < 4
            ? [0, x, chroma]
            : hue < 5
              ? [x, 0, chroma]
              : [chroma, 0, x];
  return `#${toHex2(r + m)}${toHex2(g + m)}${toHex2(b + m)}`;
}

/**
 * Convert a v1 colour value (hex, `hsl()`, `oklch()`) to a `#rrggbb` seed.
 * Returns `undefined` for values that are not colours (e.g. `scale(0.98)`).
 */
export function colorValueToSeedHex(value: string): string | undefined {
  const trimmed = value.trim();
  const hex6 = trimmed.match(HEX6);
  if (hex6) return `#${hex6[1]?.toLowerCase()}`;
  const hex3 = trimmed.match(HEX3);
  if (hex3?.[1]) {
    const [r, g, b] = hex3[1].split("");
    return `#${r}${r}${g}${g}${b}${b}`.toLowerCase();
  }
  const hex8 = trimmed.match(HEX8);
  if (hex8) return `#${hex8[1]?.toLowerCase()}`;

  const oklch = trimmed.match(OKLCH);
  if (oklch?.[1]) {
    const [l, c, h] = oklch[1]
      .split(/[\s,/]+/)
      .filter(Boolean)
      .map((part, index) => {
        const n = Number.parseFloat(part.replace(/deg$/i, ""));
        // CSS allows `oklch(55% …)`: lightness percent → 0–1.
        return index === 0 && part.endsWith("%") ? n / 100 : n;
      });
    if (l === undefined || c === undefined || h === undefined) return undefined;
    if ([l, c, h].some((n) => Number.isNaN(n))) return undefined;
    return oklchToHex(l, c, h);
  }

  const hsl = trimmed.match(HSL);
  if (hsl?.[1]) {
    const [h, s, l] = hsl[1]
      .split(/[\s,/]+/)
      .filter(Boolean)
      .map((part) => Number.parseFloat(part.replace(/(deg|%)$/i, "")));
    if (h === undefined || s === undefined || l === undefined) return undefined;
    if ([h, s, l].some((n) => Number.isNaN(n))) return undefined;
    return hslToHex(h, s, l);
  }

  return undefined;
}

/**
 * Map v1 colour anchors to M3 brand seeds. Each seed is read from the v1 anchor
 * that carries the same colour in `src/default.json`, so the defaults reproduce
 * `DEFAULT_BRAND_SEEDS` (codegen seeds) exactly:
 *
 * - `primary`   <- resolved `semantic.light.primary` (`#2563eb`, the `action` brand blue).
 * - `neutral`   <- `color.primary.500` (`#727272`, the v1 grey scale; no v1 semantic role holds it).
 * - `secondary` <- `color.secondary.800` (`#525252`). Omitted when equal to primary.
 *                 The resolved `semantic.light.secondary` is a light surface (`primary.100`), not the brand seed.
 * - `tertiary`  <- `color.tertiary.700` (`#1d4ed8`).
 * - `error`     <- `semantic.light["status-danger"]` (`#dc2626`), else `semantic.light.destructive`
 *                 (`oklch(0.55 0.2 25)`, a different colour from the seed).
 *
 * A seed whose v1 anchor is absent is omitted, and M3 derives it from the primary.
 * Non-colour v1 tokens (spacing, typography, radii, shadow, breakpoint) are not part of
 * the returned input and keep their v1 handling.
 */
export function v1ToBrandInput(raw: OrbitTokensRaw): BrandTokensInput {
  const light = resolveRecord(raw.semantic.light, raw);
  const anchor = (value: string | undefined): string | undefined =>
    value === undefined ? undefined : colorValueToSeedHex(value);

  const primary = anchor(light.primary) ?? DEFAULT_BRAND_SEEDS.primary;
  const seed: BrandTokensSeed = { primary };

  const neutral = anchor(raw.color.primary?.["500"]);
  if (neutral) seed.neutral = neutral;

  const secondary = anchor(raw.color.secondary?.["800"]);
  if (secondary && secondary !== primary) seed.secondary = secondary;

  const tertiary = anchor(raw.color.tertiary?.["700"]);
  if (tertiary) seed.tertiary = tertiary;

  const error = anchor(light["status-danger"]) ?? anchor(light.destructive);
  if (error) seed.error = error;

  return { seed };
}

const resolvedByTokens = new WeakMap<OrbitTokens, ResolvedBrandTokens>();

/** Remember the M3 result that produced a `resolveTokens` output object. */
export function rememberBrandTokens(
  tokens: OrbitTokens,
  resolved: ResolvedBrandTokens,
): void {
  resolvedByTokens.set(tokens, resolved);
}

/**
 * Return the M3 result for an object produced by `resolveTokens`, if it is still
 * that object. Re-resolving such output would seed M3 from its own tones.
 */
export function recallBrandTokens(
  tokens: OrbitTokens,
): ResolvedBrandTokens | undefined {
  return resolvedByTokens.get(tokens);
}

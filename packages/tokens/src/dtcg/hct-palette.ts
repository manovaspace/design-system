import {
  argbFromHex,
  Contrast,
  Hct,
  hexFromArgb,
  SchemeTonalSpot,
  TonalPalette,
} from "@material/material-color-utilities";
import { DEFAULT_BRAND_SEEDS, M3_TONES } from "./constants.js";
import type {
  BrandTokensSeed,
  ContrastLevel,
  DtcgColorValue,
} from "./types.js";

export type BrandTonalPalettes = {
  sourceArgb: number;
  sourceHct: Hct;
  primary: TonalPalette;
  secondary: TonalPalette;
  tertiary: TonalPalette;
  neutral: TonalPalette;
  neutralVariant: TonalPalette;
  error: TonalPalette;
  success: TonalPalette;
  warning: TonalPalette;
};

/** Convert `#rrggbb` to a DTCG 2025.10 sRGB color value object. */
export function hexToDtcgColor(hex: string): DtcgColorValue {
  const argb = argbFromHex(hex);
  const r = Number((((argb >> 16) & 255) / 255).toFixed(6));
  const g = Number((((argb >> 8) & 255) / 255).toFixed(6));
  const b = Number(((argb & 255) / 255).toFixed(6));
  return {
    colorSpace: "srgb",
    components: [r, g, b],
    hex: hexFromArgb(argb).toLowerCase(),
  };
}

/** Convert a DTCG color object or hex string to `#rrggbb`. */
export function dtcgColorToHex(value: string | DtcgColorValue): string {
  if (typeof value === "string") {
    return hexFromArgb(argbFromHex(value)).toLowerCase();
  }
  if (value.hex) {
    return hexFromArgb(argbFromHex(value.hex)).toLowerCase();
  }
  const [r, g, b] = value.components;
  const toByte = (v: number) =>
    Math.round(Math.min(1, Math.max(0, v)) * 255)
      .toString(16)
      .padStart(2, "0");
  return `#${toByte(r)}${toByte(g)}${toByte(b)}`;
}

/** Build an M3 HCT tonal ramp (`0..100`) from a single seed hex color. */
export function buildHctTonalPalette(seedHex: string): Record<number, string> {
  const palette = TonalPalette.fromHct(Hct.fromInt(argbFromHex(seedHex)));
  const tones: Record<number, string> = {};
  for (const tone of M3_TONES) {
    tones[tone] = hexFromArgb(palette.tone(tone)).toLowerCase();
  }
  return tones;
}

export function tonalPaletteToRecord(
  palette: TonalPalette,
): Record<number, string> {
  const tones: Record<number, string> = {};
  for (const tone of M3_TONES) {
    tones[tone] = hexFromArgb(palette.tone(tone)).toLowerCase();
  }
  return tones;
}

/**
 * Build M3 HCT `TonalPalette`s from `brand.tokens.json` seeds.
 * Uses `SchemeTonalSpot` defaults whenever optional seeds are omitted.
 */
export function buildBrandPalettes(seed: BrandTokensSeed): BrandTonalPalettes {
  const sourceArgb = argbFromHex(seed.primary);
  const sourceHct = Hct.fromInt(sourceArgb);
  const baseScheme = new SchemeTonalSpot(sourceHct, false, 0);

  const primary = TonalPalette.fromHct(sourceHct);
  const secondary = seed.secondary
    ? TonalPalette.fromHct(Hct.fromInt(argbFromHex(seed.secondary)))
    : baseScheme.secondaryPalette;
  const tertiary = seed.tertiary
    ? TonalPalette.fromHct(Hct.fromInt(argbFromHex(seed.tertiary)))
    : baseScheme.tertiaryPalette;
  const neutral = seed.neutral
    ? TonalPalette.fromHct(Hct.fromInt(argbFromHex(seed.neutral)))
    : baseScheme.neutralPalette;
  const neutralVariant = seed.neutral
    ? TonalPalette.fromHueAndChroma(
        Hct.fromInt(argbFromHex(seed.neutral)).hue,
        Math.max(
          4,
          Math.min(10, Hct.fromInt(argbFromHex(seed.neutral)).chroma),
        ),
      )
    : baseScheme.neutralVariantPalette;
  const error = seed.error
    ? TonalPalette.fromHct(Hct.fromInt(argbFromHex(seed.error)))
    : baseScheme.errorPalette;

  const success = TonalPalette.fromHct(
    Hct.fromInt(argbFromHex(DEFAULT_BRAND_SEEDS.success)),
  );
  const warning = TonalPalette.fromHct(
    Hct.fromInt(argbFromHex(DEFAULT_BRAND_SEEDS.warning)),
  );

  return {
    sourceArgb,
    sourceHct,
    primary,
    secondary,
    tertiary,
    neutral,
    neutralVariant,
    error,
    success,
    warning,
  };
}

/**
 * Derive a 5-swatch colour-blind-safe (Okabe-Ito-inspired hue separation) chart
 * palette in HCT, ensuring every swatch meets at least 3:1 contrast (or higher on
 * medium/high contrast) against both page background and card surface.
 */
export function buildChartPalette(
  primaryHex: string,
  surfaceHex: string,
  cardHex: string,
  isDark: boolean,
  contrast: ContrastLevel,
): [string, string, string, string, string] {
  const primaryHct = Hct.fromInt(argbFromHex(primaryHex));
  const surfaceTone = Hct.fromInt(argbFromHex(surfaceHex)).tone;
  const cardTone = Hct.fromInt(argbFromHex(cardHex)).tone;

  const minRatio =
    contrast === "high" ? 4.5 : contrast === "medium" ? 3.5 : 3.1;

  // Hue separation safe under protanopia, deuteranopia, and tritanopia.
  const specs: Array<{ hue: number; chroma: number }> = [
    {
      hue: primaryHct.chroma > 12 ? primaryHct.hue : 255,
      chroma: Math.max(42, Math.min(72, primaryHct.chroma || 48)),
    },
    { hue: 48, chroma: 56 }, // warm amber/orange
    { hue: 168, chroma: 48 }, // bluish green / teal
    { hue: 328, chroma: 46 }, // reddish purple / magenta
    { hue: 22, chroma: 58 }, // vermilion
  ];

  const resolved = specs.map(({ hue, chroma }) => {
    const baseTone = isDark ? 72 : 42;
    let tone = baseTone;

    for (const bgTone of [surfaceTone, cardTone]) {
      if (Contrast.ratioOfTones(tone, bgTone) < minRatio) {
        tone = isDark
          ? Contrast.lighterUnsafe(bgTone, minRatio)
          : Contrast.darkerUnsafe(bgTone, minRatio);
      }
    }

    const color = Hct.from(hue, chroma, tone);
    return hexFromArgb(color.toInt()).toLowerCase();
  });

  return [
    resolved[0] ?? "#0072b2",
    resolved[1] ?? "#b45309",
    resolved[2] ?? "#047857",
    resolved[3] ?? "#9d174d",
    resolved[4] ?? "#c2410c",
  ];
}

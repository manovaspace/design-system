import { COLOR_STEPS } from "./schema/types.js";

type ColorStep = (typeof COLOR_STEPS)[number];

/** OKLCH lightness targets per step (tailwind-style curve). */
const STEP_LIGHTNESS: Record<ColorStep, number> = {
  "50": 0.985,
  "100": 0.967,
  "200": 0.928,
  "300": 0.869,
  "400": 0.704,
  "500": 0.553,
  "600": 0.446,
  "700": 0.372,
  "800": 0.279,
  "900": 0.21,
  "950": 0.13,
};

type Oklch = { l: number; c: number; h: number };

function clamp01(n: number): number {
  return Math.min(1, Math.max(0, n));
}

function hexToRgb(hex: string): [number, number, number] {
  const n = hex.replace("#", "");
  const full =
    n.length === 3
      ? n
          .split("")
          .map((c) => c + c)
          .join("")
      : n;
  const num = Number.parseInt(full, 16);
  return [
    ((num >> 16) & 255) / 255,
    ((num >> 8) & 255) / 255,
    (num & 255) / 255,
  ];
}

function rgbToHex(r: number, g: number, b: number): string {
  const toByte = (v: number) =>
    Math.round(clamp01(v) * 255)
      .toString(16)
      .padStart(2, "0");
  return `#${toByte(r)}${toByte(g)}${toByte(b)}`;
}

function linearize(c: number): number {
  return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
}

function delinearize(c: number): number {
  return c <= 0.0031308 ? c * 12.92 : 1.055 * c ** (1 / 2.4) - 0.055;
}

function rgbToOklch(r: number, g: number, b: number): Oklch {
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

function oklchToRgb(l: number, c: number, h: number): [number, number, number] {
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

export function hexToOklch(hex: string): Oklch {
  const [r, g, b] = hexToRgb(hex);
  return rgbToOklch(r, g, b);
}

export function oklchToHex(l: number, c: number, h: number): string {
  const [r, g, b] = oklchToRgb(l, c, h);
  return rgbToHex(r, g, b);
}

/** Brand anchor step per color family. */
export function brandAnchorStep(family: string): ColorStep {
  const anchors: Record<string, ColorStep> = {
    primary: "900",
    secondary: "800",
    action: "500",
    tertiary: "700",
    content: "200",
    supporting: "500",
  };
  return anchors[family] ?? "500";
}

/**
 * Generate steps 50–950 from a single anchor swatch.
 * Anchor step is pinned to the input hex; other steps follow a fixed lightness curve.
 */
export function generateColorScale(
  anchorHex: string,
  anchorStep: ColorStep,
): Record<ColorStep, string> {
  const anchor = hexToOklch(anchorHex);
  const chromaBase = anchor.c < 0.04 ? 0 : anchor.c;

  const scale = {} as Record<ColorStep, string>;

  for (const step of COLOR_STEPS) {
    if (step === anchorStep) {
      scale[step] = anchorHex.toLowerCase();
      continue;
    }

    const targetL = STEP_LIGHTNESS[step];
    const chroma =
      chromaBase === 0
        ? 0
        : step === "50" || step === "100"
          ? chromaBase * 0.4
          : step === "950"
            ? chromaBase * 0.9
            : chromaBase;

    scale[step] = oklchToHex(targetL, chroma, anchor.h);
  }

  return scale;
}

export function applyFamilyAnchorColor(
  color: Record<string, Record<string, string>>,
  family: string,
  anchorHex: string,
): Record<string, Record<string, string>> {
  const step = brandAnchorStep(family);
  return {
    ...color,
    [family]: generateColorScale(anchorHex, step),
  };
}

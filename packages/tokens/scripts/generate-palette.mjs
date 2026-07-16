#!/usr/bin/env node
/**
 * Regenerates color scales in default.json from brand anchor hex values.
 * Run: node scripts/generate-palette.mjs
 */
import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const defaultPath = join(root, "src/default.json");

const COLOR_STEPS = [
  "50",
  "100",
  "200",
  "300",
  "400",
  "500",
  "600",
  "700",
  "800",
  "900",
  "950",
];

const STEP_LIGHTNESS = {
  50: 0.985,
  100: 0.967,
  200: 0.928,
  300: 0.869,
  400: 0.704,
  500: 0.553,
  600: 0.446,
  700: 0.372,
  800: 0.279,
  900: 0.21,
  950: 0.13,
};

const ANCHORS = {
  primary: { step: "900", hex: "#0a0a0a" },
  secondary: { step: "800", hex: "#525252" },
  action: { step: "500", hex: "#2563eb" },
  tertiary: { step: "700", hex: "#1d4ed8" },
  content: { step: "200", hex: "#e5e5e5" },
  supporting: { step: "500", hex: "#3b82f6" },
};

function clamp01(n) {
  return Math.min(1, Math.max(0, n));
}

function hexToRgb(hex) {
  const n = hex.replace("#", "");
  const num = Number.parseInt(n, 16);
  return [
    ((num >> 16) & 255) / 255,
    ((num >> 8) & 255) / 255,
    (num & 255) / 255,
  ];
}

function rgbToHex(r, g, b) {
  const toByte = (v) =>
    Math.round(clamp01(v) * 255)
      .toString(16)
      .padStart(2, "0");
  return `#${toByte(r)}${toByte(g)}${toByte(b)}`;
}

function linearize(c) {
  return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
}

function delinearize(c) {
  return c <= 0.0031308 ? c * 12.92 : 1.055 * c ** (1 / 2.4) - 0.055;
}

function rgbToOklch(r, g, b) {
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

function generateColorScale(anchorHex, anchorStep) {
  const anchor = rgbToOklch(...hexToRgb(anchorHex));
  const chromaBase = anchor.c < 0.04 ? 0 : anchor.c;
  const scale = {};
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
    scale[step] = rgbToHex(...oklchToRgb(targetL, chroma, anchor.h));
  }
  return scale;
}

const tokens = JSON.parse(readFileSync(defaultPath, "utf8"));

tokens.color = {};
for (const [family, { step, hex }] of Object.entries(ANCHORS)) {
  tokens.color[family] = generateColorScale(hex, step);
}

tokens.semantic = {
  light: {
    background: "#ffffff",
    foreground: "{color.primary.900}",
    card: "#ffffff",
    "card-foreground": "{color.primary.900}",
    popover: "#ffffff",
    "popover-foreground": "{color.primary.900}",
    primary: "{color.action.500}",
    "primary-foreground": "#ffffff",
    secondary: "{color.primary.100}",
    "secondary-foreground": "{color.primary.900}",
    muted: "{color.primary.100}",
    "muted-foreground": "{color.primary.600}",
    accent: "{color.primary.100}",
    "accent-foreground": "{color.primary.900}",
    destructive: "oklch(0.55 0.2 25)",
    border: "{color.primary.200}",
    input: "{color.primary.200}",
    ring: "{color.action.500}",
    "chart-1": "{color.action.500}",
    "chart-2": "{color.supporting.500}",
    "chart-3": "{color.tertiary.700}",
    "chart-4": "{color.secondary.600}",
    "chart-5": "{color.primary.500}",
    radius: "{radii.lg}",
    sidebar: "{color.primary.50}",
    "sidebar-foreground": "{color.primary.900}",
    "sidebar-primary": "{color.action.500}",
    "sidebar-primary-foreground": "#ffffff",
    "sidebar-accent": "{color.primary.100}",
    "sidebar-accent-foreground": "{color.primary.900}",
    "sidebar-border": "{semantic.light.border}",
    "sidebar-ring": "{semantic.light.ring}",
  },
};

writeFileSync(defaultPath, `${JSON.stringify(tokens, null, 2)}\n`);
console.log("[@manovaspace/tokens] palette generated");

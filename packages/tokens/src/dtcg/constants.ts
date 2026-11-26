import type {
  ContrastLevel,
  DensityScale,
  MotionScale,
  ShapeScale,
} from "./types.js";

export const SHAPE_SCALES: readonly ShapeScale[] = [
  "sharp",
  "default",
  "round",
];

export const DENSITY_SCALES: readonly DensityScale[] = [
  "compact",
  "default",
  "comfortable",
];

export const MOTION_SCALES: readonly MotionScale[] = [
  "reduced",
  "standard",
  "expressive",
];

export const CONTRAST_LEVELS: readonly ContrastLevel[] = [
  "standard",
  "medium",
  "high",
];

export const DEFAULT_BRAND_FONT = {
  sans: "Estedad, Fredoka, Inter, Arial, sans-serif",
  data: "Vazirmatn, Estedad, Arial, sans-serif",
} as const;

export const DEFAULT_BRAND_SEEDS = {
  primary: "#2563eb",
  secondary: "#525252",
  tertiary: "#1d4ed8",
  neutral: "#727272",
  error: "#dc2626",
  success: "#059669",
  warning: "#d97706",
} as const;

export const M3_TONES = [
  0, 4, 6, 10, 12, 17, 20, 22, 24, 30, 40, 50, 60, 70, 80, 87, 90, 92, 94, 95,
  96, 98, 99, 100,
] as const;

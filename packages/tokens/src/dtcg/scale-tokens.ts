import type {
  DensityScale,
  MotionScale,
  ScaleTokens,
  ShapeScale,
} from "./types.js";

const SHAPE_RADII_MAP: Record<ShapeScale, ScaleTokens["radii"]> = {
  sharp: {
    sm: "0.125rem",
    md: "0.25rem",
    lg: "0.25rem",
    xl: "0.375rem",
    "2xl": "0.5rem",
    full: "9999px",
    field: "0.25rem",
    button: "0.25rem",
  },
  default: {
    sm: "0.375rem",
    md: "0.5rem",
    lg: "0.75rem",
    xl: "1rem",
    "2xl": "1.25rem",
    full: "9999px",
    field: "0.75rem",
    button: "0.75rem",
  },
  round: {
    sm: "0.5rem",
    md: "0.75rem",
    lg: "1rem",
    xl: "1.5rem",
    "2xl": "1.75rem",
    full: "9999px",
    field: "1rem",
    button: "9999px",
  },
};

const DENSITY_VARS_MAP: Record<DensityScale, ScaleTokens["densityVars"]> = {
  compact: {
    controlHeightDefault: "2.25rem",
    controlHeightTouch: "2.75rem",
    rowMinHeight: "3rem",
    spaceUnit: "0.2rem",
  },
  default: {
    controlHeightDefault: "2.5rem",
    controlHeightTouch: "2.75rem",
    rowMinHeight: "3.5rem",
    spaceUnit: "0.25rem",
  },
  comfortable: {
    controlHeightDefault: "2.75rem",
    controlHeightTouch: "3rem",
    rowMinHeight: "4rem",
    spaceUnit: "0.3125rem",
  },
};

const MOTION_VARS_MAP: Record<MotionScale, ScaleTokens["motionVars"]> = {
  reduced: {
    duration: "0ms",
    durationSlow: "0ms",
    ease: "linear",
    press: "none",
  },
  standard: {
    duration: "150ms",
    durationSlow: "250ms",
    ease: "cubic-bezier(0.16, 1, 0.3, 1)",
    press: "scale(0.98)",
  },
  expressive: {
    duration: "220ms",
    durationSlow: "350ms",
    ease: "cubic-bezier(0.2, 0, 0, 1)",
    press: "scale(0.96)",
  },
};

export function resolveScaleTokens(options: {
  shape: ShapeScale;
  density: DensityScale;
  motion: MotionScale;
}): ScaleTokens {
  return {
    shape: options.shape,
    density: options.density,
    motion: options.motion,
    radii: SHAPE_RADII_MAP[options.shape],
    densityVars: DENSITY_VARS_MAP[options.density],
    motionVars: MOTION_VARS_MAP[options.motion],
  };
}

export function scaleTokensToCssVars(
  scale: ScaleTokens,
): Record<string, string> {
  return {
    "--radius-sm": scale.radii.sm,
    "--radius-md": scale.radii.md,
    "--radius-lg": scale.radii.lg,
    "--radius-xl": scale.radii.xl,
    "--radius-2xl": scale.radii["2xl"],
    "--radius-full": scale.radii.full,
    "--md-sys-shape-field": scale.radii.field,
    "--md-sys-shape-button": scale.radii.button,
    "--md-sys-density-control-default": scale.densityVars.controlHeightDefault,
    "--md-sys-density-control-touch": scale.densityVars.controlHeightTouch,
    "--md-sys-density-row-min-height": scale.densityVars.rowMinHeight,
    "--md-sys-density-space-unit": scale.densityVars.spaceUnit,
    "--md-sys-motion-duration": scale.motionVars.duration,
    "--md-sys-motion-duration-slow": scale.motionVars.durationSlow,
    "--md-sys-motion-ease": scale.motionVars.ease,
    "--md-sys-motion-press": scale.motionVars.press,
  };
}

import type { M3ColorRoles, ScaleTokens, TokenColorScheme } from "./types.js";

/**
 * Complete list of shadcn + Orbit kit semantic CSS variable names (without `--`).
 * Must stay backwards-compatible with v1 `semantic.css`.
 */
export const SHADCN_SEMANTIC_VAR_NAMES = [
  "background",
  "foreground",
  "card",
  "card-foreground",
  "popover",
  "popover-foreground",
  "primary",
  "primary-foreground",
  "secondary",
  "secondary-foreground",
  "muted",
  "muted-foreground",
  "accent",
  "accent-foreground",
  "destructive",
  "destructive-foreground",
  "border",
  "input",
  "ring",
  "chart-1",
  "chart-2",
  "chart-3",
  "chart-4",
  "chart-5",
  "radius",
  "sidebar",
  "sidebar-foreground",
  "sidebar-primary",
  "sidebar-primary-foreground",
  "sidebar-accent",
  "sidebar-accent-foreground",
  "sidebar-border",
  "sidebar-ring",
  "surface-sunken",
  "status-success",
  "status-success-foreground",
  "status-warning",
  "status-warning-foreground",
  "status-danger",
  "status-danger-foreground",
  "press",
  "color-brand",
  "color-brand-foreground",
  "rounded-field",
  "border-line-field",
  "bg-field",
  "motion",
  "ease-motion",
  "primary-hover",
  "secondary-hover",
  "destructive-hover",
  "accent-hover",
  "muted-hover",
] as const;

const M3_ROLE_TO_CSS_VAR: ReadonlyArray<[keyof M3ColorRoles, string]> = [
  ["primary", "--md-sys-color-primary"],
  ["onPrimary", "--md-sys-color-on-primary"],
  ["primaryContainer", "--md-sys-color-primary-container"],
  ["onPrimaryContainer", "--md-sys-color-on-primary-container"],
  ["inversePrimary", "--md-sys-color-inverse-primary"],
  ["secondary", "--md-sys-color-secondary"],
  ["onSecondary", "--md-sys-color-on-secondary"],
  ["secondaryContainer", "--md-sys-color-secondary-container"],
  ["onSecondaryContainer", "--md-sys-color-on-secondary-container"],
  ["tertiary", "--md-sys-color-tertiary"],
  ["onTertiary", "--md-sys-color-on-tertiary"],
  ["tertiaryContainer", "--md-sys-color-tertiary-container"],
  ["onTertiaryContainer", "--md-sys-color-on-tertiary-container"],
  ["error", "--md-sys-color-error"],
  ["onError", "--md-sys-color-on-error"],
  ["errorContainer", "--md-sys-color-error-container"],
  ["onErrorContainer", "--md-sys-color-on-error-container"],
  ["background", "--md-sys-color-background"],
  ["onBackground", "--md-sys-color-on-background"],
  ["surface", "--md-sys-color-surface"],
  ["onSurface", "--md-sys-color-on-surface"],
  ["surfaceVariant", "--md-sys-color-surface-variant"],
  ["onSurfaceVariant", "--md-sys-color-on-surface-variant"],
  ["surfaceDim", "--md-sys-color-surface-dim"],
  ["surfaceBright", "--md-sys-color-surface-bright"],
  ["surfaceContainerLowest", "--md-sys-color-surface-container-lowest"],
  ["surfaceContainerLow", "--md-sys-color-surface-container-low"],
  ["surfaceContainer", "--md-sys-color-surface-container"],
  ["surfaceContainerHigh", "--md-sys-color-surface-container-high"],
  ["surfaceContainerHighest", "--md-sys-color-surface-container-highest"],
  ["inverseSurface", "--md-sys-color-inverse-surface"],
  ["inverseOnSurface", "--md-sys-color-inverse-on-surface"],
  ["outline", "--md-sys-color-outline"],
  ["outlineVariant", "--md-sys-color-outline-variant"],
  ["shadow", "--md-sys-color-shadow"],
  ["scrim", "--md-sys-color-scrim"],
  ["surfaceTint", "--md-sys-color-surface-tint"],
  ["success", "--md-sys-color-success"],
  ["onSuccess", "--md-sys-color-on-success"],
  ["successContainer", "--md-sys-color-success-container"],
  ["onSuccessContainer", "--md-sys-color-on-success-container"],
  ["warning", "--md-sys-color-warning"],
  ["onWarning", "--md-sys-color-on-warning"],
  ["warningContainer", "--md-sys-color-warning-container"],
  ["onWarningContainer", "--md-sys-color-on-warning-container"],
  ["primaryHover", "--md-sys-color-primary-hover"],
  ["secondaryContainerHover", "--md-sys-color-secondary-container-hover"],
  ["errorHover", "--md-sys-color-error-hover"],
  ["surfaceContainerHover", "--md-sys-color-surface-container-hover"],
  ["chart1", "--md-sys-color-chart-1"],
  ["chart2", "--md-sys-color-chart-2"],
  ["chart3", "--md-sys-color-chart-3"],
  ["chart4", "--md-sys-color-chart-4"],
  ["chart5", "--md-sys-color-chart-5"],
];

export function m3RolesToCssVars(m3: M3ColorRoles): Record<string, string> {
  const vars: Record<string, string> = {};
  for (const [key, cssName] of M3_ROLE_TO_CSS_VAR) {
    vars[cssName] = m3[key];
  }
  return vars;
}

/** Resolved hex/value map for every shadcn/kit semantic key (used for WCAG verification and email/PDF hex export). */
export function resolveSemanticHexMap(
  m3: M3ColorRoles,
  scale: ScaleTokens,
  scheme: TokenColorScheme,
): Record<string, string> {
  const card =
    scheme === "dark" ? m3.surfaceContainerLow : m3.surfaceContainerLowest;
  const popover =
    scheme === "dark" ? m3.surfaceContainer : m3.surfaceContainerLowest;
  const sunken =
    scheme === "dark" ? m3.surfaceContainerLowest : m3.surfaceContainerLow;

  return {
    background: m3.background,
    foreground: m3.onBackground,
    card,
    "card-foreground": m3.onSurface,
    popover,
    "popover-foreground": m3.onSurface,
    primary: m3.primary,
    "primary-foreground": m3.onPrimary,
    secondary: m3.secondaryContainer,
    "secondary-foreground": m3.onSecondaryContainer,
    muted: m3.surfaceContainer,
    "muted-foreground": m3.onSurfaceVariant,
    accent: m3.secondaryContainer,
    "accent-foreground": m3.onSecondaryContainer,
    destructive: m3.error,
    "destructive-foreground": m3.onError,
    border: m3.outlineVariant,
    input: m3.outline,
    ring: m3.primary,
    "chart-1": m3.chart1,
    "chart-2": m3.chart2,
    "chart-3": m3.chart3,
    "chart-4": m3.chart4,
    "chart-5": m3.chart5,
    radius: scale.radii.lg,
    sidebar: m3.surfaceContainerLow,
    "sidebar-foreground": m3.onSurface,
    "sidebar-primary": m3.primary,
    "sidebar-primary-foreground": m3.onPrimary,
    "sidebar-accent": m3.secondaryContainer,
    "sidebar-accent-foreground": m3.onSecondaryContainer,
    "sidebar-border": m3.outlineVariant,
    "sidebar-ring": m3.primary,
    "surface-sunken": sunken,
    "status-success": m3.success,
    "status-success-foreground": m3.onSuccess,
    "status-warning": m3.warning,
    "status-warning-foreground": m3.onWarning,
    "status-danger": m3.error,
    "status-danger-foreground": m3.onError,
    press: scale.motionVars.press,
    "color-brand": m3.primary,
    "color-brand-foreground": m3.onPrimary,
    "rounded-field": scale.radii.field,
    "border-line-field": "1px",
    "bg-field": card,
    motion: scale.motionVars.duration,
    "ease-motion": scale.motionVars.ease,
    "primary-hover": m3.primaryHover,
    "secondary-hover": m3.secondaryContainerHover,
    "destructive-hover": m3.errorHover,
    "accent-hover": m3.secondaryContainerHover,
    "muted-hover": m3.surfaceContainerHover,
  };
}

/**
 * Shadcn & kit aliases mapped to canonical `--md-sys-color-*` CSS variables.
 */
export function buildShadcnAliasCssVars(
  scheme: TokenColorScheme,
): Record<string, string> {
  const cardVar =
    scheme === "dark"
      ? "var(--md-sys-color-surface-container-low)"
      : "var(--md-sys-color-surface-container-lowest)";
  const popoverVar =
    scheme === "dark"
      ? "var(--md-sys-color-surface-container)"
      : "var(--md-sys-color-surface-container-lowest)";
  const sunkenVar =
    scheme === "dark"
      ? "var(--md-sys-color-surface-container-lowest)"
      : "var(--md-sys-color-surface-container-low)";

  return {
    "--background": "var(--md-sys-color-background)",
    "--foreground": "var(--md-sys-color-on-background)",
    "--card": cardVar,
    "--card-foreground": "var(--md-sys-color-on-surface)",
    "--popover": popoverVar,
    "--popover-foreground": "var(--md-sys-color-on-surface)",
    "--primary": "var(--md-sys-color-primary)",
    "--primary-foreground": "var(--md-sys-color-on-primary)",
    "--secondary": "var(--md-sys-color-secondary-container)",
    "--secondary-foreground": "var(--md-sys-color-on-secondary-container)",
    "--muted": "var(--md-sys-color-surface-container)",
    "--muted-foreground": "var(--md-sys-color-on-surface-variant)",
    "--accent": "var(--md-sys-color-secondary-container)",
    "--accent-foreground": "var(--md-sys-color-on-secondary-container)",
    "--destructive": "var(--md-sys-color-error)",
    "--destructive-foreground": "var(--md-sys-color-on-error)",
    "--border": "var(--md-sys-color-outline-variant)",
    "--input": "var(--md-sys-color-outline)",
    "--ring": "var(--md-sys-color-primary)",
    "--chart-1": "var(--md-sys-color-chart-1)",
    "--chart-2": "var(--md-sys-color-chart-2)",
    "--chart-3": "var(--md-sys-color-chart-3)",
    "--chart-4": "var(--md-sys-color-chart-4)",
    "--chart-5": "var(--md-sys-color-chart-5)",
    "--radius": "var(--radius-lg)",
    "--sidebar": "var(--md-sys-color-surface-container-low)",
    "--sidebar-foreground": "var(--md-sys-color-on-surface)",
    "--sidebar-primary": "var(--md-sys-color-primary)",
    "--sidebar-primary-foreground": "var(--md-sys-color-on-primary)",
    "--sidebar-accent": "var(--md-sys-color-secondary-container)",
    "--sidebar-accent-foreground": "var(--md-sys-color-on-secondary-container)",
    "--sidebar-border": "var(--md-sys-color-outline-variant)",
    "--sidebar-ring": "var(--md-sys-color-primary)",
    "--surface-sunken": sunkenVar,
    "--status-success": "var(--md-sys-color-success)",
    "--status-success-foreground": "var(--md-sys-color-on-success)",
    "--status-warning": "var(--md-sys-color-warning)",
    "--status-warning-foreground": "var(--md-sys-color-on-warning)",
    "--status-danger": "var(--md-sys-color-error)",
    "--status-danger-foreground": "var(--md-sys-color-on-error)",
    "--press": "var(--md-sys-motion-press, scale(0.98))",
    "--color-brand": "var(--md-sys-color-primary)",
    "--color-brand-foreground": "var(--md-sys-color-on-primary)",
    "--rounded-field": "var(--md-sys-shape-field, var(--radius-lg))",
    "--border-line-field": "1px",
    "--bg-field": cardVar,
    "--motion": "var(--md-sys-motion-duration, 150ms)",
    "--ease-motion": "var(--md-sys-motion-ease, cubic-bezier(0.16, 1, 0.3, 1))",
    "--primary-hover": "var(--md-sys-color-primary-hover)",
    "--secondary-hover": "var(--md-sys-color-secondary-container-hover)",
    "--destructive-hover": "var(--md-sys-color-error-hover)",
    "--accent-hover": "var(--md-sys-color-secondary-container-hover)",
    "--muted-hover": "var(--md-sys-color-surface-container-hover)",
  };
}

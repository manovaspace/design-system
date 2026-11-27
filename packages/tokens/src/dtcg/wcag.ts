import type { ContrastLevel, M3ColorRoles, TokenColorScheme } from "./types.js";

export type ContrastTargetLevel = "text" | "ui";

export type ContrastCheckPair = {
  pair: string;
  foreground: string;
  background: string;
  level: ContrastTargetLevel;
  minRatio?: number;
  scheme?: TokenColorScheme;
  contrast?: ContrastLevel;
};

export type ContrastViolation = {
  pair: string;
  foreground: string;
  background: string;
  ratio: number;
  required: number;
  level: ContrastTargetLevel;
  scheme?: TokenColorScheme;
  contrast?: ContrastLevel;
};

export class TokenContrastError extends Error {
  readonly code = "WCAG_CONTRAST_VIOLATION" as const;
  readonly violations: ContrastViolation[];

  constructor(violations: ContrastViolation[]) {
    const first = violations[0];
    const summary = first
      ? `WCAG contrast violation on "${first.pair}" (${first.ratio.toFixed(2)}:1 < ${first.required}:1)`
      : "WCAG contrast violation";
    super(
      violations.length > 1
        ? `${summary} (+${violations.length - 1} more)`
        : summary,
    );
    this.name = "TokenContrastError";
    this.violations = violations;
  }
}

function parseHexChannels(hex: string): [number, number, number] {
  const clean = hex.trim().replace(/^#/, "");
  const full =
    clean.length === 3
      ? clean
          .split("")
          .map((c) => c + c)
          .join("")
      : clean.slice(0, 6);
  const num = Number.parseInt(full, 16);
  if (Number.isNaN(num)) {
    throw new Error(`Invalid hex color for contrast check: ${hex}`);
  }
  return [(num >> 16) & 255, (num >> 8) & 255, num & 255];
}

function linearizeChannel(channel255: number): number {
  const s = channel255 / 255;
  return s <= 0.04045 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
}

/** WCAG 2.1 relative luminance in `[0, 1]`. */
export function relativeLuminance(hex: string): number {
  const [r, g, b] = parseHexChannels(hex);
  return (
    0.2126 * linearizeChannel(r) +
    0.7152 * linearizeChannel(g) +
    0.0722 * linearizeChannel(b)
  );
}

/** WCAG 2.1 contrast ratio in `[1, 21]`. */
export function contrastRatio(
  foregroundHex: string,
  backgroundHex: string,
): number {
  const l1 = relativeLuminance(foregroundHex);
  const l2 = relativeLuminance(backgroundHex);
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  return (lighter + 0.05) / (darker + 0.05);
}

/** Required ratio per WCAG 2.1 AA: 4.5:1 for normal text, 3.0:1 for UI / large text. */
export function minRatioForLevel(level: ContrastTargetLevel): number {
  return level === "text" ? 4.5 : 3.0;
}

/** Assert every declared pair meets its WCAG target, throwing `TokenContrastError` on any violation. */
export function assertWcagContrast(pairs: readonly ContrastCheckPair[]): void {
  const violations: ContrastViolation[] = [];

  for (const item of pairs) {
    const required = item.minRatio ?? minRatioForLevel(item.level);
    const ratio = contrastRatio(item.foreground, item.background);
    if (ratio + 1e-6 < required) {
      violations.push({
        pair: item.pair,
        foreground: item.foreground,
        background: item.background,
        ratio,
        required,
        level: item.level,
        scheme: item.scheme,
        contrast: item.contrast,
      });
    }
  }

  if (violations.length > 0) {
    throw new TokenContrastError(violations);
  }
}

/** Build the full M3 + shadcn + chart + status WCAG verification pair list for one scheme/contrast. */
export function buildSchemeContrastPairs(
  m3: M3ColorRoles,
  semanticHex: Record<string, string>,
  meta: { scheme: TokenColorScheme; contrast: ContrastLevel },
): ContrastCheckPair[] {
  const { scheme, contrast } = meta;
  const card = semanticHex.card ?? m3.surfaceContainerLowest;
  const muted = semanticHex.muted ?? m3.surfaceContainer;
  const popover = semanticHex.popover ?? m3.surfaceContainerLow;

  const pairs: ContrastCheckPair[] = [
    // M3 text pairs (>= 4.5:1)
    {
      pair: "onPrimary / primary",
      foreground: m3.onPrimary,
      background: m3.primary,
      level: "text",
      scheme,
      contrast,
    },
    {
      pair: "onPrimaryContainer / primaryContainer",
      foreground: m3.onPrimaryContainer,
      background: m3.primaryContainer,
      level: "text",
      scheme,
      contrast,
    },
    {
      pair: "onSecondary / secondary",
      foreground: m3.onSecondary,
      background: m3.secondary,
      level: "text",
      scheme,
      contrast,
    },
    {
      pair: "onSecondaryContainer / secondaryContainer",
      foreground: m3.onSecondaryContainer,
      background: m3.secondaryContainer,
      level: "text",
      scheme,
      contrast,
    },
    {
      pair: "onTertiary / tertiary",
      foreground: m3.onTertiary,
      background: m3.tertiary,
      level: "text",
      scheme,
      contrast,
    },
    {
      pair: "onTertiaryContainer / tertiaryContainer",
      foreground: m3.onTertiaryContainer,
      background: m3.tertiaryContainer,
      level: "text",
      scheme,
      contrast,
    },
    {
      pair: "onError / error",
      foreground: m3.onError,
      background: m3.error,
      level: "text",
      scheme,
      contrast,
    },
    {
      pair: "onErrorContainer / errorContainer",
      foreground: m3.onErrorContainer,
      background: m3.errorContainer,
      level: "text",
      scheme,
      contrast,
    },
    {
      pair: "onBackground / background",
      foreground: m3.onBackground,
      background: m3.background,
      level: "text",
      scheme,
      contrast,
    },
    {
      pair: "onSurface / surface",
      foreground: m3.onSurface,
      background: m3.surface,
      level: "text",
      scheme,
      contrast,
    },
    {
      pair: "onSurface / surfaceContainerLowest",
      foreground: m3.onSurface,
      background: m3.surfaceContainerLowest,
      level: "text",
      scheme,
      contrast,
    },
    {
      pair: "onSurface / surfaceContainerLow",
      foreground: m3.onSurface,
      background: m3.surfaceContainerLow,
      level: "text",
      scheme,
      contrast,
    },
    {
      pair: "onSurface / surfaceContainer",
      foreground: m3.onSurface,
      background: m3.surfaceContainer,
      level: "text",
      scheme,
      contrast,
    },
    {
      pair: "onSurface / surfaceContainerHigh",
      foreground: m3.onSurface,
      background: m3.surfaceContainerHigh,
      level: "text",
      scheme,
      contrast,
    },
    {
      pair: "onSurface / surfaceContainerHighest",
      foreground: m3.onSurface,
      background: m3.surfaceContainerHighest,
      level: "text",
      scheme,
      contrast,
    },
    {
      pair: "onSurfaceVariant / surface",
      foreground: m3.onSurfaceVariant,
      background: m3.surface,
      level: "text",
      scheme,
      contrast,
    },
    {
      pair: "onSurfaceVariant / surfaceContainer",
      foreground: m3.onSurfaceVariant,
      background: m3.surfaceContainer,
      level: "text",
      scheme,
      contrast,
    },
    {
      pair: "inverseOnSurface / inverseSurface",
      foreground: m3.inverseOnSurface,
      background: m3.inverseSurface,
      level: "text",
      scheme,
      contrast,
    },
    {
      pair: "onSuccess / success",
      foreground: m3.onSuccess,
      background: m3.success,
      level: "text",
      scheme,
      contrast,
    },
    {
      pair: "onSuccessContainer / successContainer",
      foreground: m3.onSuccessContainer,
      background: m3.successContainer,
      level: "text",
      scheme,
      contrast,
    },
    {
      pair: "onWarning / warning",
      foreground: m3.onWarning,
      background: m3.warning,
      level: "text",
      scheme,
      contrast,
    },
    {
      pair: "onWarningContainer / warningContainer",
      foreground: m3.onWarningContainer,
      background: m3.warningContainer,
      level: "text",
      scheme,
      contrast,
    },

    // Shadcn & kit text pairs (>= 4.5:1)
    {
      pair: "foreground / background",
      foreground: semanticHex.foreground ?? m3.onBackground,
      background: semanticHex.background ?? m3.background,
      level: "text",
      scheme,
      contrast,
    },
    {
      pair: "card-foreground / card",
      foreground: semanticHex["card-foreground"] ?? m3.onSurface,
      background: card,
      level: "text",
      scheme,
      contrast,
    },
    {
      pair: "popover-foreground / popover",
      foreground: semanticHex["popover-foreground"] ?? m3.onSurface,
      background: popover,
      level: "text",
      scheme,
      contrast,
    },
    {
      pair: "primary-foreground / primary",
      foreground: semanticHex["primary-foreground"] ?? m3.onPrimary,
      background: semanticHex.primary ?? m3.primary,
      level: "text",
      scheme,
      contrast,
    },
    {
      pair: "secondary-foreground / secondary",
      foreground:
        semanticHex["secondary-foreground"] ?? m3.onSecondaryContainer,
      background: semanticHex.secondary ?? m3.secondaryContainer,
      level: "text",
      scheme,
      contrast,
    },
    {
      pair: "muted-foreground / muted",
      foreground: semanticHex["muted-foreground"] ?? m3.onSurfaceVariant,
      background: muted,
      level: "text",
      scheme,
      contrast,
    },
    {
      pair: "accent-foreground / accent",
      foreground: semanticHex["accent-foreground"] ?? m3.onSecondaryContainer,
      background: semanticHex.accent ?? m3.secondaryContainer,
      level: "text",
      scheme,
      contrast,
    },
    {
      pair: "sidebar-foreground / sidebar",
      foreground: semanticHex["sidebar-foreground"] ?? m3.onSurface,
      background: semanticHex.sidebar ?? m3.surfaceContainerLow,
      level: "text",
      scheme,
      contrast,
    },
    {
      pair: "status-warning / card",
      foreground: m3.warning,
      background: card,
      level: "text",
      scheme,
      contrast,
    },
    {
      pair: "status-success / card",
      foreground: m3.success,
      background: card,
      level: "text",
      scheme,
      contrast,
    },

    // UI & graphical elements (>= 3.0:1)
    {
      pair: "primary / background",
      foreground: m3.primary,
      background: m3.background,
      level: "ui",
      scheme,
      contrast,
    },
    {
      pair: "primary / card",
      foreground: m3.primary,
      background: card,
      level: "ui",
      scheme,
      contrast,
    },
    {
      pair: "error / background",
      foreground: m3.error,
      background: m3.background,
      level: "ui",
      scheme,
      contrast,
    },
    {
      pair: "error / card",
      foreground: m3.error,
      background: card,
      level: "ui",
      scheme,
      contrast,
    },
    {
      pair: "outline / background",
      foreground: m3.outline,
      background: m3.background,
      level: "ui",
      scheme,
      contrast,
    },
    {
      pair: "outline / card",
      foreground: m3.outline,
      background: card,
      level: "ui",
      scheme,
      contrast,
    },
    {
      pair: "chart-1 / card",
      foreground: m3.chart1,
      background: card,
      level: "ui",
      scheme,
      contrast,
    },
    {
      pair: "chart-2 / card",
      foreground: m3.chart2,
      background: card,
      level: "ui",
      scheme,
      contrast,
    },
    {
      pair: "chart-3 / card",
      foreground: m3.chart3,
      background: card,
      level: "ui",
      scheme,
      contrast,
    },
    {
      pair: "chart-4 / card",
      foreground: m3.chart4,
      background: card,
      level: "ui",
      scheme,
      contrast,
    },
    {
      pair: "chart-5 / card",
      foreground: m3.chart5,
      background: card,
      level: "ui",
      scheme,
      contrast,
    },
  ];

  return pairs;
}

export function verifyResolvedSchemeContrast(
  m3: M3ColorRoles,
  semanticHex: Record<string, string>,
  meta: { scheme: TokenColorScheme; contrast: ContrastLevel },
): void {
  assertWcagContrast(buildSchemeContrastPairs(m3, semanticHex, meta));
}

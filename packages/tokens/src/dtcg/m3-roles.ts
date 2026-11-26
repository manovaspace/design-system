import {
  Contrast,
  type DynamicColor,
  DynamicScheme,
  Hct,
  hexFromArgb,
  MaterialDynamicColors,
  SchemeTonalSpot,
  type TonalPalette,
} from "@material/material-color-utilities";
import { type BrandTonalPalettes, buildChartPalette } from "./hct-palette.js";
import type { ContrastLevel, M3ColorRoles } from "./types.js";

export const CONTRAST_LEVEL_NUMBER: Record<ContrastLevel, number> = {
  standard: 0,
  medium: 0.5,
  high: 1,
};

function deriveStatusFamily(
  palette: TonalPalette,
  surfaceHex: string,
  isDark: boolean,
  contrast: ContrastLevel,
): {
  role: string;
  onRole: string;
  container: string;
  onContainer: string;
} {
  const surfaceTone = Hct.fromInt(
    Number.parseInt(`ff${surfaceHex.slice(1)}`, 16) >>> 0,
  ).tone;

  const minUi = contrast === "high" ? 7 : contrast === "medium" ? 5 : 4.5;
  let roleTone = isDark ? 80 : 40;
  if (Contrast.ratioOfTones(roleTone, surfaceTone) < minUi) {
    roleTone = isDark
      ? Contrast.lighterUnsafe(surfaceTone, minUi)
      : Contrast.darkerUnsafe(surfaceTone, minUi);
  }
  const onRoleTone = isDark ? 20 : 100;
  const safeOnRoleTone =
    Contrast.ratioOfTones(onRoleTone, roleTone) >= 4.5
      ? onRoleTone
      : isDark
        ? Contrast.darkerUnsafe(roleTone, 4.5)
        : Contrast.lighterUnsafe(roleTone, 4.5);

  const containerTone = isDark ? 30 : 90;
  const onContainerTone = isDark
    ? 90
    : Contrast.ratioOfTones(10, containerTone) >= 7
      ? 10
      : Contrast.darkerUnsafe(containerTone, 7);

  return {
    role: hexFromArgb(palette.tone(roleTone)).toLowerCase(),
    onRole: hexFromArgb(palette.tone(safeOnRoleTone)).toLowerCase(),
    container: hexFromArgb(palette.tone(containerTone)).toLowerCase(),
    onContainer: hexFromArgb(palette.tone(onContainerTone)).toLowerCase(),
  };
}

function shiftToneForHover(hex: string, isDark: boolean, delta = 8): string {
  const argb = Number.parseInt(`ff${hex.slice(1)}`, 16) >>> 0;
  const hct = Hct.fromInt(argb);
  const nextTone = isDark
    ? Math.min(100, hct.tone + delta)
    : Math.max(0, hct.tone - delta);
  return hexFromArgb(
    Hct.from(hct.hue, hct.chroma, nextTone).toInt(),
  ).toLowerCase();
}

/**
 * Derive Material 3 system color roles for `(isDark, contrast)` via `@material/material-color-utilities`.
 */
export function deriveM3SchemeRoles(
  palettes: BrandTonalPalettes,
  options: { isDark: boolean; contrast: ContrastLevel },
): M3ColorRoles {
  const { isDark, contrast } = options;
  const tonalSpotVariant = new SchemeTonalSpot(
    palettes.sourceHct,
    isDark,
    CONTRAST_LEVEL_NUMBER[contrast],
  ).variant;
  const scheme = new DynamicScheme({
    sourceColorArgb: palettes.sourceArgb,
    variant: tonalSpotVariant,
    contrastLevel: CONTRAST_LEVEL_NUMBER[contrast],
    isDark,
    primaryPalette: palettes.primary,
    secondaryPalette: palettes.secondary,
    tertiaryPalette: palettes.tertiary,
    neutralPalette: palettes.neutral,
    neutralVariantPalette: palettes.neutralVariant,
  });
  scheme.errorPalette = palettes.error;

  const hex = (color: DynamicColor) =>
    hexFromArgb(color.getArgb(scheme)).toLowerCase();

  const surface = hex(MaterialDynamicColors.surface);
  const surfaceContainerLowest = hex(
    MaterialDynamicColors.surfaceContainerLowest,
  );
  const surfaceContainerLow = hex(MaterialDynamicColors.surfaceContainerLow);
  const surfaceContainer = hex(MaterialDynamicColors.surfaceContainer);
  const primary = hex(MaterialDynamicColors.primary);
  const secondaryContainer = hex(MaterialDynamicColors.secondaryContainer);
  const error = hex(MaterialDynamicColors.error);

  const cardSurface = isDark ? surfaceContainerLow : surfaceContainerLowest;
  const success = deriveStatusFamily(
    palettes.success,
    cardSurface,
    isDark,
    contrast,
  );
  const warning = deriveStatusFamily(
    palettes.warning,
    cardSurface,
    isDark,
    contrast,
  );

  const [chart1, chart2, chart3, chart4, chart5] = buildChartPalette(
    primary,
    surface,
    cardSurface,
    isDark,
    contrast,
  );

  return {
    primary,
    onPrimary: hex(MaterialDynamicColors.onPrimary),
    primaryContainer: hex(MaterialDynamicColors.primaryContainer),
    onPrimaryContainer: hex(MaterialDynamicColors.onPrimaryContainer),
    inversePrimary: hex(MaterialDynamicColors.inversePrimary),
    secondary: hex(MaterialDynamicColors.secondary),
    onSecondary: hex(MaterialDynamicColors.onSecondary),
    secondaryContainer,
    onSecondaryContainer: hex(MaterialDynamicColors.onSecondaryContainer),
    tertiary: hex(MaterialDynamicColors.tertiary),
    onTertiary: hex(MaterialDynamicColors.onTertiary),
    tertiaryContainer: hex(MaterialDynamicColors.tertiaryContainer),
    onTertiaryContainer: hex(MaterialDynamicColors.onTertiaryContainer),
    error,
    onError: hex(MaterialDynamicColors.onError),
    errorContainer: hex(MaterialDynamicColors.errorContainer),
    onErrorContainer: hex(MaterialDynamicColors.onErrorContainer),
    background: hex(MaterialDynamicColors.background),
    onBackground: hex(MaterialDynamicColors.onBackground),
    surface,
    onSurface: hex(MaterialDynamicColors.onSurface),
    surfaceVariant: hex(MaterialDynamicColors.surfaceVariant),
    onSurfaceVariant: hex(MaterialDynamicColors.onSurfaceVariant),
    surfaceDim: hex(MaterialDynamicColors.surfaceDim),
    surfaceBright: hex(MaterialDynamicColors.surfaceBright),
    surfaceContainerLowest,
    surfaceContainerLow,
    surfaceContainer,
    surfaceContainerHigh: hex(MaterialDynamicColors.surfaceContainerHigh),
    surfaceContainerHighest: hex(MaterialDynamicColors.surfaceContainerHighest),
    inverseSurface: hex(MaterialDynamicColors.inverseSurface),
    inverseOnSurface: hex(MaterialDynamicColors.inverseOnSurface),
    outline: hex(MaterialDynamicColors.outline),
    outlineVariant: hex(MaterialDynamicColors.outlineVariant),
    shadow: hex(MaterialDynamicColors.shadow),
    scrim: hex(MaterialDynamicColors.scrim),
    surfaceTint: hex(MaterialDynamicColors.surfaceTint),
    success: success.role,
    onSuccess: success.onRole,
    successContainer: success.container,
    onSuccessContainer: success.onContainer,
    warning: warning.role,
    onWarning: warning.onRole,
    warningContainer: warning.container,
    onWarningContainer: warning.onContainer,
    primaryHover: shiftToneForHover(primary, isDark, 8),
    secondaryContainerHover: shiftToneForHover(secondaryContainer, isDark, 8),
    errorHover: shiftToneForHover(error, isDark, 8),
    surfaceContainerHover: shiftToneForHover(surfaceContainer, isDark, 5),
    chart1,
    chart2,
    chart3,
    chart4,
    chart5,
  };
}

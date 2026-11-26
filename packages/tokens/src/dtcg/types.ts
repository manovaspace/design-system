/**
 * DTCG 2025.10 & Material 3 HCT token pipeline types.
 */

export type ContrastLevel = "standard" | "medium" | "high";
export type ShapeScale = "sharp" | "default" | "round";
export type DensityScale = "compact" | "default" | "comfortable";
export type MotionScale = "reduced" | "standard" | "expressive";
export type TokenColorScheme = "light" | "dark";

export type DtcgColorValue = {
  colorSpace: "srgb";
  components: [number, number, number];
  alpha?: number;
  hex?: string;
};

export type DtcgTokenType =
  | "color"
  | "dimension"
  | "fontFamily"
  | "number"
  | "duration"
  | "cubicBezier"
  | "shadow"
  | "string";

export type DtcgToken<T = unknown> = {
  $value: T;
  $type?: DtcgTokenType;
  $description?: string;
  $extensions?: Record<string, unknown>;
};

export interface DtcgGroup {
  $type?: DtcgTokenType;
  $description?: string;
  $extensions?: Record<string, unknown>;
  [key: string]: unknown;
}

export type DtcgResolverModifier = {
  description?: string;
  default: string;
  contexts: Record<string, Record<string, unknown>>;
};

export type DtcgResolver = {
  version: "2025.10";
  sets: Record<string, string>;
  modifiers: {
    colorScheme: DtcgResolverModifier;
    contrast: DtcgResolverModifier;
  };
  resolutionOrder: Array<string | { modifier: string }>;
};

export type DtcgDocument = {
  $schema?: string;
  $description?: string;
  $extensions?: Record<string, unknown>;
  ref: DtcgGroup;
  sys: DtcgGroup;
  comp: DtcgGroup;
  resolver: DtcgResolver;
  themes?: Record<string, unknown>;
};

export type BrandTokensSeed = {
  primary: string;
  secondary?: string;
  tertiary?: string;
  neutral?: string;
  error?: string;
};

export type BrandTokensFont = {
  sans?: string;
  data?: string;
};

export type BrandTokensInput = {
  $schema?: string;
  $description?: string;
  seed: {
    primary: string | DtcgColorValue | DtcgToken<string | DtcgColorValue>;
    secondary?: string | DtcgColorValue | DtcgToken<string | DtcgColorValue>;
    tertiary?: string | DtcgColorValue | DtcgToken<string | DtcgColorValue>;
    neutral?: string | DtcgColorValue | DtcgToken<string | DtcgColorValue>;
    error?: string | DtcgColorValue | DtcgToken<string | DtcgColorValue>;
  };
  font?: {
    sans?: string | string[] | DtcgToken<string | string[]>;
    data?: string | string[] | DtcgToken<string | string[]>;
  };
  shape?: ShapeScale | DtcgToken<ShapeScale>;
  density?: DensityScale | DtcgToken<DensityScale>;
  motion?: MotionScale | DtcgToken<MotionScale>;
  contrast?: ContrastLevel | DtcgToken<ContrastLevel>;
};

export type BrandTokensConfig = {
  seed: BrandTokensSeed;
  font: {
    sans: string;
    data: string;
  };
  shape: ShapeScale;
  density: DensityScale;
  motion: MotionScale;
  contrast: ContrastLevel;
};

export type TenantSeedInput = {
  $schema?: string;
  $description?: string;
  seed: {
    primary: string | DtcgColorValue | DtcgToken<string | DtcgColorValue>;
  };
  logo?: string | DtcgToken<string>;
};

export type TenantSeedConfig = {
  seed: {
    primary: string;
  };
  logo?: string;
};

export type M3ColorRoles = {
  primary: string;
  onPrimary: string;
  primaryContainer: string;
  onPrimaryContainer: string;
  inversePrimary: string;
  secondary: string;
  onSecondary: string;
  secondaryContainer: string;
  onSecondaryContainer: string;
  tertiary: string;
  onTertiary: string;
  tertiaryContainer: string;
  onTertiaryContainer: string;
  error: string;
  onError: string;
  errorContainer: string;
  onErrorContainer: string;
  background: string;
  onBackground: string;
  surface: string;
  onSurface: string;
  surfaceVariant: string;
  onSurfaceVariant: string;
  surfaceDim: string;
  surfaceBright: string;
  surfaceContainerLowest: string;
  surfaceContainerLow: string;
  surfaceContainer: string;
  surfaceContainerHigh: string;
  surfaceContainerHighest: string;
  inverseSurface: string;
  inverseOnSurface: string;
  outline: string;
  outlineVariant: string;
  shadow: string;
  scrim: string;
  surfaceTint: string;
  success: string;
  onSuccess: string;
  successContainer: string;
  onSuccessContainer: string;
  warning: string;
  onWarning: string;
  warningContainer: string;
  onWarningContainer: string;
  primaryHover: string;
  secondaryContainerHover: string;
  errorHover: string;
  surfaceContainerHover: string;
  chart1: string;
  chart2: string;
  chart3: string;
  chart4: string;
  chart5: string;
};

export type M3StateLayers = {
  hoverOpacity: number;
  focusOpacity: number;
  pressedOpacity: number;
  draggedOpacity: number;
  disabledContentOpacity: number;
  disabledContainerOpacity: number;
};

export type ScaleTokens = {
  shape: ShapeScale;
  density: DensityScale;
  motion: MotionScale;
  radii: {
    sm: string;
    md: string;
    lg: string;
    xl: string;
    "2xl": string;
    full: string;
    field: string;
    button: string;
  };
  densityVars: {
    controlHeightDefault: string;
    controlHeightTouch: string;
    rowMinHeight: string;
    spaceUnit: string;
  };
  motionVars: {
    duration: string;
    durationSlow: string;
    ease: string;
    press: string;
  };
};

export type ResolvedSchemeTokens = {
  scheme: TokenColorScheme;
  contrast: ContrastLevel;
  m3: M3ColorRoles;
  /** CSS var mapping (canonical `--md-sys-color-*` values as hex). */
  mdSysColorVars: Record<string, string>;
  /** Resolved hex values for all shadcn & kit semantic alias keys (without `--`). */
  semanticHex: Record<string, string>;
  /** CSS values for shadcn & kit aliases (mapped to `var(--md-sys-color-*)` or scale tokens). */
  shadcnAliasVars: Record<string, string>;
};

export type ResolvedBrandTokens = {
  version: 2;
  config: BrandTokensConfig;
  palettes: {
    primary: Record<number, string>;
    secondary: Record<number, string>;
    tertiary: Record<number, string>;
    neutral: Record<number, string>;
    neutralVariant: Record<number, string>;
    error: Record<number, string>;
  };
  stateLayers: M3StateLayers;
  scale: ScaleTokens;
  schemes: {
    light: Record<ContrastLevel, ResolvedSchemeTokens>;
    dark: Record<ContrastLevel, ResolvedSchemeTokens>;
  };
};

export type ResolvedTenantBranding = {
  tenant: TenantSeedConfig;
  resolved: ResolvedBrandTokens;
};

export type FlattenedHexTokens = {
  scheme: TokenColorScheme;
  contrast: ContrastLevel;
  colors: Record<string, string>;
  typography: {
    fontSans: string;
    fontData: string;
  };
  radii: ScaleTokens["radii"];
};

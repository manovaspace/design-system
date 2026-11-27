import { parseBrandTokens, parseTenantSeed } from "./brand-schema.js";
import { CONTRAST_LEVELS, DEFAULT_BRAND_SEEDS } from "./constants.js";
import { buildBrandPalettes, tonalPaletteToRecord } from "./hct-palette.js";
import { deriveM3SchemeRoles } from "./m3-roles.js";
import {
  buildShadcnAliasCssVars,
  m3RolesToCssVars,
  resolveSemanticHexMap,
} from "./m3-to-shadcn-aliases.js";
import { resolveScaleTokens, scaleTokensToCssVars } from "./scale-tokens.js";
import {
  M3_STATE_LAYER_OPACITIES,
  stateLayersToCssVars,
} from "./state-layers.js";
import type {
  BrandTokensConfig,
  BrandTokensInput,
  ContrastLevel,
  FlattenedHexTokens,
  ResolvedBrandTokens,
  ResolvedSchemeTokens,
  ResolvedTenantBranding,
  TenantSeedInput,
  TokenColorScheme,
} from "./types.js";
import { verifyResolvedSchemeContrast } from "./wcag.js";

function resolveOneScheme(
  palettes: ReturnType<typeof buildBrandPalettes>,
  scale: ReturnType<typeof resolveScaleTokens>,
  scheme: TokenColorScheme,
  contrast: ContrastLevel,
): ResolvedSchemeTokens {
  const m3 = deriveM3SchemeRoles(palettes, {
    isDark: scheme === "dark",
    contrast,
  });
  const mdSysColorVars = m3RolesToCssVars(m3);
  const semanticHex = resolveSemanticHexMap(m3, scale, scheme);
  const shadcnAliasVars = buildShadcnAliasCssVars(scheme);

  verifyResolvedSchemeContrast(m3, semanticHex, { scheme, contrast });

  return {
    scheme,
    contrast,
    m3,
    mdSysColorVars,
    semanticHex,
    shadcnAliasVars,
  };
}

/**
 * Run the full M3 HCT DTCG pipeline for a `brand.tokens.json` payload:
 * 1. Validate schema (reject unknown keys)
 * 2. Build HCT tonal palettes via `@material/material-color-utilities`
 * 3. Derive M3 roles across light/dark x standard/medium/high
 * 4. Verify WCAG contrast (4.5:1 text / 3:1 UI; throw `TokenContrastError` on failure)
 * 5. Emit state layers, scale tokens, canonical `--md-sys-color-*`, and shadcn aliases
 */
export function resolveBrandTokens(
  input: BrandTokensInput | unknown,
): ResolvedBrandTokens {
  const config = parseBrandTokens(input);
  return resolveBrandTokensFromConfig(config);
}

const MEMO_MAX_ENTRIES = 64;

/**
 * Bounded memo for pipeline results. Keys are `JSON.stringify` of the normalized
 * input (already validated, so key order is fixed). Eviction drops the oldest
 * inserted entry. Cached results are shared: callers must treat them as immutable.
 */
const resolvedMemo = new Map<string, unknown>();

function memoGet<T>(key: string): T | undefined {
  return resolvedMemo.get(key) as T | undefined;
}

function memoSet<T>(key: string, value: T): T {
  if (resolvedMemo.size >= MEMO_MAX_ENTRIES) {
    const oldest = resolvedMemo.keys().next();
    if (!oldest.done) resolvedMemo.delete(oldest.value);
  }
  resolvedMemo.set(key, value);
  return value;
}

/** Test helper: drop all memoized pipeline results. */
export function clearBrandPipelineMemo(): void {
  resolvedMemo.clear();
}

export function resolveBrandTokensFromConfig(
  config: BrandTokensConfig,
): ResolvedBrandTokens {
  const key = `brand:${JSON.stringify(config)}`;
  const hit = memoGet<ResolvedBrandTokens>(key);
  if (hit) return hit;
  return memoSet(key, computeBrandTokens(config));
}

function computeBrandTokens(config: BrandTokensConfig): ResolvedBrandTokens {
  const palettes = buildBrandPalettes(config.seed);
  const scale = resolveScaleTokens({
    shape: config.shape,
    density: config.density,
    motion: config.motion,
  });

  const light = {} as Record<ContrastLevel, ResolvedSchemeTokens>;
  const dark = {} as Record<ContrastLevel, ResolvedSchemeTokens>;

  for (const contrast of CONTRAST_LEVELS) {
    light[contrast] = resolveOneScheme(palettes, scale, "light", contrast);
    dark[contrast] = resolveOneScheme(palettes, scale, "dark", contrast);
  }

  return {
    version: 2,
    config,
    palettes: {
      primary: tonalPaletteToRecord(palettes.primary),
      secondary: tonalPaletteToRecord(palettes.secondary),
      tertiary: tonalPaletteToRecord(palettes.tertiary),
      neutral: tonalPaletteToRecord(palettes.neutral),
      neutralVariant: tonalPaletteToRecord(palettes.neutralVariant),
      error: tonalPaletteToRecord(palettes.error),
    },
    stateLayers: M3_STATE_LAYER_OPACITIES,
    scale,
    schemes: {
      light,
      dark,
    },
  };
}

/**
 * Validate white-label tenant customization (`seed.primary` + optional `logo`)
 * and resolve its M3 HCT token set + WCAG contrast verification.
 */
export function resolveTenantBranding(
  input: TenantSeedInput | unknown,
  base?: BrandTokensInput | BrandTokensConfig,
): ResolvedTenantBranding {
  const tenant = parseTenantSeed(input);
  const baseConfig: BrandTokensConfig = base
    ? "font" in base &&
      typeof base.font?.sans === "string" &&
      typeof base.shape === "string" &&
      typeof base.density === "string" &&
      typeof base.motion === "string" &&
      typeof base.contrast === "string"
      ? (base as BrandTokensConfig)
      : parseBrandTokens(base)
    : {
        seed: { primary: DEFAULT_BRAND_SEEDS.primary },
        font: {
          sans: "Estedad, Fredoka, Inter, Arial, sans-serif",
          data: "Vazirmatn, Estedad, Arial, sans-serif",
        },
        shape: "default",
        density: "default",
        motion: "standard",
        contrast: "standard",
      };

  const mergedConfig: BrandTokensConfig = {
    seed: { primary: tenant.seed.primary },
    font: baseConfig.font,
    shape: baseConfig.shape,
    density: baseConfig.density,
    motion: baseConfig.motion,
    contrast: baseConfig.contrast,
  };

  const key = `tenant:${JSON.stringify({ tenant, config: mergedConfig })}`;
  const hit = memoGet<ResolvedTenantBranding>(key);
  if (hit) return hit;
  return memoSet(key, {
    tenant,
    resolved: resolveBrandTokensFromConfig(mergedConfig),
  });
}

function formatCssBlock(
  selector: string,
  entries: Array<[string, string]>,
): string {
  const lines = entries.map(([name, value]) => {
    const single = `  ${name}: ${value};`;
    if (single.length > 80 && value.startsWith("var(") && value.endsWith(")")) {
      const inner = value.slice(4, -1);
      return `  ${name}: var(\n    ${inner}\n  );`;
    }
    return single;
  });
  return `${selector} {\n${lines.join("\n")}\n}`;
}

/** Build the component-tier CSS variables (`--field-*`, `--button-*`) referencing sys tokens. */
export function buildComponentCssVars(): Record<string, string> {
  return {
    "--field-radius": "var(--rounded-field)",
    "--field-border-width": "var(--border-line-field)",
    "--field-bg": "var(--bg-field)",
    "--field-border": "var(--input)",
    "--field-border-invalid": "var(--destructive)",
    "--field-foreground": "var(--foreground)",
    "--field-shadow": "var(--shadow-field)",
    "--field-height-default": "var(--md-sys-density-control-default)",
    "--field-height-touch": "var(--md-sys-density-control-touch)",
    "--button-radius": "var(--md-sys-shape-button, var(--radius-lg))",
    "--button-shadow": "var(--shadow-control)",
    "--button-shadow-press": "var(--shadow-press)",
    "--button-press-transform": "var(--press)",
    "--button-disabled-content-opacity":
      "var(--md-sys-state-disabled-content-opacity)",
    "--button-disabled-container-opacity":
      "var(--md-sys-state-disabled-container-opacity)",
  };
}

/**
 * Emit complete CSS variables (canonical `--md-sys-color-*`, state layers,
 * scale tokens, component tokens, shadcn/kit aliases, and contrast contexts).
 */
export function resolvedBrandTokensToCss(
  resolved: ResolvedBrandTokens,
): string {
  const defaultContrast = resolved.config.contrast;
  const lightDefault = resolved.schemes.light[defaultContrast];
  const darkDefault = resolved.schemes.dark[defaultContrast];

  const rootEntries: Array<[string, string]> = [
    ["color-scheme", "light"],
    ["--font-sans", resolved.config.font.sans],
    ["--font-data", resolved.config.font.data],
    ["--font-numeric", resolved.config.font.data],
    ...Object.entries(scaleTokensToCssVars(resolved.scale)),
    ...Object.entries(stateLayersToCssVars(resolved.stateLayers)),
    ...Object.entries(lightDefault.mdSysColorVars),
    ...Object.entries(lightDefault.shadcnAliasVars),
    ...Object.entries(buildComponentCssVars()),
  ];

  const darkEntries: Array<[string, string]> = [
    ["color-scheme", "dark"],
    ...Object.entries(darkDefault.mdSysColorVars),
    ...Object.entries(darkDefault.shadcnAliasVars),
  ];

  const blocks = [
    formatCssBlock(":root", rootEntries),
    formatCssBlock(".dark", darkEntries),
  ];

  for (const contrast of CONTRAST_LEVELS) {
    if (contrast === "standard") continue;
    blocks.push(
      formatCssBlock(
        `[data-contrast="${contrast}"]`,
        Object.entries(resolved.schemes.light[contrast].mdSysColorVars),
      ),
    );
    blocks.push(
      formatCssBlock(
        `.dark[data-contrast="${contrast}"]`,
        Object.entries(resolved.schemes.dark[contrast].mdSysColorVars),
      ),
    );
  }

  return `${blocks.join("\n\n")}\n`;
}

/**
 * Export flattened `#rrggbb` hex tokens (no CSS `var(...)`) for email templates and PDFs.
 */
export function toFlattenedHexTokens(
  resolved: ResolvedBrandTokens,
  options?: { scheme?: TokenColorScheme; contrast?: ContrastLevel },
): FlattenedHexTokens {
  const scheme = options?.scheme ?? "light";
  const contrast = options?.contrast ?? resolved.config.contrast;
  const schemeTokens = resolved.schemes[scheme][contrast];

  const colors: Record<string, string> = {};
  for (const [varName, hex] of Object.entries(schemeTokens.mdSysColorVars)) {
    colors[varName.replace(/^--/, "")] = hex;
  }
  for (const [key, value] of Object.entries(schemeTokens.semanticHex)) {
    if (value.startsWith("#")) {
      colors[key] = value;
    }
  }

  return {
    scheme,
    contrast,
    colors,
    typography: {
      fontSans: resolved.config.font.sans,
      fontData: resolved.config.font.data,
    },
    radii: resolved.scale.radii,
  };
}

export function isResolvedBrandTokens(
  value: unknown,
): value is ResolvedBrandTokens {
  return (
    typeof value === "object" &&
    value !== null &&
    "version" in value &&
    (value as { version?: unknown }).version === 2 &&
    "schemes" in value
  );
}

export function isBrandOrTenantInput(
  value: unknown,
): value is BrandTokensInput | TenantSeedInput {
  return (
    typeof value === "object" &&
    value !== null &&
    "seed" in value &&
    typeof (value as { seed?: unknown }).seed === "object" &&
    (value as { seed?: unknown }).seed !== null &&
    !("semantic" in value)
  );
}

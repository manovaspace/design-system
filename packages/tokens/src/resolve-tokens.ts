import { resolveBrandTokens } from "./dtcg/brand-pipeline.js";
import type { ResolvedBrandTokens, TokenColorScheme } from "./dtcg/types.js";
import { rememberBrandTokens, v1ToBrandInput } from "./dtcg/v1-bridge.js";
import { normalizeSemanticColor, withInteractionStates } from "./hsl-color.js";
import { resolveRecord } from "./ref-resolve.js";
import type {
  OrbitTokenOverride,
  OrbitTokens,
  OrbitTokensRaw,
} from "./schema/types.js";

function deepMerge<T extends Record<string, unknown>>(
  base: T,
  override: Record<string, unknown> | undefined,
): T {
  if (!override) return base;
  const result = { ...base } as Record<string, unknown>;
  for (const key of Object.keys(override)) {
    const baseVal = base[key];
    const overrideVal = override[key];
    if (
      overrideVal &&
      typeof overrideVal === "object" &&
      !Array.isArray(overrideVal) &&
      baseVal &&
      typeof baseVal === "object" &&
      !Array.isArray(baseVal)
    ) {
      result[key] = deepMerge(
        baseVal as Record<string, unknown>,
        overrideVal as Record<string, unknown>,
      );
    } else if (overrideVal !== undefined) {
      result[key] = overrideVal;
    }
  }
  return result as T;
}

function normalizeSemanticRecord(
  record: Record<string, string>,
): Record<string, string> {
  const normalized: Record<string, string> = {};
  for (const [key, value] of Object.entries(record)) {
    normalized[key] = normalizeSemanticColor(value);
  }
  return normalized;
}

/**
 * Colour values of the M3 standard-contrast role map for one scheme, keyed by
 * shadcn name (the same map `semantic.css` aliases to `--md-sys-color-*`).
 * Values are normalised to the v1 `hsl()` form.
 */
function m3SemanticColors(
  resolved: ResolvedBrandTokens,
  scheme: TokenColorScheme,
): Record<string, string> {
  const colors: Record<string, string> = {};
  for (const [key, value] of Object.entries(
    resolved.schemes[scheme].standard.semanticHex,
  )) {
    if (value.startsWith("#")) {
      colors[key] = normalizeSemanticColor(value);
    }
  }
  return colors;
}

/**
 * Resolve v1 tokens. Colours come from the M3 HCT pipeline seeded by the v1
 * anchors (see `v1ToBrandInput`); light and dark both use the standard-contrast
 * roles. Non-colour semantic values keep their v1 resolution. Colour keys that
 * the M3 map does not cover keep the resolved light value in both schemes.
 */
export function resolveTokens(
  raw: OrbitTokensRaw,
  base?: OrbitTokensRaw,
): OrbitTokens {
  return resolveTokensWithBrand(raw, base).tokens;
}

/** `resolveTokens` plus the M3 result that produced its colours. */
export function resolveTokensWithBrand(
  raw: OrbitTokensRaw,
  base?: OrbitTokensRaw,
): { tokens: OrbitTokens; brand: ResolvedBrandTokens } {
  const merged = base ? deepMerge(base, raw as OrbitTokenOverride) : raw;

  const brand = resolveBrandTokens(v1ToBrandInput(merged));
  const lightM3 = m3SemanticColors(brand, "light");
  const darkM3 = m3SemanticColors(brand, "dark");

  const resolvedLight = normalizeSemanticRecord(
    resolveRecord(merged.semantic.light, merged),
  );

  const tokens: OrbitTokens = {
    ...merged,
    color: merged.color,
    semantic: {
      light: { ...withInteractionStates(resolvedLight, "light"), ...lightM3 },
      dark: {
        ...withInteractionStates({ ...resolvedLight, ...darkM3 }, "dark"),
        ...darkM3,
      },
    },
  };
  rememberBrandTokens(tokens, brand);
  return { tokens, brand };
}

export function mergeTokenOverridesRaw(
  base: OrbitTokensRaw,
  ...overrides: (OrbitTokenOverride | undefined)[]
): OrbitTokensRaw {
  let merged = base;
  for (const override of overrides) {
    if (override) {
      merged = deepMerge(
        merged,
        override as Record<string, unknown>,
      ) as OrbitTokensRaw;
    }
  }

  if (merged.semantic.dark) {
    const { dark: _ignored, ...semantic } = merged.semantic;
    merged = { ...merged, semantic };
  }

  return merged;
}

export function mergeTokenOverrides(
  base: OrbitTokensRaw,
  ...overrides: (OrbitTokenOverride | undefined)[]
): OrbitTokens {
  return resolveTokens(mergeTokenOverridesRaw(base, ...overrides));
}

export {
  resolveBrandTokens,
  resolveBrandTokensFromConfig,
  resolvedBrandTokensToCss,
  resolveTenantBranding,
  toFlattenedHexTokens,
} from "./dtcg/brand-pipeline.js";

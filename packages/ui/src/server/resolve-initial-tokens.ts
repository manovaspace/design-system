import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import {
  type BrandTokensConfig,
  type BrandTokensInput,
  DEFAULT_BRAND_FONT,
  DEFAULT_BRAND_SEEDS,
  defaultTokensRaw,
  mergeTokenOverridesRaw,
  type OrbitTokenOverride,
  type OrbitTokensRaw,
  parseBrandTokens,
  parseTokenOverridePayload,
  type ResolvedBrandTokens,
  resolveBrandTokensFromConfig,
  resolveTenantBranding,
  type TenantSeedInput,
} from "@manovaspace/tokens";

export type ResolveInitialTokensOptions = {
  cwd?: string;
  /** File name under public/, default theme.override.json */
  overrideFile?: string;
  /** Static override merged last (matches TokenProvider `tokens` prop) */
  tokens?: OrbitTokenOverride;
  /** DTCG brand tokens file under public/, default brand.tokens.json */
  brandFile?: string;
  /** Static DTCG brand tokens fallback when public/brand.tokens.json is absent */
  brandTokens?: BrandTokensInput;
  /** Optional white-label tenant seed (`seed.primary` + optional `logo`) */
  tenantSeed?: TenantSeedInput;
};

export function readPublicTokenOverride(
  options: Pick<ResolveInitialTokensOptions, "cwd" | "overrideFile"> = {},
): OrbitTokenOverride | undefined {
  const cwd = options.cwd ?? process.cwd();
  const file = options.overrideFile ?? "theme.override.json";
  const path = join(cwd, "public", file);
  if (!existsSync(path)) return undefined;

  try {
    const data: unknown = JSON.parse(readFileSync(path, "utf8"));
    return parseTokenOverridePayload(data);
  } catch {
    return undefined;
  }
}

/** Read and validate `public/brand.tokens.json` (throws on schema error). */
export function readPublicBrandTokens(
  options: Pick<ResolveInitialTokensOptions, "cwd" | "brandFile"> = {},
): BrandTokensConfig | undefined {
  const cwd = options.cwd ?? process.cwd();
  const file = options.brandFile ?? "brand.tokens.json";
  const path = join(cwd, "public", file);
  if (!existsSync(path)) return undefined;

  const data: unknown = JSON.parse(readFileSync(path, "utf8"));
  return parseBrandTokens(data);
}

/** Server-side merge: defaults → public override → static prop. */
export function resolveInitialTokens(
  options: ResolveInitialTokensOptions = {},
): OrbitTokensRaw {
  const local = readPublicTokenOverride(options);
  return mergeTokenOverridesRaw(defaultTokensRaw, local, options.tokens);
}

/**
 * Server-side v2 DTCG resolution:
 * `public/brand.tokens.json` (or static `brandTokens`) + optional `tenantSeed.seed.primary`.
 */
export function resolveInitialBrandTokens(
  options: ResolveInitialTokensOptions = {},
): ResolvedBrandTokens {
  const fileConfig = readPublicBrandTokens(options);
  const baseConfig: BrandTokensConfig = fileConfig
    ? fileConfig
    : options.brandTokens
      ? parseBrandTokens(options.brandTokens)
      : {
          seed: {
            primary: DEFAULT_BRAND_SEEDS.primary,
            secondary: DEFAULT_BRAND_SEEDS.secondary,
            tertiary: DEFAULT_BRAND_SEEDS.tertiary,
            neutral: DEFAULT_BRAND_SEEDS.neutral,
            error: DEFAULT_BRAND_SEEDS.error,
          },
          font: {
            sans: DEFAULT_BRAND_FONT.sans,
            data: DEFAULT_BRAND_FONT.data,
          },
          shape: "default",
          density: "default",
          motion: "standard",
          contrast: "standard",
        };

  if (options.tenantSeed) {
    return resolveTenantBranding(options.tenantSeed, baseConfig).resolved;
  }
  return resolveBrandTokensFromConfig(baseConfig);
}

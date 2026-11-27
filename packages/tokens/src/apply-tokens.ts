import { mapToCssBlock, tokensToLegacyCssVars } from "./css-vars.js";
import {
  isBrandOrTenantInput,
  isResolvedBrandTokens,
  resolveBrandTokens,
  resolvedBrandTokensToCss,
  resolveTenantBranding,
} from "./dtcg/brand-pipeline.js";
import type {
  BrandTokensInput,
  ResolvedBrandTokens,
  ResolvedSchemeTokens,
  TenantSeedInput,
} from "./dtcg/types.js";
import { recallBrandTokens } from "./dtcg/v1-bridge.js";
import { resolveTokensWithBrand } from "./resolve-tokens.js";
import type { OrbitTokens, OrbitTokensRaw } from "./schema/types.js";

const STYLE_ID = "orbit-tokens-runtime";

export type ApplyTokensTarget = HTMLElement | null | undefined;
export type RuntimeTokenInput =
  | OrbitTokensRaw
  | BrandTokensInput
  | TenantSeedInput
  | ResolvedBrandTokens;

/**
 * v1 runtime CSS: the non-colour v1 variables, then the M3 colour block that
 * `semantic.css` is generated from. The M3 block comes last so shared names
 * (for example `--radius-lg`) resolve the same way as in the static CSS.
 */
function v1RuntimeCss(tokens: OrbitTokens, brand: ResolvedBrandTokens): string {
  const legacyCss = mapToCssBlock(":root", tokensToLegacyCssVars(tokens));
  return `${legacyCss}\n${resolvedBrandTokensToCss(brand)}`;
}

function schemeTargetEntries(
  scheme: ResolvedSchemeTokens,
): Array<[string, string]> {
  return [
    ...Object.entries(scheme.mdSysColorVars),
    ...Object.entries(scheme.shadcnAliasVars),
  ];
}

/**
 * Resolve a v1 input. Output of `resolveTokens` is reused as-is: re-resolving
 * it would seed M3 from its own tones instead of the original anchors.
 */
function resolveV1Input(raw: OrbitTokensRaw | OrbitTokens): {
  tokens: OrbitTokens;
  brand: ResolvedBrandTokens;
} {
  const known = recallBrandTokens(raw as OrbitTokens);
  if (known) return { tokens: raw as OrbitTokens, brand: known };
  return resolveTokensWithBrand(raw as OrbitTokensRaw);
}

function resolveV2Input(
  input: BrandTokensInput | TenantSeedInput | ResolvedBrandTokens,
): ResolvedBrandTokens {
  if (isResolvedBrandTokens(input)) return input;
  if ("logo" in input) {
    return resolveTenantBranding(input).resolved;
  }
  return resolveBrandTokens(input);
}

export function tokensToRuntimeCss(raw: RuntimeTokenInput): string {
  if (isResolvedBrandTokens(raw) || isBrandOrTenantInput(raw)) {
    return resolvedBrandTokensToCss(resolveV2Input(raw));
  }
  const { tokens, brand } = resolveV1Input(raw);
  return v1RuntimeCss(tokens, brand);
}

export function applyTokens(
  raw: RuntimeTokenInput,
  target?: ApplyTokensTarget,
): void {
  if (typeof document === "undefined") return;

  let css: string;
  let darkTargetEntries: Array<[string, string]> = [];

  if (isResolvedBrandTokens(raw) || isBrandOrTenantInput(raw)) {
    const resolved = resolveV2Input(raw);
    css = resolvedBrandTokensToCss(resolved);
    darkTargetEntries = schemeTargetEntries(
      resolved.schemes.dark[resolved.config.contrast],
    );
  } else {
    const { tokens, brand } = resolveV1Input(raw);
    css = v1RuntimeCss(tokens, brand);
    darkTargetEntries = schemeTargetEntries(
      brand.schemes.dark[brand.config.contrast],
    );
  }

  let style = document.getElementById(STYLE_ID) as HTMLStyleElement | null;

  if (!style) {
    style = document.createElement("style");
    style.id = STYLE_ID;
    document.body.insertBefore(style, document.body.firstChild);
  }

  style.textContent = css;
  // ponytail: never re-parent the node — SSR / React may own its mount point

  if (target?.classList.contains("dark")) {
    for (const [name, value] of darkTargetEntries) {
      target.style.setProperty(name, value);
    }
  }
}

export function clearAppliedTokens(): void {
  if (typeof document === "undefined") return;
  document.getElementById(STYLE_ID)?.remove();
}

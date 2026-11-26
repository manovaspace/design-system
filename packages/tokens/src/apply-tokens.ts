import {
  mapToCssBlock,
  tokensToCssVars,
  tokensToDarkCssVars,
} from "./css-vars.js";
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
  TenantSeedInput,
} from "./dtcg/types.js";
import { resolveTokens } from "./resolve-tokens.js";
import type { OrbitTokens, OrbitTokensRaw } from "./schema/types.js";

const STYLE_ID = "orbit-tokens-runtime";

export type ApplyTokensTarget = HTMLElement | null | undefined;
export type RuntimeTokenInput =
  | OrbitTokensRaw
  | BrandTokensInput
  | TenantSeedInput
  | ResolvedBrandTokens;

function runtimeCssFromResolved(tokens: OrbitTokens): string {
  const rootVars = tokensToCssVars(tokens);
  const darkVars = tokensToDarkCssVars(tokens);

  const rootCss = mapToCssBlock(":root", rootVars, {
    "color-scheme": "light",
  });
  const darkCss = mapToCssBlock(".dark", darkVars, {
    "color-scheme": "dark",
  });

  return `${rootCss}\n${darkCss}`;
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
  return runtimeCssFromResolved(resolveTokens(raw));
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
    const scheme = resolved.schemes.dark[resolved.config.contrast];
    darkTargetEntries = [
      ...Object.entries(scheme.mdSysColorVars),
      ...Object.entries(scheme.shadcnAliasVars),
    ];
  } else {
    const tokens = resolveTokens(raw);
    css = runtimeCssFromResolved(tokens);
    darkTargetEntries = [...tokensToDarkCssVars(tokens).entries()];
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

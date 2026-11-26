import { defaultTokensRaw } from "./default-tokens.js";
import {
  resolveBrandTokens,
  resolveTenantBranding,
} from "./dtcg/brand-pipeline.js";
import { parseBrandTokens, parseTenantSeed } from "./dtcg/brand-schema.js";
import { dtcgDocumentToOrbitTokensRaw } from "./dtcg/dtcg-document.js";
import type {
  BrandTokensConfig,
  DtcgDocument,
  TenantSeedConfig,
} from "./dtcg/types.js";
import { resolveTokens } from "./resolve-tokens.js";
import {
  COLOR_FAMILIES,
  COLOR_STEPS,
  type OrbitTokensRaw,
} from "./schema/types.js";

const HEX_PATTERN = /^#[0-9a-f]{6}$/i;

export function validateTokens(raw: OrbitTokensRaw): void {
  if (raw.version !== 1) {
    throw new Error(`Unsupported token version: ${raw.version}`);
  }

  for (const family of COLOR_FAMILIES) {
    const scale = raw.color[family];
    if (!scale) {
      throw new Error(`Missing color family: ${family}`);
    }
    for (const step of COLOR_STEPS) {
      const value = scale[step];
      if (!value || !HEX_PATTERN.test(value)) {
        throw new Error(`Invalid color ${family}.${step}: ${value}`);
      }
    }
  }

  if (!raw.semantic.light) {
    throw new Error("Missing semantic.light");
  }

  if (raw.semantic.dark) {
    throw new Error(
      "semantic.dark must not be authored — dark is derived from light via HSL L inversion",
    );
  }

  for (const key of Object.keys(raw.semantic.light)) {
    if (key.endsWith("-hover")) {
      throw new Error(
        `semantic.light.${key} must not be authored — hover states are derived via HSL L shift`,
      );
    }
  }

  const resolved = resolveTokens(raw);

  for (const theme of ["light", "dark"] as const) {
    const semantic = resolved.semantic[theme];
    for (const [key, value] of Object.entries(semantic)) {
      if (!value || value.includes("{")) {
        throw new Error(`Unresolved semantic.${theme}.${key}: ${value}`);
      }
    }
  }
}

export function validateDtcgDocument(doc: DtcgDocument): void {
  if (!doc || typeof doc !== "object") {
    throw new Error("DTCG document must be an object");
  }
  if (!doc.ref || !doc.sys || !doc.comp || !doc.resolver) {
    throw new Error("DTCG document must declare ref, sys, comp, and resolver");
  }
  if (doc.resolver.version !== "2025.10") {
    throw new Error(
      `Unsupported DTCG resolver version: ${String(doc.resolver.version)}`,
    );
  }
  const legacyRaw = dtcgDocumentToOrbitTokensRaw(doc);
  validateTokens(legacyRaw);
}

/** Validate `brand.tokens.json` schema + run M3 HCT + WCAG contrast verification. */
export function validateBrandTokens(input: unknown): BrandTokensConfig {
  const config = parseBrandTokens(input);
  resolveBrandTokens(input);
  return config;
}

/** Validate white-label tenant seed (`seed.primary` + optional `logo`) + WCAG contrast verification. */
export function validateTenantSeed(input: unknown): TenantSeedConfig {
  const config = parseTenantSeed(input);
  resolveTenantBranding(input);
  return config;
}

export function validateMnvColors(): void {
  validateTokens(defaultTokensRaw);
}

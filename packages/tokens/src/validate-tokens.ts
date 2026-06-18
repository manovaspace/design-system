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

import { defaultTokensRaw } from "./default-tokens.js";

export function validateMnvColors(): void {
  validateTokens(defaultTokensRaw);
}

import { deriveSemanticDark, normalizeSemanticColor } from "./hsl-color.js";
import type {
  OrbitTokenOverride,
  OrbitTokens,
  OrbitTokensRaw,
} from "./schema/types.js";

const REF_PATTERN = /^\{([^}]+)\}$/;

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

function lookupRef(path: string, tokens: OrbitTokensRaw): string | undefined {
  const parts = path.split(".");
  let current: unknown = tokens;

  for (const part of parts) {
    if (current == null || typeof current !== "object") return undefined;
    current = (current as Record<string, unknown>)[part];
  }

  return typeof current === "string" ? current : undefined;
}

function resolveValue(
  value: string,
  tokens: OrbitTokensRaw,
  depth = 0,
): string {
  if (depth > 32) {
    throw new Error(`Token reference cycle or depth exceeded: ${value}`);
  }

  const match = value.match(REF_PATTERN);
  if (!match?.[1]) return value;

  const resolved = lookupRef(match[1], tokens);
  if (resolved === undefined) {
    throw new Error(`Unresolved token reference: ${value}`);
  }

  return resolveValue(resolved, tokens, depth + 1);
}

function resolveRecord(
  record: Record<string, string>,
  tokens: OrbitTokensRaw,
): Record<string, string> {
  const resolved: Record<string, string> = {};
  let changed = true;
  let pass = 0;

  Object.assign(resolved, record);

  while (changed && pass < 32) {
    changed = false;
    pass += 1;
    for (const [key, value] of Object.entries(resolved)) {
      const next = resolveValue(value, tokens);
      if (next !== value) {
        resolved[key] = next;
        changed = true;
      }
    }
  }

  return resolved;
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

export function resolveTokens(
  raw: OrbitTokensRaw,
  base?: OrbitTokensRaw,
): OrbitTokens {
  const merged = base ? deepMerge(base, raw as OrbitTokenOverride) : raw;

  const resolvedLight = normalizeSemanticRecord(
    resolveRecord(merged.semantic.light, merged),
  );
  const resolvedDark = deriveSemanticDark(resolvedLight);

  return {
    ...merged,
    color: merged.color,
    semantic: {
      light: resolvedLight,
      dark: resolvedDark,
    },
  };
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

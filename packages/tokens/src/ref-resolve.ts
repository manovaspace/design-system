import type { OrbitTokensRaw } from "./schema/types.js";

const REF_PATTERN = /^\{([^}]+)\}$/;

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

/** Resolve every `{path}` reference in a flat token record against `tokens`. */
export function resolveRecord(
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

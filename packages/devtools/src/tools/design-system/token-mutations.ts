import type { OrbitTokensRaw } from "@manovaspace/tokens";
import { resolveTokens } from "@manovaspace/tokens";

const REF_PATTERN = /^\{[^}]+\}$/;

export function isTokenReference(value: string): boolean {
  return REF_PATTERN.test(value);
}

export function setTokenPath(
  tokens: OrbitTokensRaw,
  path: string,
  value: string,
): OrbitTokensRaw {
  const parts = path.split(".");
  if (parts.length < 2) return tokens;

  const next = structuredClone(tokens);
  let cursor: Record<string, unknown> = next as unknown as Record<
    string,
    unknown
  >;

  for (let i = 0; i < parts.length - 1; i++) {
    const key = parts[i];
    if (key === undefined) return tokens;
    const child = cursor[key];
    if (child == null || typeof child !== "object") {
      cursor[key] = {};
    }
    cursor = cursor[key] as Record<string, unknown>;
  }

  const leaf = parts.at(-1);
  if (leaf !== undefined) {
    cursor[leaf] = value;
  }

  return next;
}

export function getTokenPath(tokens: OrbitTokensRaw, path: string): string {
  const parts = path.split(".");
  let current: unknown = tokens;

  for (const part of parts) {
    if (current == null || typeof current !== "object") return "";
    current = (current as Record<string, unknown>)[part];
  }

  return typeof current === "string" ? current : "";
}

/** Resolve a token reference chain for display swatches. */
export function resolveTokenValue(
  value: string,
  tokens: OrbitTokensRaw,
  depth = 0,
): string {
  if (depth > 32 || !isTokenReference(value)) return value;

  const resolved = resolveTokens(tokens);
  const inner = value.slice(1, -1);
  const got = getTokenPath(resolved, inner);
  if (!got) return value;
  return resolveTokenValue(got, tokens, depth + 1);
}

export function isHexColor(value: string): boolean {
  return /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6}|[0-9a-fA-F]{8})$/.test(value);
}

export function isHslColor(value: string): boolean {
  return /^hsla?\(/i.test(value.trim());
}

export function isColorLiteral(value: string): boolean {
  return (
    isHexColor(value) || isHslColor(value) || /^oklch\(/i.test(value.trim())
  );
}

export function parseRem(value: string): number | null {
  const match = value.trim().match(/^(-?[\d.]+)rem$/);
  if (!match?.[1]) return null;
  const n = Number.parseFloat(match[1]);
  return Number.isFinite(n) ? n : null;
}

export function formatRem(n: number): string {
  const rounded = Math.round(n * 1000) / 1000;
  return `${rounded}rem`;
}

export function parsePx(value: string): number | null {
  const match = value.trim().match(/^(-?[\d.]+)px$/);
  if (!match?.[1]) return null;
  const n = Number.parseFloat(match[1]);
  return Number.isFinite(n) ? n : null;
}

export function formatPx(n: number): string {
  return `${Math.round(n)}px`;
}

export function parseUnitless(value: string): number | null {
  const n = Number.parseFloat(value.trim());
  return Number.isFinite(n) ? n : null;
}

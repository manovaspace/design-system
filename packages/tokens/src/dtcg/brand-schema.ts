import {
  CONTRAST_LEVELS,
  DEFAULT_BRAND_FONT,
  DENSITY_SCALES,
  MOTION_SCALES,
  SHAPE_SCALES,
} from "./constants.js";
import type {
  BrandTokensConfig,
  BrandTokensSeed,
  ContrastLevel,
  DensityScale,
  DtcgColorValue,
  MotionScale,
  ShapeScale,
  TenantSeedConfig,
} from "./types.js";

const HEX_SHORT_OR_FULL = /^#([0-9a-f]{3}|[0-9a-f]{6})$/i;

const ROOT_BRAND_KEYS = new Set([
  "$schema",
  "$description",
  "$extensions",
  "seed",
  "font",
  "shape",
  "density",
  "motion",
  "contrast",
]);

const SEED_BRAND_KEYS = new Set([
  "$description",
  "$type",
  "primary",
  "secondary",
  "tertiary",
  "neutral",
  "error",
]);

const FONT_BRAND_KEYS = new Set(["$description", "$type", "sans", "data"]);

const ROOT_TENANT_KEYS = new Set(["$schema", "$description", "seed", "logo"]);

const SEED_TENANT_KEYS = new Set(["$description", "$type", "primary"]);

const DTCG_LEAF_KEYS = new Set([
  "$value",
  "$type",
  "$description",
  "$extensions",
]);

export class TokenSchemaError extends Error {
  readonly code = "SCHEMA_VALIDATION_ERROR" as const;
  readonly path: string;
  readonly expected?: string;
  readonly actual?: unknown;

  constructor(
    message: string,
    options: { path: string; expected?: string; actual?: unknown },
  ) {
    super(message);
    this.name = "TokenSchemaError";
    this.path = options.path;
    this.expected = options.expected;
    this.actual = options.actual;
  }
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function assertAllowedKeys(
  obj: Record<string, unknown>,
  allowed: ReadonlySet<string>,
  path: string,
): void {
  for (const key of Object.keys(obj)) {
    if (!allowed.has(key)) {
      throw new TokenSchemaError(`Unknown key "${key}" at ${path}`, {
        path: path === "root" ? key : `${path}.${key}`,
        expected: `one of [${[...allowed].join(", ")}]`,
        actual: key,
      });
    }
  }
}

function unwrapDtcgLeaf(value: unknown, path: string): unknown {
  if (isPlainObject(value) && "$value" in value) {
    assertAllowedKeys(value, DTCG_LEAF_KEYS, path);
    return value.$value;
  }
  return value;
}

function normalizeHex(hex: string): string {
  const raw = hex.slice(1).toLowerCase();
  if (raw.length === 3) {
    const [r, g, b] = raw;
    return `#${r}${r}${g}${g}${b}${b}`;
  }
  return `#${raw}`;
}

function clamp01(n: number): number {
  return Math.min(1, Math.max(0, n));
}

function componentsToHex(components: unknown, path: string): string {
  if (
    !Array.isArray(components) ||
    components.length !== 3 ||
    components.some((c) => typeof c !== "number" || !Number.isFinite(c))
  ) {
    throw new TokenSchemaError(
      `Invalid DTCG color components at ${path} — expected [r, g, b] numbers`,
      { path, expected: "[number, number, number]", actual: components },
    );
  }
  const [r, g, b] = components as [number, number, number];
  const toByte = (v: number) =>
    Math.round(clamp01(v) * 255)
      .toString(16)
      .padStart(2, "0");
  return `#${toByte(r)}${toByte(g)}${toByte(b)}`;
}

/**
 * Parse a CSS `#rgb`/`#rrggbb` hex string, DTCG 2025.10 color object,
 * or DTCG `{ $value }` leaf into a normalized lowercase `#rrggbb` string.
 */
export function parseHexOrDtcgColor(value: unknown, path: string): string {
  const unwrapped = unwrapDtcgLeaf(value, path);

  if (typeof unwrapped === "string") {
    const trimmed = unwrapped.trim();
    if (!HEX_SHORT_OR_FULL.test(trimmed)) {
      throw new TokenSchemaError(
        `Invalid color at ${path}: "${unwrapped}" (expected #rgb or #rrggbb)`,
        { path, expected: "#rrggbb", actual: unwrapped },
      );
    }
    return normalizeHex(trimmed);
  }

  if (isPlainObject(unwrapped)) {
    const dtcg = unwrapped as Partial<DtcgColorValue>;
    if (dtcg.colorSpace !== "srgb") {
      throw new TokenSchemaError(
        `Unsupported DTCG colorSpace at ${path}: ${String(dtcg.colorSpace)}`,
        { path, expected: "srgb", actual: dtcg.colorSpace },
      );
    }
    if (typeof dtcg.hex === "string" && HEX_SHORT_OR_FULL.test(dtcg.hex)) {
      return normalizeHex(dtcg.hex);
    }
    return componentsToHex(dtcg.components, path);
  }

  throw new TokenSchemaError(
    `Invalid color token at ${path} — expected hex string or DTCG color object`,
    { path, expected: "color", actual: unwrapped },
  );
}

function parseEnum<T extends string>(
  value: unknown,
  allowed: readonly T[],
  fallback: T,
  path: string,
): T {
  if (value === undefined) return fallback;
  const unwrapped = unwrapDtcgLeaf(value, path);
  if (typeof unwrapped !== "string" || !allowed.includes(unwrapped as T)) {
    throw new TokenSchemaError(
      `Invalid value at ${path}: "${String(unwrapped)}" (expected ${allowed.join(" | ")})`,
      { path, expected: allowed.join(" | "), actual: unwrapped },
    );
  }
  return unwrapped as T;
}

function parseFontStack(
  value: unknown,
  fallback: string,
  path: string,
): string {
  if (value === undefined) return fallback;
  const unwrapped = unwrapDtcgLeaf(value, path);
  if (typeof unwrapped === "string") {
    const trimmed = unwrapped.trim();
    if (!trimmed) {
      throw new TokenSchemaError(`Empty font stack at ${path}`, {
        path,
        expected: "non-empty font-family string",
        actual: unwrapped,
      });
    }
    return trimmed;
  }
  if (
    Array.isArray(unwrapped) &&
    unwrapped.length > 0 &&
    unwrapped.every(
      (item) => typeof item === "string" && item.trim().length > 0,
    )
  ) {
    return unwrapped
      .map((item) => {
        const trimmed = item.trim();
        return /\s/.test(trimmed) && !trimmed.startsWith('"')
          ? `"${trimmed}"`
          : trimmed;
      })
      .join(", ");
  }
  throw new TokenSchemaError(
    `Invalid font token at ${path} — expected string or string[]`,
    { path, expected: "string | string[]", actual: unwrapped },
  );
}

/**
 * Strictly validate and normalize a `brand.tokens.json` object per ADR-078 section 6.
 * Rejects any unknown key at root, `seed`, `font`, or DTCG leaf nodes.
 */
export function parseBrandTokens(input: unknown): BrandTokensConfig {
  if (!isPlainObject(input)) {
    throw new TokenSchemaError("brand.tokens.json must be a JSON object", {
      path: "root",
      expected: "object",
      actual: input,
    });
  }

  assertAllowedKeys(input, ROOT_BRAND_KEYS, "root");

  if (!isPlainObject(input.seed)) {
    throw new TokenSchemaError("Missing required seed object in brand tokens", {
      path: "seed",
      expected: "object with seed.primary",
      actual: input.seed,
    });
  }

  assertAllowedKeys(input.seed, SEED_BRAND_KEYS, "seed");

  if (input.seed.primary === undefined) {
    throw new TokenSchemaError("Missing required seed.primary color", {
      path: "seed.primary",
      expected: "hex or DTCG color",
    });
  }

  const seed: BrandTokensSeed = {
    primary: parseHexOrDtcgColor(input.seed.primary, "seed.primary"),
  };

  if (input.seed.secondary !== undefined) {
    seed.secondary = parseHexOrDtcgColor(
      input.seed.secondary,
      "seed.secondary",
    );
  }
  if (input.seed.tertiary !== undefined) {
    seed.tertiary = parseHexOrDtcgColor(input.seed.tertiary, "seed.tertiary");
  }
  if (input.seed.neutral !== undefined) {
    seed.neutral = parseHexOrDtcgColor(input.seed.neutral, "seed.neutral");
  }
  if (input.seed.error !== undefined) {
    seed.error = parseHexOrDtcgColor(input.seed.error, "seed.error");
  }

  let fontSans: string = DEFAULT_BRAND_FONT.sans;
  let fontData: string = DEFAULT_BRAND_FONT.data;

  if (input.font !== undefined) {
    if (!isPlainObject(input.font)) {
      throw new TokenSchemaError("font must be an object", {
        path: "font",
        expected: "{ sans?, data? }",
        actual: input.font,
      });
    }
    assertAllowedKeys(input.font, FONT_BRAND_KEYS, "font");
    fontSans = parseFontStack(input.font.sans, fontSans, "font.sans");
    fontData = parseFontStack(input.font.data, fontData, "font.data");
  }

  return {
    seed,
    font: {
      sans: fontSans,
      data: fontData,
    },
    shape: parseEnum<ShapeScale>(input.shape, SHAPE_SCALES, "default", "shape"),
    density: parseEnum<DensityScale>(
      input.density,
      DENSITY_SCALES,
      "default",
      "density",
    ),
    motion: parseEnum<MotionScale>(
      input.motion,
      MOTION_SCALES,
      "standard",
      "motion",
    ),
    contrast: parseEnum<ContrastLevel>(
      input.contrast,
      CONTRAST_LEVELS,
      "standard",
      "contrast",
    ),
  };
}

/**
 * Strictly validate white-label tenant customization (`seed.primary` + optional `logo` only).
 * Any extra seed color, font, scale, or unknown key fails immediately.
 */
export function parseTenantSeed(input: unknown): TenantSeedConfig {
  if (!isPlainObject(input)) {
    throw new TokenSchemaError("Tenant branding input must be a JSON object", {
      path: "root",
      expected: "object",
      actual: input,
    });
  }

  assertAllowedKeys(input, ROOT_TENANT_KEYS, "root");

  if (!isPlainObject(input.seed)) {
    throw new TokenSchemaError("Missing required seed object in tenant input", {
      path: "seed",
      expected: "{ primary }",
      actual: input.seed,
    });
  }

  assertAllowedKeys(input.seed, SEED_TENANT_KEYS, "seed");

  if (input.seed.primary === undefined) {
    throw new TokenSchemaError("Missing required seed.primary color", {
      path: "seed.primary",
      expected: "hex or DTCG color",
    });
  }

  const primary = parseHexOrDtcgColor(input.seed.primary, "seed.primary");

  let logo: string | undefined;
  if (input.logo !== undefined) {
    const unwrappedLogo = unwrapDtcgLeaf(input.logo, "logo");
    if (
      typeof unwrappedLogo !== "string" ||
      unwrappedLogo.trim().length === 0
    ) {
      throw new TokenSchemaError("logo must be a non-empty string", {
        path: "logo",
        expected: "non-empty string",
        actual: unwrappedLogo,
      });
    }
    logo = unwrappedLogo.trim();
  }

  return logo ? { seed: { primary }, logo } : { seed: { primary } };
}

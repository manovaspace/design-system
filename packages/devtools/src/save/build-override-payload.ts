import type { OrbitTokenOverride, OrbitTokensRaw } from "@manovaspace/tokens";

import type { ThemeSavePayload } from "../types.js";
import { buildThemePayload } from "./adapters.js";

function diffRecord(
  draft: Record<string, string>,
  base: Record<string, string>,
): Record<string, string> | undefined {
  const out: Record<string, string> = {};
  const keys = new Set([...Object.keys(draft), ...Object.keys(base)]);

  for (const key of keys) {
    if (draft[key] !== base[key]) {
      out[key] = draft[key] ?? "";
    }
  }

  return Object.keys(out).length > 0 ? out : undefined;
}

function diffNestedColor(
  draft: Record<string, Record<string, string>>,
  base: Record<string, Record<string, string>>,
): OrbitTokenOverride["color"] | undefined {
  const out: NonNullable<OrbitTokenOverride["color"]> = {};
  const families = new Set([...Object.keys(draft), ...Object.keys(base)]);

  for (const family of families) {
    const stepDiff = diffRecord(draft[family] ?? {}, base[family] ?? {});
    if (stepDiff) out[family] = stepDiff;
  }

  return Object.keys(out).length > 0 ? out : undefined;
}

function diffTypography(
  draft: OrbitTokensRaw["typography"],
  base: OrbitTokensRaw["typography"],
): OrbitTokenOverride["typography"] | undefined {
  const fontFamily = diffRecord(draft.fontFamily, base.fontFamily);
  const fontSize = diffRecord(draft.fontSize, base.fontSize);
  const lineHeight = diffRecord(draft.lineHeight, base.lineHeight);

  if (!fontFamily && !fontSize && !lineHeight) return undefined;

  return {
    ...(fontFamily ? { fontFamily } : {}),
    ...(fontSize ? { fontSize } : {}),
    ...(lineHeight ? { lineHeight } : {}),
  };
}

/** Deep-diff draft vs base into a minimal OrbitTokenOverride. */
export function buildTokenOverridePayload(
  draft: OrbitTokensRaw,
  base: OrbitTokensRaw,
): OrbitTokenOverride | null {
  const override: OrbitTokenOverride = {};

  const color = diffNestedColor(draft.color, base.color);
  if (color) override.color = color;

  const light = diffRecord(draft.semantic.light, base.semantic.light);
  if (light) {
    override.semantic = { light };
  }

  const spacing = diffRecord(draft.spacing, base.spacing);
  if (spacing) override.spacing = spacing;

  const typography = diffTypography(draft.typography, base.typography);
  if (typography) override.typography = typography;

  const radii = diffRecord(draft.radii, base.radii);
  if (radii) override.radii = radii;

  const shadow = diffRecord(draft.shadow, base.shadow);
  if (shadow) override.shadow = shadow;

  const breakpoint = diffRecord(draft.breakpoint, base.breakpoint);
  if (breakpoint) override.breakpoint = breakpoint;

  return Object.keys(override).length > 0 ? override : null;
}

export function buildTokenOverrideThemePayload(
  draft: OrbitTokensRaw,
  base: OrbitTokensRaw,
  appName?: string,
): ThemeSavePayload | null {
  const tokens = buildTokenOverridePayload(draft, base);
  if (!tokens) return null;
  return buildThemePayload(tokens, appName);
}

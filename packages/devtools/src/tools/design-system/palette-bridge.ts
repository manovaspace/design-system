import {
  applyFamilyAnchorColor,
  type OrbitTokensRaw,
  parseColorToHsl,
} from "@manovaspace/tokens";

import { isHexColor, resolveTokenValue } from "./token-mutations.js";

export type PaletteRole =
  | "text"
  | "background"
  | "primary"
  | "secondary"
  | "accent";

export const PALETTE_ROLES: PaletteRole[] = [
  "text",
  "background",
  "primary",
  "secondary",
  "accent",
];

export const PALETTE_ROLE_LABELS: Record<PaletteRole, string> = {
  text: "Text",
  background: "Background",
  primary: "Primary",
  secondary: "Secondary",
  accent: "Accent",
};

function hslToHex(h: number, s: number, l: number): string {
  const sNorm = s / 100;
  const lNorm = l / 100;
  const c = (1 - Math.abs(2 * lNorm - 1)) * sNorm;
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = lNorm - c / 2;

  let r = 0;
  let g = 0;
  let b = 0;

  if (h < 60) {
    r = c;
    g = x;
  } else if (h < 120) {
    r = x;
    g = c;
  } else if (h < 180) {
    g = c;
    b = x;
  } else if (h < 240) {
    g = x;
    b = c;
  } else if (h < 300) {
    r = x;
    b = c;
  } else {
    r = c;
    b = x;
  }

  const toByte = (v: number) =>
    Math.round((v + m) * 255)
      .toString(16)
      .padStart(2, "0");

  return `#${toByte(r)}${toByte(g)}${toByte(b)}`;
}

/** Resolve any color literal or ref to a hex string for the native color picker. */
export function colorToHex(value: string): string {
  const trimmed = value.trim();
  if (isHexColor(trimmed)) return trimmed.toLowerCase();

  try {
    const { h, s, l } = parseColorToHsl(trimmed);
    return hslToHex(h, s, l);
  } catch {
    return "#000000";
  }
}

function readSemanticColor(tokens: OrbitTokensRaw, key: string): string {
  const raw = tokens.semantic.light[key] ?? "";
  return colorToHex(resolveTokenValue(raw, tokens));
}

export function readPaletteColor(
  tokens: OrbitTokensRaw,
  role: PaletteRole,
): string {
  switch (role) {
    case "text":
      return readSemanticColor(tokens, "foreground");
    case "background":
      return readSemanticColor(tokens, "background");
    case "primary":
      return colorToHex(tokens.color.action?.["500"] ?? "#2563eb");
    case "secondary":
      return readSemanticColor(tokens, "secondary");
    case "accent":
      return colorToHex(tokens.color.supporting?.["500"] ?? "#3b82f6");
    default:
      return "#000000";
  }
}

export function readPaletteColors(
  tokens: OrbitTokensRaw,
): Record<PaletteRole, string> {
  return Object.fromEntries(
    PALETTE_ROLES.map((role) => [role, readPaletteColor(tokens, role)]),
  ) as Record<PaletteRole, string>;
}

function setSemanticLiteral(
  tokens: OrbitTokensRaw,
  key: string,
  hex: string,
): OrbitTokensRaw {
  const next = structuredClone(tokens);
  next.semantic.light[key] = hex.toLowerCase();
  return next;
}

/** Apply one palette role and propagate through the token tree. */
export function applyPaletteColor(
  tokens: OrbitTokensRaw,
  role: PaletteRole,
  hex: string,
): OrbitTokensRaw {
  const normalized = hex.toLowerCase();
  if (!isHexColor(normalized)) return tokens;

  switch (role) {
    case "text": {
      const next = structuredClone(tokens);
      next.color = applyFamilyAnchorColor(next.color, "primary", normalized);
      return next;
    }
    case "background": {
      let next = setSemanticLiteral(tokens, "background", normalized);
      next = setSemanticLiteral(next, "card", normalized);
      next = setSemanticLiteral(next, "popover", normalized);
      return next;
    }
    case "primary": {
      const next = structuredClone(tokens);
      next.color = applyFamilyAnchorColor(next.color, "action", normalized);
      next.semantic.light.primary = "{color.action.500}";
      next.semantic.light.ring = "{color.action.500}";
      next.semantic.light["chart-1"] = "{color.action.500}";
      next.semantic.light["sidebar-primary"] = "{color.action.500}";
      return next;
    }
    case "secondary": {
      let next = setSemanticLiteral(tokens, "secondary", normalized);
      const foreground =
        next.semantic.light.foreground ?? "{color.primary.900}";
      next = setSemanticLiteral(next, "secondary-foreground", foreground);
      return next;
    }
    case "accent": {
      const next = structuredClone(tokens);
      next.color = applyFamilyAnchorColor(next.color, "supporting", normalized);
      next.semantic.light.accent = "{color.supporting.500}";
      next.semantic.light["chart-2"] = "{color.supporting.500}";
      return next;
    }
    default:
      return tokens;
  }
}

/** ponytail: round-trip self-check — run in vitest, not at import time. */
export function assertPaletteBridgeRoundTrip(tokens: OrbitTokensRaw): void {
  for (const role of PALETTE_ROLES) {
    const hex = readPaletteColor(tokens, role);
    const next = applyPaletteColor(tokens, role, hex);
    const again = readPaletteColor(next, role);
    if (again !== hex) {
      throw new Error(
        `palette round-trip failed for ${role}: ${hex} -> ${again}`,
      );
    }
  }
}

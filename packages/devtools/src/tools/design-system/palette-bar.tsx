"use client";

import type { OrbitTokensRaw } from "@manovaspace/tokens";

import {
  applyPaletteColor,
  PALETTE_ROLE_LABELS,
  PALETTE_ROLES,
  readPaletteColor,
} from "./palette-bridge.js";

type PaletteBarProps = {
  tokens: OrbitTokensRaw;
  onChange: (tokens: OrbitTokensRaw) => void;
};

function swatchTextColor(hex: string): string {
  const n = hex.replace("#", "");
  const full =
    n.length === 3
      ? n
          .split("")
          .map((c) => c + c)
          .join("")
      : n.slice(0, 6);
  const num = Number.parseInt(full, 16);
  const r = (num >> 16) & 255;
  const g = (num >> 8) & 255;
  const b = num & 255;
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance > 0.55 ? "hsl(0 0% 0%)" : "hsl(0 0% 100%)";
}

export function PaletteBar({ tokens, onChange }: PaletteBarProps) {
  return (
    <div className="orbit-palette-bar">
      {/* biome-ignore lint/a11y/useSemanticElements: palette toolbar groups color inputs */}
      <div
        className="orbit-palette-bar__swatches"
        role="group"
        aria-label="Palette colors"
      >
        {PALETTE_ROLES.map((role) => {
          const hex = readPaletteColor(tokens, role);
          const label = PALETTE_ROLE_LABELS[role];
          const textColor = swatchTextColor(hex);

          return (
            <label
              key={role}
              className="orbit-palette-swatch"
              style={{ backgroundColor: hex, color: textColor }}
            >
              <input
                type="color"
                value={hex}
                className="orbit-palette-swatch__input"
                aria-label={`${label}: ${hex}`}
                onChange={(e) =>
                  onChange(applyPaletteColor(tokens, role, e.target.value))
                }
              />
              <span className="orbit-palette-swatch__label">{label}</span>
            </label>
          );
        })}
      </div>
    </div>
  );
}

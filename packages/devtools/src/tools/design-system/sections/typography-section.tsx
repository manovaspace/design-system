import type { OrbitTokensRaw } from "@manovaspace/tokens";

import { RemField } from "../fields/rem-field.js";
import { TextField, UnitlessField } from "../fields/text-field.js";
import { matchesFilter } from "../fields/token-search.js";
import { TokenSection } from "../fields/token-section.js";
import { setTokenPath } from "../token-mutations.js";

const FONT_SIZE_KEYS = ["display", "heading", "body", "caption"] as const;

const FONT_SIZE_LABELS: Record<(typeof FONT_SIZE_KEYS)[number], string> = {
  display: "Display",
  heading: "Heading",
  body: "Body",
  caption: "Caption",
};

const FONT_SIZE_MAX: Record<(typeof FONT_SIZE_KEYS)[number], number> = {
  display: 4,
  heading: 3,
  body: 2,
  caption: 2,
};

type TypographySectionProps = {
  tokens: OrbitTokensRaw;
  filter: string;
  onChange: (tokens: OrbitTokensRaw) => void;
};

export function TypographySection({
  tokens,
  filter,
  onChange,
}: TypographySectionProps) {
  const show = matchesFilter("typography font", filter) || !filter.trim();

  if (!show) return null;

  const fontFamilies = Object.entries(tokens.typography.fontFamily).filter(
    ([key]) => matchesFilter(`font ${key}`, filter),
  );
  const fontSizes = FONT_SIZE_KEYS.filter((key) =>
    matchesFilter(`fontSize ${key} ${FONT_SIZE_LABELS[key]}`, filter),
  );
  const lineHeights = Object.entries(tokens.typography.lineHeight).filter(
    ([key]) => matchesFilter(`lineHeight ${key}`, filter),
  );

  return (
    <TokenSection
      title="Typography"
      description="Four sizes — use weight, color, and spacing for hierarchy."
      defaultOpen
    >
      {fontSizes.length > 0 ? (
        <div className="orbit-token-section-subgroup">
          <p className="orbit-token-section-subgroup-title">Font size</p>
          {fontSizes.map((key) => (
            <RemField
              key={key}
              label={FONT_SIZE_LABELS[key]}
              value={tokens.typography.fontSize[key] ?? ""}
              max={FONT_SIZE_MAX[key]}
              onChange={(next) =>
                onChange(
                  setTokenPath(tokens, `typography.fontSize.${key}`, next),
                )
              }
            />
          ))}
        </div>
      ) : null}
      {fontFamilies.length > 0 ? (
        <div className="orbit-token-section-subgroup">
          <p className="orbit-token-section-subgroup-title">Font family</p>
          {fontFamilies.map(([key, value]) => (
            <TextField
              key={key}
              label={key}
              value={value}
              onChange={(next) =>
                onChange(
                  setTokenPath(tokens, `typography.fontFamily.${key}`, next),
                )
              }
            />
          ))}
        </div>
      ) : null}
      {lineHeights.length > 0 ? (
        <div className="orbit-token-section-subgroup">
          <p className="orbit-token-section-subgroup-title">Line height</p>
          {lineHeights.map(([key, value]) => (
            <UnitlessField
              key={key}
              label={key}
              value={value}
              onChange={(next) =>
                onChange(
                  setTokenPath(tokens, `typography.lineHeight.${key}`, next),
                )
              }
            />
          ))}
        </div>
      ) : null}
    </TokenSection>
  );
}

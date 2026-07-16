import type { OrbitTokensRaw } from "@manovaspace/tokens";

import { RemField } from "../fields/rem-field.js";
import { TextField } from "../fields/text-field.js";
import { matchesFilter } from "../fields/token-search.js";
import { TokenSection } from "../fields/token-section.js";
import { parseRem, setTokenPath } from "../token-mutations.js";

type SpacingSectionProps = {
  tokens: OrbitTokensRaw;
  filter: string;
  onChange: (tokens: OrbitTokensRaw) => void;
};

export function SpacingSection({
  tokens,
  filter,
  onChange,
}: SpacingSectionProps) {
  const entries = Object.entries(tokens.spacing).filter(([key]) =>
    matchesFilter(`spacing ${key}`, filter),
  );

  if (
    !matchesFilter("spacing", filter) &&
    entries.length === 0 &&
    filter.trim()
  ) {
    return null;
  }

  return (
    <TokenSection title="Spacing" description="Layout spacing scale.">
      {entries.map(([key, value]) =>
        parseRem(value) !== null || value.endsWith("rem") ? (
          <RemField
            key={key}
            label={key}
            value={value}
            max={6}
            onChange={(next) =>
              onChange(setTokenPath(tokens, `spacing.${key}`, next))
            }
          />
        ) : (
          <TextField
            key={key}
            label={key}
            value={value}
            mono
            onChange={(next) =>
              onChange(setTokenPath(tokens, `spacing.${key}`, next))
            }
          />
        ),
      )}
    </TokenSection>
  );
}

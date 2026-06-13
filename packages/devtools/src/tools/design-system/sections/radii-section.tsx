import type { OrbitTokensRaw } from "@manovaspace/tokens";

import { RemField } from "../fields/rem-field.js";
import { TextField } from "../fields/text-field.js";
import { matchesFilter } from "../fields/token-search.js";
import { TokenSection } from "../fields/token-section.js";
import { parseRem, setTokenPath } from "../token-mutations.js";

type RadiiSectionProps = {
  tokens: OrbitTokensRaw;
  filter: string;
  onChange: (tokens: OrbitTokensRaw) => void;
};

export function RadiiSection({ tokens, filter, onChange }: RadiiSectionProps) {
  const entries = Object.entries(tokens.radii).filter(([key]) =>
    matchesFilter(`radius ${key}`, filter),
  );

  if (
    !matchesFilter("radii radius", filter) &&
    entries.length === 0 &&
    filter.trim()
  ) {
    return null;
  }

  return (
    <TokenSection title="Radii" description="Border radius scale.">
      {entries.map(([key, value]) =>
        parseRem(value) !== null ? (
          <RemField
            key={key}
            label={key}
            value={value}
            max={2}
            onChange={(next) =>
              onChange(setTokenPath(tokens, `radii.${key}`, next))
            }
          />
        ) : (
          <TextField
            key={key}
            label={key}
            value={value}
            mono
            onChange={(next) =>
              onChange(setTokenPath(tokens, `radii.${key}`, next))
            }
          />
        ),
      )}
    </TokenSection>
  );
}

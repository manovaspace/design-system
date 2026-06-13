import type { OrbitTokensRaw } from "@manovaspace/tokens";

import { TextField } from "../fields/text-field.js";
import { matchesFilter } from "../fields/token-search.js";
import { TokenSection } from "../fields/token-section.js";
import { setTokenPath } from "../token-mutations.js";

type ShadowSectionProps = {
  tokens: OrbitTokensRaw;
  filter: string;
  onChange: (tokens: OrbitTokensRaw) => void;
};

export function ShadowSection({
  tokens,
  filter,
  onChange,
}: ShadowSectionProps) {
  const entries = Object.entries(tokens.shadow).filter(([key]) =>
    matchesFilter(`shadow ${key}`, filter),
  );

  if (
    !matchesFilter("shadow", filter) &&
    entries.length === 0 &&
    filter.trim()
  ) {
    return null;
  }

  return (
    <TokenSection title="Shadow" description="Elevation shadows.">
      {entries.map(([key, value]) => (
        <TextField
          key={key}
          label={key}
          value={value}
          mono
          multiline
          onChange={(next) =>
            onChange(setTokenPath(tokens, `shadow.${key}`, next))
          }
        />
      ))}
    </TokenSection>
  );
}

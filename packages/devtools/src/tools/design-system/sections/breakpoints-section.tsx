import type { OrbitTokensRaw } from "@manovaspace/tokens";

import { PxField } from "../fields/px-field.js";
import { matchesFilter } from "../fields/token-search.js";
import { TokenSection } from "../fields/token-section.js";
import { setTokenPath } from "../token-mutations.js";

type BreakpointsSectionProps = {
  tokens: OrbitTokensRaw;
  filter: string;
  onChange: (tokens: OrbitTokensRaw) => void;
};

export function BreakpointsSection({
  tokens,
  filter,
  onChange,
}: BreakpointsSectionProps) {
  const entries = Object.entries(tokens.breakpoint).filter(([key]) =>
    matchesFilter(`breakpoint ${key}`, filter),
  );

  if (
    !matchesFilter("breakpoint", filter) &&
    entries.length === 0 &&
    filter.trim()
  ) {
    return null;
  }

  return (
    <TokenSection title="Breakpoints" description="Viewport breakpoints.">
      {entries.map(([key, value]) => (
        <PxField
          key={key}
          label={key}
          value={value}
          onChange={(next) =>
            onChange(setTokenPath(tokens, `breakpoint.${key}`, next))
          }
        />
      ))}
    </TokenSection>
  );
}

import type { OrbitTokensRaw } from "@manovaspace/tokens";

import { TokenSection } from "../fields/token-section.js";
import { BreakpointsSection } from "./breakpoints-section.js";
import { ColorsSection } from "./colors-section.js";
import { RadiiSection } from "./radii-section.js";
import { SemanticSection } from "./semantic-section.js";
import { ShadowSection } from "./shadow-section.js";
import { SpacingSection } from "./spacing-section.js";

type AdvancedSectionProps = {
  tokens: OrbitTokensRaw;
  filter: string;
  onChange: (tokens: OrbitTokensRaw) => void;
};

export function AdvancedSection({
  tokens,
  filter,
  onChange,
}: AdvancedSectionProps) {
  return (
    <TokenSection
      title="Advanced"
      description="Full token tree — brand scales, semantic, spacing, and more."
    >
      <div className="flex flex-col gap-4">
        <ColorsSection tokens={tokens} filter={filter} onChange={onChange} />
        <SemanticSection tokens={tokens} filter={filter} onChange={onChange} />
        <SpacingSection tokens={tokens} filter={filter} onChange={onChange} />
        <RadiiSection tokens={tokens} filter={filter} onChange={onChange} />
        <ShadowSection tokens={tokens} filter={filter} onChange={onChange} />
        <BreakpointsSection
          tokens={tokens}
          filter={filter}
          onChange={onChange}
        />
      </div>
    </TokenSection>
  );
}

import { COLOR_FAMILIES, type OrbitTokensRaw } from "@manovaspace/tokens";

import {
  COLOR_FAMILY_META,
  getColorFamilyUsages,
} from "../color-family-meta.js";
import { BrandColorFamilyRow } from "../fields/brand-color-family-row.js";
import { matchesFilter } from "../fields/token-search.js";
import { TokenSection } from "../fields/token-section.js";

type ColorsSectionProps = {
  tokens: OrbitTokensRaw;
  filter: string;
  onChange: (tokens: OrbitTokensRaw) => void;
};

function familyMatchesFilter(
  tokens: OrbitTokensRaw,
  family: string,
  filter: string,
): boolean {
  if (!filter.trim()) return true;
  const meta = COLOR_FAMILY_META[family];
  const usages = getColorFamilyUsages(tokens, family);
  const haystack = [family, meta?.title, meta?.role, meta?.summary, ...usages]
    .filter(Boolean)
    .join(" ");
  return matchesFilter(haystack, filter);
}

export function ColorsSection({
  tokens,
  filter,
  onChange,
}: ColorsSectionProps) {
  if (!matchesFilter("colors brand", filter) && filter.trim()) {
    const any = COLOR_FAMILIES.some((family) =>
      familyMatchesFilter(tokens, family, filter),
    );
    if (!any) return null;
  }

  return (
    <TokenSection
      title="Brand colors"
      description="Anchor per family; scales auto-generate."
      defaultOpen
    >
      <div className="flex flex-col gap-3.5">
        {COLOR_FAMILIES.filter((family) =>
          familyMatchesFilter(tokens, family, filter),
        ).map((family) => (
          <BrandColorFamilyRow
            key={family}
            family={family}
            tokens={tokens}
            onChange={onChange}
          />
        ))}
      </div>
    </TokenSection>
  );
}

import { defaultTokensRaw, type OrbitTokensRaw } from "@manovaspace/tokens";

export const SEMANTIC_TOKEN_LABELS: Record<string, string> = {
  background: "Page background",
  foreground: "Body text",
  card: "Card surface",
  "card-foreground": "Card text",
  popover: "Popover surface",
  "popover-foreground": "Popover text",
  primary: "Primary buttons",
  "primary-foreground": "Primary button text",
  secondary: "Secondary buttons",
  "secondary-foreground": "Secondary button text",
  muted: "Muted surfaces",
  "muted-foreground": "Hint / caption text",
  accent: "Accent surfaces",
  "accent-foreground": "Accent text",
  destructive: "Destructive actions",
  border: "Borders",
  input: "Input borders",
  ring: "Focus ring",
  "chart-1": "Chart color 1",
  "chart-2": "Chart color 2",
  "chart-3": "Chart color 3",
  "chart-4": "Chart color 4",
  "chart-5": "Chart color 5",
  sidebar: "Sidebar background",
  "sidebar-foreground": "Sidebar text",
  "sidebar-primary": "Sidebar active item",
  "sidebar-primary-foreground": "Sidebar active text",
  "sidebar-accent": "Sidebar hover surface",
  "sidebar-accent-foreground": "Sidebar hover text",
  "sidebar-border": "Sidebar border",
  "sidebar-ring": "Sidebar focus ring",
};

export const COLOR_FAMILY_META: Record<
  string,
  {
    title: string;
    role: string;
    summary: string;
    highlights: string[];
    paletteOnly?: boolean;
  }
> = {
  primary: {
    title: "Neutral",
    role: "Text, borders & surfaces",
    summary: "Neutrals for text, borders, and surfaces.",
    highlights: ["Body text", "Borders", "Secondary buttons"],
  },
  secondary: {
    title: "Secondary accent",
    role: "Chart palette",
    summary: "Chart accent; not the secondary button token.",
    highlights: ["Chart color 4"],
  },
  action: {
    title: "Brand",
    role: "Primary buttons & focus",
    summary: "Brand color for CTAs and focus.",
    highlights: ["Primary buttons", "Focus ring"],
  },
  tertiary: {
    title: "Deep accent",
    role: "Chart palette",
    summary: "Deep accent for charts.",
    highlights: ["Chart color 3"],
  },
  content: {
    title: "Light neutral",
    role: "Reserve palette",
    summary: "Unassigned palette; link via Semantic.",
    highlights: [],
    paletteOnly: true,
  },
  supporting: {
    title: "Soft accent",
    role: "Chart palette",
    summary: "Soft accent for charts.",
    highlights: ["Chart color 2"],
  },
};

const FAMILY_REF = (family: string) =>
  new RegExp(`\\{color\\.${family}\\.\\d+\\}`);

function collectUsagesFromSemantic(
  tokens: OrbitTokensRaw,
  family: string,
): string[] {
  const seen = new Set<string>();
  const usages: string[] = [];
  const familySteps = new Set(Object.values(tokens.color[family] ?? {}));

  for (const [key, value] of Object.entries(tokens.semantic.light)) {
    const linked = FAMILY_REF(family).test(value) || familySteps.has(value);
    if (!linked) continue;
    const label = SEMANTIC_TOKEN_LABELS[key] ?? key;
    if (seen.has(label)) continue;
    seen.add(label);
    usages.push(label);
  }

  return usages;
}

function mergeUsageLabels(...groups: string[][]): string[] {
  const seen = new Set<string>();
  const merged: string[] = [];
  for (const group of groups) {
    for (const label of group) {
      if (seen.has(label)) continue;
      seen.add(label);
      merged.push(label);
    }
  }
  return merged;
}

/** Theme wiring from default.json refs plus any custom links in the draft. */
export function getColorFamilyUsages(
  draftTokens: OrbitTokensRaw,
  family: string,
): string[] {
  return mergeUsageLabels(
    collectUsagesFromSemantic(defaultTokensRaw, family),
    collectUsagesFromSemantic(draftTokens, family),
  );
}

export function getUsageTeaser(
  usages: string[],
  highlights: string[],
  maxVisible = 2,
): { visible: string[]; extra: number } {
  const prioritized = [
    ...highlights.filter((item) => usages.includes(item)),
    ...usages.filter((item) => !highlights.includes(item)),
  ];
  const visible = prioritized.slice(0, maxVisible);
  return { visible, extra: Math.max(0, usages.length - visible.length) };
}

export function groupUsages(usages: string[]): Record<string, string[]> {
  const chart = usages.filter((u) => u.startsWith("Chart"));
  const sidebar = usages.filter((u) => u.startsWith("Sidebar"));
  const actions = usages.filter(
    (u) =>
      u.includes("button") || u === "Focus ring" || u === "Destructive actions",
  );
  const surfaces = usages.filter(
    (u) => !chart.includes(u) && !sidebar.includes(u) && !actions.includes(u),
  );

  const groups: Record<string, string[]> = {};
  if (actions.length) groups.Actions = actions;
  if (surfaces.length) groups.Surfaces = surfaces;
  if (sidebar.length) groups.Sidebar = sidebar;
  if (chart.length) groups.Charts = chart;
  return groups;
}

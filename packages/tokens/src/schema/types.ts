export type OrbitTokensRaw = {
  version: number;
  color: Record<string, Record<string, string>>;
  semantic: {
    light: Record<string, string>;
    dark?: Record<string, string>;
  };
  spacing: Record<string, string>;
  typography: {
    fontFamily: Record<string, string>;
    fontSize: Record<string, string>;
    lineHeight: Record<string, string>;
  };
  radii: Record<string, string>;
  shadow: Record<string, string>;
  breakpoint: Record<string, string>;
};

/** Resolved tokens — semantic.dark is always derived from light. */
export type OrbitTokens = Omit<OrbitTokensRaw, "semantic"> & {
  semantic: {
    light: Record<string, string>;
    dark: Record<string, string>;
  };
};

export type OrbitTokenOverride = Partial<{
  version: number;
  color: Partial<Record<string, Partial<Record<string, string>>>>;
  semantic: {
    light?: Partial<Record<string, string>>;
    /** @deprecated Ignored — dark is derived from light via HSL L inversion */
    dark?: Partial<Record<string, string>>;
  };
  spacing: Partial<Record<string, string>>;
  typography: {
    fontFamily?: Partial<Record<string, string>>;
    fontSize?: Partial<Record<string, string>>;
    lineHeight?: Partial<Record<string, string>>;
  };
  radii: Partial<Record<string, string>>;
  shadow: Partial<Record<string, string>>;
  breakpoint: Partial<Record<string, string>>;
}>;

export const COLOR_STEPS = [
  "50",
  "100",
  "200",
  "300",
  "400",
  "500",
  "600",
  "700",
  "800",
  "900",
  "950",
] as const;

export const COLOR_FAMILIES = [
  "primary",
  "secondary",
  "action",
  "tertiary",
  "content",
  "supporting",
] as const;

export const BRAND_ANCHORS: Record<string, string> = {
  "color.primary.900": "#0a0a0a",
  "color.secondary.800": "#525252",
  "color.action.500": "#2563eb",
  "color.tertiary.700": "#1d4ed8",
  "color.content.200": "#e5e5e5",
  "color.supporting.500": "#3b82f6",
};

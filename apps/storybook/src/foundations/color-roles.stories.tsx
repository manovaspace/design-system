import { M3_STATE_LAYER_OPACITIES } from "@manovaspace/tokens";
import { ColorSwatch } from "@manovaspace/ui";

const COLOR_FAMILIES = [
  "primary",
  "secondary",
  "action",
  "tertiary",
  "content",
  "supporting",
] as const;

const STEPS = [
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

const M3_ROLE_GROUPS = [
  {
    group: "Core M3 roles",
    tokens: [
      "md-sys-color-primary",
      "md-sys-color-on-primary",
      "md-sys-color-primary-container",
      "md-sys-color-on-primary-container",
      "md-sys-color-secondary",
      "md-sys-color-on-secondary",
      "md-sys-color-secondary-container",
      "md-sys-color-on-secondary-container",
      "md-sys-color-tertiary",
      "md-sys-color-on-tertiary",
      "md-sys-color-error",
      "md-sys-color-on-error",
    ],
  },
  {
    group: "Surfaces & outlines",
    tokens: [
      "md-sys-color-background",
      "md-sys-color-surface",
      "md-sys-color-surface-container-lowest",
      "md-sys-color-surface-container-low",
      "md-sys-color-surface-container",
      "md-sys-color-surface-container-high",
      "md-sys-color-surface-container-highest",
      "md-sys-color-on-surface",
      "md-sys-color-on-surface-variant",
      "md-sys-color-outline",
      "md-sys-color-outline-variant",
    ],
  },
  {
    group: "Colour-blind-safe charts & status",
    tokens: [
      "md-sys-color-chart-1",
      "md-sys-color-chart-2",
      "md-sys-color-chart-3",
      "md-sys-color-chart-4",
      "md-sys-color-chart-5",
      "md-sys-color-success",
      "md-sys-color-warning",
      "md-sys-color-error",
    ],
  },
] as const;

function ColorRolesOverview() {
  return (
    <div className="flex flex-col gap-6">
      {M3_ROLE_GROUPS.map(({ group, tokens }) => (
        <section key={group}>
          <h3 className="mb-3 text-sm font-semibold text-foreground">
            {group}
          </h3>
          <div className="grid grid-cols-[repeat(auto-fit,minmax(240px,1fr))] gap-3">
            {tokens.map((token) => (
              <div
                key={token}
                className="flex items-center gap-3 rounded-lg border border-border bg-card p-3"
              >
                <ColorSwatch token={token} size="md" title={token} />
                <code
                  dir="ltr"
                  className="break-all text-xs text-muted-foreground"
                >
                  --{token}
                </code>
              </div>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}

export default {
  title: "Foundations/Color roles",
  component: ColorRolesOverview,
  tags: ["autodocs"],
};

export const M3Roles = {};

export const LegacySwatches = {
  render: () => (
    <div className="grid grid-cols-[repeat(auto-fit,minmax(120px,1fr))] gap-4">
      {COLOR_FAMILIES.map((family) => (
        <div key={family}>
          <p className="mb-2 text-xs text-muted-foreground">{family}</p>
          <div className="flex flex-col gap-0.5">
            {STEPS.map((step) => (
              <ColorSwatch
                key={step}
                token={`mnv-${family}-${step}`}
                size="bar"
                title={`${family}-${step}`}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  ),
};

export const StateLayers = {
  render: () => (
    <div className="grid max-w-2xl grid-cols-[repeat(auto-fit,minmax(180px,1fr))] gap-3">
      {Object.entries(M3_STATE_LAYER_OPACITIES).map(([name, opacity]) => (
        <div
          key={name}
          className="flex flex-col gap-1 rounded-lg border border-border bg-card p-3"
        >
          <span className="text-xs font-medium text-foreground">{name}</span>
          <span className="text-lg font-semibold text-primary">
            {Math.round(opacity * 100)}%
          </span>
        </div>
      ))}
    </div>
  ),
};

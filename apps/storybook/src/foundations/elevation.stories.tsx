import { defaultTokensRaw } from "@manovaspace/tokens";
import type { Meta, StoryObj } from "@storybook/react-vite";

const M3_SURFACES = [
  {
    name: "surface-container-lowest",
    token: "--md-sys-color-surface-container-lowest",
  },
  {
    name: "surface-container-low",
    token: "--md-sys-color-surface-container-low",
  },
  { name: "surface-container", token: "--md-sys-color-surface-container" },
  {
    name: "surface-container-high",
    token: "--md-sys-color-surface-container-high",
  },
  {
    name: "surface-container-highest",
    token: "--md-sys-color-surface-container-highest",
  },
] as const;

function ElevationGallery() {
  return (
    <div className="space-y-8">
      <section>
        <h3 className="mb-3 text-sm font-semibold text-foreground">
          Shadow elevation tokens
        </h3>
        <div className="grid grid-cols-[repeat(auto-fit,minmax(180px,1fr))] gap-4">
          {Object.entries(defaultTokensRaw.shadow).map(([key, value]) => (
            <div
              key={key}
              className="flex flex-col justify-between gap-2 rounded-lg border border-border bg-card p-4"
              style={{ boxShadow: value }}
            >
              <code dir="ltr" className="text-xs font-medium text-foreground">
                --shadow-{key}
              </code>
              <span
                dir="ltr"
                className="break-all text-[11px] text-muted-foreground"
              >
                {value}
              </span>
            </div>
          ))}
        </div>
      </section>

      <section>
        <h3 className="mb-3 text-sm font-semibold text-foreground">
          M3 tonal surface levels
        </h3>
        <div className="grid grid-cols-[repeat(auto-fit,minmax(200px,1fr))] gap-3">
          {M3_SURFACES.map(({ name, token }) => (
            <div
              key={name}
              className="flex h-20 flex-col justify-between rounded-lg border border-border p-3"
              style={{ backgroundColor: `var(${token})` }}
            >
              <span className="text-xs font-medium text-foreground">
                {name}
              </span>
              <code dir="ltr" className="text-[11px] text-muted-foreground">
                {token}
              </code>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

const meta = {
  title: "Foundations/Elevation",
  component: ElevationGallery,
  tags: ["autodocs"],
} satisfies Meta<typeof ElevationGallery>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Levels: Story = {};

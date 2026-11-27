import { DENSITY_SCALES, resolveScaleTokens } from "@manovaspace/tokens";
import { Button, Input } from "@manovaspace/ui";
import type { Meta, StoryObj } from "@storybook/react-vite";

function DensityGallery() {
  return (
    <div className="grid grid-cols-[repeat(auto-fit,minmax(240px,1fr))] gap-4">
      {DENSITY_SCALES.map((density) => {
        const scale = resolveScaleTokens({
          shape: "default",
          density,
          motion: "standard",
        });
        return (
          <div
            key={density}
            className="space-y-3 rounded-lg border border-border bg-card p-4"
          >
            <div className="text-sm font-semibold capitalize text-foreground">
              {density}
            </div>
            <dl className="grid grid-cols-2 gap-1 text-xs text-muted-foreground">
              <dt>Default control</dt>
              <dd dir="ltr">{scale.densityVars.controlHeightDefault}</dd>
              <dt>Touch invariant</dt>
              <dd dir="ltr">{scale.densityVars.controlHeightTouch}</dd>
              <dt>Row min height</dt>
              <dd dir="ltr">{scale.densityVars.rowMinHeight}</dd>
              <dt>Space unit</dt>
              <dd dir="ltr">{scale.densityVars.spaceUnit}</dd>
            </dl>
            <div className="flex items-center gap-2 pt-2">
              <Input
                size="default"
                placeholder="Default"
                className="max-w-36"
              />
              <Button size="touch">44px+</Button>
            </div>
          </div>
        );
      })}
    </div>
  );
}

const meta = {
  title: "Foundations/Density",
  component: DensityGallery,
  tags: ["autodocs"],
} satisfies Meta<typeof DensityGallery>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Scales: Story = {};

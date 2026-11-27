import { resolveScaleTokens, SHAPE_SCALES } from "@manovaspace/tokens";
import type { Meta, StoryObj } from "@storybook/react-vite";

function ShapeGallery() {
  return (
    <div className="grid grid-cols-[repeat(auto-fit,minmax(220px,1fr))] gap-4">
      {SHAPE_SCALES.map((shape) => {
        const scale = resolveScaleTokens({
          shape,
          density: "default",
          motion: "standard",
        });
        return (
          <div
            key={shape}
            className="space-y-3 rounded-lg border border-border bg-card p-4"
          >
            <div className="text-sm font-semibold capitalize text-foreground">
              {shape}
            </div>
            <div
              className="flex h-10 items-center justify-center border border-input bg-background text-xs text-foreground"
              style={{ borderRadius: scale.radii.field }}
            >
              Field (<span dir="ltr">{scale.radii.field}</span>)
            </div>
            <div
              className="flex h-10 items-center justify-center bg-primary text-xs font-medium text-primary-foreground"
              style={{ borderRadius: scale.radii.button }}
            >
              Button (<span dir="ltr">{scale.radii.button}</span>)
            </div>
            <div className="grid grid-cols-3 gap-2 pt-1 text-[11px] text-muted-foreground">
              <span>sm: {scale.radii.sm}</span>
              <span>md: {scale.radii.md}</span>
              <span>lg: {scale.radii.lg}</span>
            </div>
          </div>
        );
      })}
    </div>
  );
}

const meta = {
  title: "Foundations/Shape",
  component: ShapeGallery,
  tags: ["autodocs"],
} satisfies Meta<typeof ShapeGallery>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Scales: Story = {};

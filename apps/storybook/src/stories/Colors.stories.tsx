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

function ColorSwatches() {
  return (
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
  );
}

export default {
  title: "Foundations/Color Swatches",
  component: ColorSwatches,
};

export const Swatches = {};

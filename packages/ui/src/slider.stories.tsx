import type { Meta, StoryObj } from "@storybook/react-vite";

import { Slider } from "./primitives/slider.js";

const meta = {
  title: "Components/Selection/Slider",
  component: Slider,
  tags: ["autodocs"],
} satisfies Meta<typeof Slider>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <div className="w-72 space-y-6">
      <Slider
        defaultValue={[40]}
        max={100}
        step={5}
        aria-label="Single value"
      />
      <Slider
        defaultValue={[20, 75]}
        max={100}
        step={5}
        aria-label="Range value"
      />
    </div>
  ),
};

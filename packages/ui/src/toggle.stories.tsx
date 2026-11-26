import type { Meta, StoryObj } from "@storybook/react-vite";

import { Toggle } from "./primitives/toggle.js";
import { ToggleGroup, ToggleGroupItem } from "./primitives/toggle-group.js";

const meta = {
  title: "Components/Selection/Toggle",
  component: Toggle,
  tags: ["autodocs"],
} satisfies Meta<typeof Toggle>;

export default meta;
type Story = StoryObj<typeof meta>;

export const SingleAndGroup: Story = {
  render: () => (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-2">
        <Toggle aria-label="Pin">Pin</Toggle>
        <Toggle variant="outline" defaultPressed aria-label="Outlined">
          Active
        </Toggle>
      </div>
      <ToggleGroup type="single" defaultValue="week" variant="outline">
        <ToggleGroupItem value="day">Day</ToggleGroupItem>
        <ToggleGroupItem value="week">Week</ToggleGroupItem>
        <ToggleGroupItem value="month">Month</ToggleGroupItem>
      </ToggleGroup>
    </div>
  ),
};

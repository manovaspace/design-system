import type { Meta, StoryObj } from "@storybook/react-vite";

import { Progress } from "./progress.js";

const meta = {
  title: "Components/Feedback/Progress",
  component: Progress,
  tags: ["autodocs"],
} satisfies Meta<typeof Progress>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Levels: Story = {
  render: () => (
    <div className="w-72 space-y-4">
      <Progress value={25} aria-label="Quarter progress" />
      <Progress value={65} aria-label="Two-thirds progress" />
      <Progress value={100} aria-label="Complete progress" />
    </div>
  ),
};

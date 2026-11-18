import { Switch } from "@manovaspace/ui/experimental";
import type { Meta, StoryObj } from "@storybook/react-vite";

const meta = {
  title: "Components/Switch",
  component: Switch,
  tags: ["autodocs"],
} satisfies Meta<typeof Switch>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Touch: Story = {
  render: () => (
    <div className="flex items-center gap-4">
      <Switch aria-label="Default" />
      <Switch aria-label="Touch" size="touch" defaultChecked />
    </div>
  ),
};

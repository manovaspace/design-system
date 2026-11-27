import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, userEvent, within } from "storybook/test";

import { Switch } from "./switch.js";

const meta = {
  title: "Components/Selection/Switch",
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
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const toggle = canvas.getByRole("switch", { name: "Default" });
    expect(toggle.getAttribute("aria-checked")).toBe("false");
    await userEvent.click(toggle);
    expect(toggle.getAttribute("aria-checked")).toBe("true");
  },
};

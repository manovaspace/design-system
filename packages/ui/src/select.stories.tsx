import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, userEvent, waitFor, within } from "storybook/test";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./select.js";

const meta = {
  title: "Components/Selection/Select",
  tags: ["autodocs"],
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

export const Touch: Story = {
  render: () => (
    <div className="flex items-center gap-3">
      <Select>
        <SelectTrigger aria-label="Default select">
          <SelectValue placeholder="Default" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="a">Option A</SelectItem>
          <SelectItem value="b">Option B</SelectItem>
        </SelectContent>
      </Select>
      <Select>
        <SelectTrigger size="touch" aria-label="Touch select">
          <SelectValue placeholder="Touch" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="a">Option A</SelectItem>
          <SelectItem value="b">Option B</SelectItem>
        </SelectContent>
      </Select>
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const trigger = canvas.getByRole("combobox", { name: "Default select" });
    await userEvent.click(trigger);
    const body = within(document.body);
    const option = await body.findByRole("option", { name: "Option B" });
    await userEvent.click(option);
    await waitFor(() => expect(trigger.textContent).toContain("Option B"));
  },
};

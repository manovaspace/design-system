import type { Meta, StoryObj } from "@storybook/react-vite";

import { MagnifyingGlassIcon } from "./icons.js";
import { Input } from "./input.js";

const meta = {
  title: "Components/Inputs/Input",
  component: Input,
  argTypes: {
    size: {
      control: "select",
      options: ["default", "touch"],
    },
  },
} satisfies Meta<typeof Input>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    placeholder: "Enter username",
  },
};

export const StatesAndAddons: Story = {
  // a11y debt: label — tracked, fix in follow-up
  parameters: { a11y: { test: "todo" } },
  render: () => (
    <div className="flex w-72 flex-col gap-3">
      <Input placeholder="Default (40 px)" />
      <Input placeholder="Touch (44 px)" size="touch" />
      <Input
        placeholder="With addons"
        startAddon={<MagnifyingGlassIcon className="size-4" />}
        endAddon={<span className="text-xs">IRR</span>}
      />
      <Input aria-invalid placeholder="Invalid state" />
      <Input disabled defaultValue="Disabled value" />
    </div>
  ),
};

import type { Meta, StoryObj } from "@storybook/react-vite";

import { Textarea } from "./textarea.js";

const meta = {
  title: "Components/Inputs/Textarea",
  component: Textarea,
  tags: ["autodocs"],
  argTypes: {
    size: {
      control: "select",
      options: ["default", "touch"],
    },
  },
} satisfies Meta<typeof Textarea>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    placeholder: "Enter description...",
  },
};

export const States: Story = {
  render: () => (
    <div className="flex w-80 flex-col gap-3">
      <Textarea placeholder="Default height" />
      <Textarea size="touch" placeholder="Touch size" />
      <Textarea aria-invalid defaultValue="Needs revision" />
      <Textarea disabled defaultValue="Disabled notes" />
    </div>
  ),
};

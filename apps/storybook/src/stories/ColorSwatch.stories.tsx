import { ColorSwatch } from "@manovaspace/ui";
import type { Meta, StoryObj } from "@storybook/react-vite";

const meta = {
  title: "Components/ColorSwatch",
  component: ColorSwatch,
  tags: ["autodocs"],
  argTypes: {
    size: {
      control: "select",
      options: ["xs", "sm", "md", "lg", "bar"],
    },
  },
} satisfies Meta<typeof ColorSwatch>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Token: Story = {
  args: {
    token: "mnv-action-500",
    size: "lg",
  },
};

export const ResolvedValue: Story = {
  args: {
    value: "var(--primary)",
    size: "md",
  },
};

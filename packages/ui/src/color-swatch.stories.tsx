import type { Meta, StoryObj } from "@storybook/react-vite";

import { ColorSwatch } from "./color-swatch.js";

const meta = {
  title: "Components/Data display/ColorSwatch",
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
    token: "md-sys-color-primary",
    size: "lg",
  },
};

export const ResolvedValue: Story = {
  args: {
    value: "var(--primary)",
    size: "md",
  },
};

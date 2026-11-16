import type { Meta, StoryObj } from "@storybook/react-vite";

import { PlusIcon } from "../icons.js";
import { FloatingActionButton } from "./floating-action-button.js";

const meta = {
  title: "Composed/FloatingActionButton",
  component: FloatingActionButton,
  tags: ["autodocs"],
  parameters: {
    layout: "fullscreen",
  },
} satisfies Meta<typeof FloatingActionButton>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    label: "New chat",
    icon: <PlusIcon />,
    onClick: () => {},
  },
};

export const Extended: Story = {
  args: {
    label: "New chat",
    icon: <PlusIcon />,
    extended: true,
    onClick: () => {},
  },
};

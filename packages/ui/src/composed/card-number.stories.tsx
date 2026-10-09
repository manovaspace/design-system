import type { Meta, StoryObj } from "@storybook/react-vite";
import type * as React from "react";

import { DirectionProvider } from "../direction-provider.js";
import { LockIcon } from "../icons.js";
import { CardNumber } from "./card-number.js";

const labels = {
  copy: "کپی شماره کارت",
  copied: "شماره کارت کپی شد",
};

const meta = {
  title: "Composed/CardNumber",
  component: CardNumber,
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
  },
  decorators: [
    (Story: React.ComponentType) => (
      <DirectionProvider direction="rtl">
        <div dir="rtl" className="p-6 text-sm text-muted-foreground">
          <Story />
        </div>
      </DirectionProvider>
    ),
  ],
} satisfies Meta<typeof CardNumber>;

export default meta;

type Story = StoryObj<typeof CardNumber>;

export const Copyable: Story = {
  args: {
    cardNumber: "6037991234567890",
    labels,
    showIcon: "always",
  },
};

export const StaticReadOnly: Story = {
  args: {
    cardNumber: "6037991234567890",
    labels,
    variant: "static",
  },
};

export const WithCustomIcon: Story = {
  args: {
    cardNumber: "6037991234567890",
    labels,
    showIcon: "always",
    icon: <LockIcon className="size-3.5 text-status-warning" />,
  },
};

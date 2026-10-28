import type { Meta, StoryObj } from "@storybook/react-vite";

import { HoldToConfirmButton } from "./hold-to-confirm-button.js";

const meta = {
  title: "Composed/HoldToConfirmButton",
  component: HoldToConfirmButton,
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
  },
} satisfies Meta<typeof HoldToConfirmButton>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    labelIdle: "Hold to confirm",
    ariaDescription: "Hold this button for 1 second to confirm the action",
    variant: "default",
    holdDurationMs: 1000,
    onConfirm: () => {},
    onShortTapHint: () => {},
  },
};

export const Destructive: Story = {
  args: {
    labelIdle: "Hold to delete",
    ariaDescription: "Hold this button to permanently delete your account",
    variant: "destructive",
    holdDurationMs: 1000,
    onConfirm: () => {},
    onShortTapHint: () => {},
  },
};

export const Caution: Story = {
  args: {
    labelIdle: "Hold to reset settings",
    ariaDescription: "Hold this button to reset all settings to defaults",
    variant: "caution",
    holdDurationMs: 1000,
    onConfirm: () => {},
    onShortTapHint: () => {},
  },
};

export const LongDuration: Story = {
  args: {
    labelIdle: "Hold 3s to revoke access",
    ariaDescription:
      "Hold this button for 3 seconds to revoke all active API keys",
    variant: "destructive",
    size: "lg",
    holdDurationMs: 3000,
    onConfirm: () => {},
    onShortTapHint: () => {},
  },
};

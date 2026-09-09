import type { Meta, StoryObj } from "@storybook/react-vite";
import * as React from "react";

import { Badge } from "../badge.js";
import { BoltIcon, CubeIcon } from "../icons.js";
import { SelectableOptionCard } from "./selectable-option-card.js";

const meta = {
  title: "Composed/SelectableOptionCard",
  component: SelectableOptionCard,
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
  },
} satisfies Meta<typeof SelectableOptionCard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    name: "plan",
    value: "pro",
    selected: true,
    label: "Professional",
    description: "Advanced analytics, unlimited team seats, and 24/7 support.",
    onSelect: () => {},
  },
};

export const Unselected: Story = {
  args: {
    name: "plan",
    value: "free",
    selected: false,
    label: "Free Tier",
    description: "Basic features for personal hobby projects.",
    onSelect: () => {},
  },
};

export const WithIconAndBadge: Story = {
  args: {
    name: "tier",
    value: "enterprise",
    selected: true,
    icon: <BoltIcon className="size-5" />,
    badge: <Badge variant="secondary">Popular</Badge>,
    label: "Enterprise Cluster",
    description: "Dedicated node pool with guaranteed sub-millisecond latency.",
    onSelect: () => {},
  },
};

export const WithoutSelectionBadge: Story = {
  args: {
    name: "tier",
    value: "standard",
    selected: true,
    showSelectionBadge: false,
    icon: <CubeIcon className="size-5" />,
    label: "Standard Instance",
    description: "Multi-tenant container instance.",
    onSelect: () => {},
  },
};

export const Disabled: Story = {
  args: {
    name: "tier",
    value: "archived",
    selected: false,
    disabled: true,
    label: "Legacy Archive",
    description: "This option has been retired and is no longer available.",
    onSelect: () => {},
  },
};

export function InteractiveGroup() {
  const [selected, setSelected] = React.useState("annual");

  return (
    <div className="flex w-full max-w-md flex-col gap-3">
      <SelectableOptionCard
        name="billing-cycle"
        value="monthly"
        selected={selected === "monthly"}
        onSelect={() => setSelected("monthly")}
        label="Monthly Billing"
        description="Pay per month, cancel anytime."
      />
      <SelectableOptionCard
        name="billing-cycle"
        value="annual"
        selected={selected === "annual"}
        onSelect={() => setSelected("annual")}
        label="Annual Billing"
        description="Pay upfront for 12 months with 2 months free."
        badge={<Badge variant="default">Save 20%</Badge>}
      />
      <SelectableOptionCard
        name="billing-cycle"
        value="lifetime"
        selected={selected === "lifetime"}
        onSelect={() => setSelected("lifetime")}
        label="Lifetime License"
        description="One-time payment for perpetual access."
        disabled
      />
    </div>
  );
}

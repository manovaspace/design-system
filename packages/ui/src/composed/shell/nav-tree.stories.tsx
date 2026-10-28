import type { Meta, StoryObj } from "@storybook/react-vite";
import type * as React from "react";

import { Badge } from "../../badge.js";
import {
  ArrowRightOnRectangleIcon,
  Cog6ToothIcon,
  HomeIcon,
  PackageIcon,
  UsersIcon,
} from "../../icons.js";
import { type NavItemConfig, NavTree } from "./nav-tree.js";

const sampleNavItems: NavItemConfig[] = [
  {
    href: "/dashboard",
    label: "Dashboard",
    icon: HomeIcon,
  },
  {
    href: "/orders",
    label: "Orders",
    icon: PackageIcon,
    badge: <Badge variant="secondary">24</Badge>,
  },
  {
    href: "/customers",
    label: "Customers",
    icon: UsersIcon,
    subsections: [
      {
        href: "/customers/directory",
        label: "All Customers",
      },
      {
        href: "/customers/vip",
        label: "VIP Tier",
        badge: <Badge variant="destructive">Hot</Badge>,
      },
      {
        href: "/customers/pending",
        label: "Pending Approvals",
        badge: "3",
      },
    ],
  },
  {
    href: "/settings",
    label: "Settings",
    icon: Cog6ToothIcon,
    subsections: [
      {
        href: "/settings/general",
        label: "General Settings",
      },
      {
        href: "/settings/security",
        label: "Security & Keys",
        badge: <Badge variant="destructive">Critical</Badge>,
      },
      {
        href: "/settings/integrations",
        label: "API Integrations",
      },
    ],
  },
  {
    href: "/logout",
    label: "Sign out",
    icon: ArrowRightOnRectangleIcon,
    isAction: true,
    onClick: () => console.log("Sign out clicked"),
  },
];

const meta = {
  title: "Composed/Shell/NavTree",
  component: NavTree,
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
  },
  decorators: [
    (Story: React.ComponentType) => (
      <div className="w-64 rounded-lg border border-border bg-sidebar p-3 text-sidebar-foreground">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof NavTree>;

export default meta;

type Story = StoryObj<typeof NavTree>;

export const Default: Story = {
  args: {
    items: sampleNavItems,
  },
};

export const ActiveItem: Story = {
  args: {
    items: sampleNavItems,
    currentPath: "/orders",
  },
};

export const DeepSubsections: Story = {
  args: {
    items: sampleNavItems,
    currentPath: "/settings/security",
  },
};

import type { Meta, StoryObj } from "@storybook/react-vite";

import { Cog6ToothIcon, HomeIcon, PackageIcon, WalletIcon } from "./icons.js";
import { MobileBottomTabBar } from "./mobile-bottom-tab-bar.js";

const ITEMS = [
  {
    id: "home",
    href: "/",
    label: "Home",
    icon: <HomeIcon className="size-5" />,
  },
  {
    id: "finance",
    href: "/finance",
    label: "Finance",
    icon: <WalletIcon className="size-5" />,
  },
  {
    id: "inventory",
    href: "/inventory",
    label: "Stock",
    icon: <PackageIcon className="size-5" />,
  },
  {
    id: "settings",
    href: "/settings",
    label: "Settings",
    icon: <Cog6ToothIcon className="size-5" />,
  },
];

const meta = {
  title: "Components/Navigation/MobileBottomTabBar",
  component: MobileBottomTabBar,
  tags: ["autodocs"],
  parameters: { layout: "fullscreen" },
} satisfies Meta<typeof MobileBottomTabBar>;

export default meta;
type Story = StoryObj;

export const Default: Story = {
  render: () => (
    <div className="relative h-48 w-full max-w-sm border border-border bg-background">
      <MobileBottomTabBar
        items={ITEMS}
        activeId="finance"
        aria-label="Primary mobile navigation"
      />
    </div>
  ),
};

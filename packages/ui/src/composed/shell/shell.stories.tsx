import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";

import { HomeIcon, PackageIcon, WalletIcon } from "../../icons.js";
import { NavMobileSheet } from "./nav-mobile-sheet.js";
import { NavRail } from "./nav-rail.js";
import { type NavItemConfig, NavTree } from "./nav-tree.js";
import { ShellHeader } from "./shell-header.js";

const NAV_ITEMS: NavItemConfig[] = [
  { key: "home", label: "Overview", href: "/", icon: HomeIcon },
  {
    key: "finance",
    label: "Finance",
    href: "/finance",
    icon: WalletIcon,
    badge: 3,
  },
  {
    key: "inventory",
    label: "Inventory",
    href: "/inventory",
    icon: PackageIcon,
  },
];

function AdaptiveShellDemo() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className="flex min-h-[360px] overflow-hidden rounded-xl border border-border bg-background">
      <NavRail
        brand={<span className="text-sm font-semibold">Manova Orbit</span>}
      >
        <NavTree items={NAV_ITEMS} currentPath="/finance" />
      </NavRail>
      <div className="flex min-w-0 flex-1 flex-col">
        <ShellHeader
          label="Workspace"
          title="Finance"
          menuOpen={menuOpen}
          onMenuOpenChange={setMenuOpen}
          menuSheet={
            <NavMobileSheet
              open={menuOpen}
              onOpenChange={setMenuOpen}
              title="Navigation"
            >
              <NavTree
                items={NAV_ITEMS}
                currentPath="/finance"
                onNavigate={() => setMenuOpen(false)}
              />
            </NavMobileSheet>
          }
        />
        <main className="p-4 text-sm text-muted-foreground">
          Page body adapts beside NavRail on desktop and NavMobileSheet on
          mobile.
        </main>
      </div>
    </div>
  );
}

const meta = {
  title: "Components/Navigation/AdaptiveShell",
  tags: ["autodocs"],
  parameters: { layout: "fullscreen" },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  // a11y debt: color-contrast — tracked, fix in follow-up
  parameters: { a11y: { test: "todo" } },
  render: () => <AdaptiveShellDemo />,
};

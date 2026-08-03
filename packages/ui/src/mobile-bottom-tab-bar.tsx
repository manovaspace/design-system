"use client";

import type { ComponentPropsWithoutRef, ComponentType, ReactNode } from "react";

import { cn } from "./lib/utils.js";

export const MOBILE_TAB_INDICATOR_WIDTH_PX = 24;

/** RTL-safe inset for the active tab top-line indicator. */
export function mobileTabIndicatorInset(
  activeIndex: number,
  itemCount: number,
  widthPx: number = MOBILE_TAB_INDICATOR_WIDTH_PX,
): string {
  const n = Math.max(1, itemCount);
  const i = Math.min(Math.max(0, activeIndex), n - 1);
  const pct = 100 / n;
  return `calc(${i} * ${pct}% + ${pct / 2}% - ${widthPx / 2}px)`;
}

export type MobileBottomTabItem = {
  id: string;
  href: string;
  label: ReactNode;
  icon: ReactNode | ((active: boolean) => ReactNode);
};

export type MobileBottomTabLinkProps = {
  href: string;
  className?: string;
  children?: ReactNode;
  "aria-current"?: "page" | undefined;
};

export type MobileBottomTabBarProps = {
  items: MobileBottomTabItem[];
  activeId: string;
  linkComponent?: ComponentType<MobileBottomTabLinkProps>;
  className?: string;
  /** Accessible name for the nav landmark. */
  "aria-label"?: string;
  indicatorWidthPx?: number;
} & Omit<ComponentPropsWithoutRef<"nav">, "children" | "aria-label">;

function DefaultLink({
  href,
  className,
  children,
  "aria-current": ariaCurrent,
}: MobileBottomTabLinkProps) {
  return (
    <a href={href} className={className} aria-current={ariaCurrent}>
      {children}
    </a>
  );
}

/** Fixed mobile bottom tab bar with a short top-line active indicator. */
export function MobileBottomTabBar({
  items,
  activeId,
  linkComponent: Link = DefaultLink,
  className,
  "aria-label": ariaLabel = "Primary",
  indicatorWidthPx = MOBILE_TAB_INDICATOR_WIDTH_PX,
  ...props
}: MobileBottomTabBarProps) {
  const activeIndex = Math.max(
    0,
    items.findIndex((item) => item.id === activeId),
  );
  const cols = items.length;

  return (
    <nav
      data-slot="mobile-bottom-tab-bar"
      className={cn(
        "fixed inset-x-0 bottom-0 z-40 border-t border-border bg-background",
        className,
      )}
      style={{
        paddingBottom: "env(safe-area-inset-bottom, 0px)",
      }}
      aria-label={ariaLabel}
      {...props}
    >
      <div
        className="relative mx-auto grid w-full max-w-lg"
        style={{ gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))` }}
      >
        {/* ponytail: no transition — consumers can add transition on inset-inline-start */}
        <span
          aria-hidden
          data-slot="mobile-tab-indicator"
          className="pointer-events-none absolute top-0 h-0.5 rounded-full bg-foreground"
          style={{
            width: indicatorWidthPx,
            insetInlineStart: mobileTabIndicatorInset(
              activeIndex,
              cols,
              indicatorWidthPx,
            ),
          }}
        />
        {items.map((item, index) => {
          const active = index === activeIndex;
          const icon =
            typeof item.icon === "function" ? item.icon(active) : item.icon;
          return (
            <Link
              key={item.id}
              href={item.href}
              className={cn(
                "flex flex-col items-center gap-1 px-1 pt-3 pb-2",
                active ? "text-foreground" : "text-muted-foreground",
              )}
              aria-current={active ? "page" : undefined}
            >
              {icon}
              <span className="text-[11px] font-medium leading-none">
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

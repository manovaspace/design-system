"use client";

import { Slot } from "radix-ui";
import type * as React from "react";
import type { JSX } from "react";

import { CheckIcon, ChevronRightIcon } from "../icons.js";
import { cn } from "../lib/utils.js";

export type RowListProps = React.ComponentProps<"ul"> & {
  variant?: "flush" | "inset";
};

export type RowProps = Omit<React.ComponentProps<"li">, "children"> & {
  children: React.ReactNode;
  leading?: React.ReactNode;
  trailing?: React.ReactNode;
  chevron?: boolean;
  selected?: boolean;
  asChild?: boolean;
};

/**
 * Low-margin borderless row list container.
 * Default variant is `inset`; `flush` variant cancels the page gutter on phones.
 */
export function RowList({
  variant = "inset",
  className,
  role = "list",
  children,
  ...props
}: RowListProps): JSX.Element {
  return (
    <ul
      role={role}
      data-slot="row-list"
      data-variant={variant}
      className={cn("ui-row-list", className)}
      {...props}
    >
      {children}
    </ul>
  );
}

/**
 * Borderless low-margin row surface.
 * Touch targets >= 44px, min-height 3.5rem (56px).
 * Separator uses 1px solid var(--row-divider).
 * Selected = brand 8% tint + trailing check icon.
 * Chevron mirrors in RTL.
 */
export function Row({
  className,
  children,
  leading,
  trailing,
  chevron = false,
  selected = false,
  asChild = false,
  ...props
}: RowProps): JSX.Element {
  const Comp = asChild ? Slot.Root : "li";

  return (
    <Comp
      data-slot="row"
      data-has-leading={leading ? "true" : undefined}
      data-selected={selected ? "true" : undefined}
      aria-current={
        selected ? (props["aria-current"] ?? "true") : props["aria-current"]
      }
      className={cn("ui-row", className)}
      {...props}
    >
      {leading && (
        <div data-slot="row-leading" className="ui-row__leading">
          {leading}
        </div>
      )}
      <Slot.Slottable>{children}</Slot.Slottable>
      {(trailing || selected || chevron) && (
        <div data-slot="row-trailing" className="ui-row__trailing">
          {trailing}
          {selected && (
            <CheckIcon
              data-slot="row-check"
              className="size-4 shrink-0 text-primary"
              aria-hidden="true"
            />
          )}
          {chevron && (
            <ChevronRightIcon
              data-slot="row-chevron"
              data-mirrored-icon="true"
              data-mirrored="true"
              className="size-4 shrink-0 text-muted-foreground rtl:rotate-180"
              aria-hidden="true"
            />
          )}
        </div>
      )}
    </Comp>
  );
}

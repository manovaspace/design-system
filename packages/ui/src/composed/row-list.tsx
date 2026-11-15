"use client";

import { Slot } from "radix-ui";
import type * as React from "react";
import type { JSX } from "react";

import { CheckIcon, ChevronRightIcon } from "../icons.js";
import { cn } from "../lib/utils.js";

export type RowListProps = React.ComponentProps<"ul"> & {
  variant?: "flush" | "inset";
};

export type RowProps = Omit<React.ComponentProps<"li">, "children" | "role"> & {
  children: React.ReactNode;
  leading?: React.ReactNode;
  trailing?: React.ReactNode;
  chevron?: boolean;
  /**
   * Marks the current item of a single-choice list. Sets the selected look
   * (tint and check) and `aria-current`.
   */
  selected?: boolean;
  /**
   * Toggle state for a pressable row in a multi-select list. Sets `aria-pressed`
   * on the action and shows the selected look (tint and check). Applies only to
   * `onPress` rows; use `selected` for the current item of a single-choice list.
   */
  pressed?: boolean;
  /**
   * Renders the single child element (for example an anchor or a router link)
   * as the row action. The child keeps its own children as the row content.
   * Wins over `onPress`: when both are given, `onPress` is ignored.
   */
  asChild?: boolean;
  /**
   * Makes the row pressable. The content is wrapped in a `button type="button"`
   * inside the `li`, so the list item role is kept.
   */
  onPress?: () => void;
  /** Disables the pressable action. Applies only to `onPress` rows. */
  disabled?: boolean;
  /**
   * @deprecated `role` on `Row` removes the list item role and breaks list
   * semantics. Use `onPress` or `asChild` for an interactive row. Still passed
   * through to the `li`; a development warning is logged.
   */
  role?: React.AriaRole;
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

const warnedRoleMessages = new Set<string>();

function warnNonListitemRole(role: string): void {
  if (process.env.NODE_ENV === "production") {
    return;
  }
  const message = `Row: role="${role}" removes the list item role. Use onPress or asChild for an interactive row.`;
  if (warnedRoleMessages.has(message)) {
    return;
  }
  warnedRoleMessages.add(message);
  console.warn(message);
}

/**
 * Borderless low-margin row. The root is always an `li`, so it stays valid
 * inside `RowList`. Three modes, one DOM shape: `li.ui-row` > [leading] +
 * content + [trailing].
 *
 * - Static (no `onPress`, no `asChild`): children render directly in the `li`.
 * - Pressable (`onPress`): children render inside a `button type="button"`
 *   with `data-slot="row-action"`. `disabled` disables that button.
 * - Link (`asChild`): the single child element renders as the action with
 *   `data-slot="row-action"`. `asChild` wins over `onPress`.
 *
 * Interactive modes set `data-interactive="true"` on the `li`; `leading` and
 * `trailing` are siblings of the action, never inside it.
 *
 * Touch targets >= 44px, min-height 3.5rem (56px).
 * Separator uses 1px solid var(--row-divider).
 * Selected = brand 8% tint + trailing check icon; `aria-current` goes on the
 * action in interactive modes and on the `li` otherwise. `pressed` (pressable
 * rows only) gives the same selected look and sets `aria-pressed` on the action
 * for multi-select toggles; it never sets `aria-current`.
 * Chevron mirrors in RTL.
 */
export function Row({
  className,
  children,
  leading,
  trailing,
  chevron = false,
  selected = false,
  pressed,
  asChild = false,
  onPress,
  disabled = false,
  role,
  "aria-current": ariaCurrentProp,
  ...props
}: RowProps): JSX.Element {
  if (role !== undefined && role !== "listitem") {
    warnNonListitemRole(role);
  }

  const pressable = !asChild && onPress !== undefined;
  const interactive = asChild || pressable;
  const ariaCurrent = selected ? (ariaCurrentProp ?? "true") : ariaCurrentProp;
  const pressedActive = pressable && pressed === true;
  const showSelected = selected || pressedActive;

  let action: React.ReactNode;
  if (asChild) {
    action = (
      <Slot.Root
        data-slot="row-action"
        className="ui-row__action"
        aria-current={ariaCurrent}
      >
        {children}
      </Slot.Root>
    );
  } else if (pressable) {
    action = (
      <button
        type="button"
        data-slot="row-action"
        className="ui-row__action"
        onClick={onPress}
        disabled={disabled}
        aria-current={ariaCurrent}
        aria-pressed={pressed}
      >
        {children}
      </button>
    );
  } else {
    action = children;
  }

  return (
    <li
      data-slot="row"
      data-has-leading={leading ? "true" : undefined}
      data-selected={showSelected ? "true" : undefined}
      data-interactive={interactive ? "true" : undefined}
      data-disabled={pressable && disabled ? "true" : undefined}
      aria-current={interactive ? undefined : ariaCurrent}
      role={role}
      className={cn("ui-row", className)}
      {...props}
    >
      {leading && (
        <div data-slot="row-leading" className="ui-row__leading">
          {leading}
        </div>
      )}
      {action}
      {(trailing || showSelected || chevron) && (
        <div data-slot="row-trailing" className="ui-row__trailing">
          {trailing}
          {showSelected && (
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
    </li>
  );
}

"use client";

import type * as React from "react";

import { cn } from "../lib/utils.js";

export type BarListItem = {
  /** Stable key. */
  key: string;
  /** Visible label, for example a category name. */
  label: React.ReactNode;
  /** Non-negative magnitude used for the bar width. Bars are relative to the largest item. */
  value: number;
  /** Already-formatted value text shown at the end of the row. The caller formats money and digits. */
  valueLabel: React.ReactNode;
  /** Optional secondary text under the label, for example "3 receipts". */
  description?: React.ReactNode;
};

export type BarListProps = {
  items: BarListItem[];
  /** Accessible name for the list, for example "Spend by category". Required. */
  label: string;
  /** Shown instead of the list when items is empty. */
  emptyState?: React.ReactNode;
  className?: string;
};

/** Treats NaN, infinite and negative values as 0. */
function sanitize(value: number): number {
  return Number.isFinite(value) && value > 0 ? value : 0;
}

/**
 * Ranked horizontal bar list for totals, such as spend per category.
 * Renders items in the order given; bars are scaled to the largest value.
 * Bars grow from the inline start edge, so RTL pages mirror automatically.
 */
export function BarList({ items, label, emptyState, className }: BarListProps) {
  if (items.length === 0) {
    return emptyState ? (
      <div data-slot="bar-list-empty">{emptyState}</div>
    ) : null;
  }

  const max = items.reduce(
    (acc, item) => Math.max(acc, sanitize(item.value)),
    0,
  );

  return (
    <ol
      aria-label={label}
      data-slot="bar-list"
      className={cn("flex flex-col gap-3", className)}
    >
      {items.map((item) => {
        const value = sanitize(item.value);
        const pct =
          max > 0 ? Math.min(100, Math.max(0, (value / max) * 100)) : 0;

        return (
          <li
            key={item.key}
            data-slot="bar-list-item"
            className="flex flex-col gap-1.5"
          >
            <div className="flex items-baseline justify-between gap-3 text-sm">
              <div className="min-w-0">
                <div className="truncate text-foreground">{item.label}</div>
                {item.description && (
                  <div className="truncate text-xs text-muted-foreground">
                    {item.description}
                  </div>
                )}
              </div>
              <span className="shrink-0 tabular-nums font-medium text-foreground font-[family-name:var(--font-data)]">
                {item.valueLabel}
              </span>
            </div>
            <div
              data-slot="bar-list-track"
              className="h-2 w-full overflow-hidden rounded-full bg-muted"
            >
              {pct > 0 && (
                <div
                  data-slot="bar-list-bar"
                  aria-hidden="true"
                  className="h-full rounded-full bg-primary"
                  style={{ inlineSize: `${pct}%` }}
                />
              )}
            </div>
          </li>
        );
      })}
    </ol>
  );
}

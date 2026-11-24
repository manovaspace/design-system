"use client";

import type * as React from "react";
import { Children, useId } from "react";

import { cn } from "../../lib/utils.js";
import { RowList } from "../row-list.js";

/** @experimental */
export type SummaryPageProps = {
  /** Page name; the section's accessible name. The app shell shows the visible title. */
  "aria-label": string;
  /** `Stat` elements. 2 columns below lg, 4 from lg. */
  stats?: React.ReactNode;
  /** Items that need action now. `children` are `Row`s; empty → `emptyMessage`. */
  attention?: {
    title: string;
    emptyMessage: string;
    children?: React.ReactNode;
  };
  /** The module's pages. `children` are `Row asChild chevron` links. */
  links: { title: string; children: React.ReactNode };
  className?: string;
};

/**
 * Module home: stats, attention, links.
 *
 * Usage rules:
 * - One per module home.
 * - Stats are kit `Stat`s.
 * - Attention lists only items that need action now. When empty, it says so with `emptyMessage`.
 * - Links are `Row asChild chevron` wrapping the router link, one per module page.
 * - No hover-only cards or icon grids.
 * @experimental
 */
export function SummaryPage({
  "aria-label": ariaLabel,
  stats,
  attention,
  links,
  className,
}: SummaryPageProps) {
  const attentionId = useId();
  const linksId = useId();
  const attentionEmpty =
    attention !== undefined &&
    Children.toArray(attention.children).length === 0;

  return (
    <section
      aria-label={ariaLabel}
      data-slot="summary-page"
      className={cn("mx-auto max-w-5xl space-y-6 px-4 py-6 sm:px-6", className)}
    >
      {stats != null && (
        <div
          data-slot="summary-page-stats"
          className="grid grid-cols-2 gap-3 lg:grid-cols-4"
        >
          {stats}
        </div>
      )}
      {attention !== undefined && (
        <section
          aria-labelledby={attentionId}
          data-slot="summary-page-attention"
          className="space-y-2"
        >
          <h2
            id={attentionId}
            className="text-base font-semibold text-foreground"
          >
            {attention.title}
          </h2>
          {attentionEmpty ? (
            <p className="text-sm text-muted-foreground">
              {attention.emptyMessage}
            </p>
          ) : (
            <RowList>{attention.children}</RowList>
          )}
        </section>
      )}
      <section
        aria-labelledby={linksId}
        data-slot="summary-page-links"
        className="space-y-2"
      >
        <h2 id={linksId} className="text-base font-semibold text-foreground">
          {links.title}
        </h2>
        <RowList>{links.children}</RowList>
      </section>
    </section>
  );
}

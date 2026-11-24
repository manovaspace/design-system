/**
 * Entity Browser page chrome — header, command bar slot, table shell, footer.
 * Directory and Queue presets share this shell; pages own data + columns.
 */
"use client";

import type { ReactNode } from "react";
import { cn } from "../../lib/utils.js";
import { EntityBrowserCommandBarProvider } from "./entity-browser-command-bar-context.js";

export type EntityBrowserPreset = "directory" | "queue";

export interface EntityBrowserProps {
  preset?: EntityBrowserPreset;
  /**
   * Visible section heading. Omit when the app shell header already shows the
   * page title; the section is then named by `aria-label`.
   */
  title?: string;
  /** Accessible section name used when `title` is absent. */
  "aria-label"?: string;
  description?: string;
  primaryAction?: ReactNode;
  /** Command bar slot — omit for Queue preset until search/filters exist. */
  toolbar?: ReactNode;
  /**
   * Result count or status. With a title it sits in the command bar; without
   * a title it moves to the header row.
   */
  resultMeta?: ReactNode;
  /**
   * Pins the command bar (toolbar + result meta) to the top of the scrolling
   * page. The top offset is `--entity-browser-sticky-top` (default `0px`); set
   * it on a parent to clear a fixed header.
   */
  stickyToolbar?: boolean;
  /** Body frame. "card" (default): bordered, rounded, shadowed. "flat": no border, radius or shadow, rows run full width. */
  frame?: "card" | "flat";
  children: ReactNode;
  footer?: ReactNode;
  className?: string;
}

export function EntityBrowser({
  preset = "directory",
  title,
  "aria-label": ariaLabel,
  description,
  primaryAction,
  toolbar,
  resultMeta,
  stickyToolbar = false,
  frame = "card",
  children,
  footer,
  className,
}: EntityBrowserProps) {
  const hasTitle = Boolean(title);
  const hasHeader =
    hasTitle || Boolean(description || resultMeta || primaryAction);
  // Without a title, resultMeta renders in the header row only (not twice).
  const barMeta = hasTitle ? resultMeta : undefined;

  return (
    <section
      aria-label={hasTitle ? title : ariaLabel}
      data-preset={preset}
      className={cn(
        "mx-auto max-w-6xl space-y-4 px-4 py-6 sm:px-6 lg:px-8",
        className,
      )}
    >
      {hasHeader && hasTitle ? (
        <div
          data-slot="entity-browser-header"
          className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between"
        >
          <div className="min-w-0">
            <h2 className="text-2xl font-semibold tracking-tight">{title}</h2>
            {description ? (
              <p className="mt-2 text-sm text-muted-foreground">
                {description}
              </p>
            ) : null}
          </div>
          {primaryAction ? (
            <div className="shrink-0 sm:pt-0.5">{primaryAction}</div>
          ) : null}
        </div>
      ) : null}

      {hasHeader && !hasTitle ? (
        <div
          data-slot="entity-browser-header"
          className="flex items-center justify-between gap-4"
        >
          <div className="flex min-w-0 flex-wrap items-center gap-x-4 gap-y-2">
            {description ? (
              <p className="text-sm text-muted-foreground">{description}</p>
            ) : null}
            {resultMeta ? <div>{resultMeta}</div> : null}
          </div>
          {primaryAction ? (
            <div className="shrink-0">{primaryAction}</div>
          ) : null}
        </div>
      ) : null}

      {(toolbar ?? barMeta) ? (
        <EntityBrowserCommandBarProvider suffix={barMeta}>
          <div
            className={cn(
              "space-y-2",
              stickyToolbar &&
                "sticky top-[var(--entity-browser-sticky-top,0px)] z-20 -mx-4 bg-background px-4 py-2 sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8",
            )}
            data-sticky={stickyToolbar ? "true" : undefined}
          >
            {toolbar}
            {!toolbar && barMeta ? (
              <div className="flex min-h-7 items-center justify-start">
                {barMeta}
              </div>
            ) : null}
          </div>
        </EntityBrowserCommandBarProvider>
      ) : null}

      <div
        data-slot="entity-browser-body"
        data-frame={frame}
        className={cn(
          "overflow-hidden",
          frame === "card" && "rounded-xl border border-border shadow-sm",
        )}
      >
        {children}
      </div>

      {footer}
    </section>
  );
}

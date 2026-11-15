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
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
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
        <div className="flex items-center justify-between gap-4">
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
          <div className="space-y-2">
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
        className="overflow-hidden rounded-xl border border-border shadow-sm"
      >
        {children}
      </div>

      {footer}
    </section>
  );
}

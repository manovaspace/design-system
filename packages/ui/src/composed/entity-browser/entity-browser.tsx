"use client";

import type { ReactNode } from "react";
import { cn } from "../../lib/utils";
import { EntityBrowserCommandBarProvider } from "./entity-command-bar-context";

export type EntityBrowserPreset = "directory" | "queue";

export interface EntityBrowserProps {
  preset?: EntityBrowserPreset;
  title: string;
  description?: string;
  primaryAction?: ReactNode;
  toolbar?: ReactNode;
  resultMeta?: ReactNode;
  children: ReactNode;
  footer?: ReactNode;
  className?: string;
}

/**
 * Entity Browser page chrome — header, command bar slot, table shell, footer.
 * Directory and Queue presets share this shell; pages own data + columns.
 */
export function EntityBrowser({
  preset = "directory",
  title,
  description,
  primaryAction,
  toolbar,
  resultMeta,
  children,
  footer,
  className,
}: EntityBrowserProps) {
  return (
    <main
      data-preset={preset}
      className={cn(
        "mx-auto max-w-6xl space-y-4 px-4 py-6 sm:px-6 lg:px-8",
        className,
      )}
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <h2 className="text-2xl font-semibold tracking-tight">{title}</h2>
          {description ? (
            <p className="mt-2 text-sm text-muted-foreground">{description}</p>
          ) : null}
        </div>
        {primaryAction ? (
          <div className="shrink-0 sm:pt-0.5">{primaryAction}</div>
        ) : null}
      </div>

      {(toolbar ?? resultMeta) ? (
        <EntityBrowserCommandBarProvider suffix={resultMeta}>
          <div className="space-y-2">
            {toolbar}
            {!toolbar && resultMeta ? (
              <div className="flex min-h-7 items-center justify-start">
                {resultMeta}
              </div>
            ) : null}
          </div>
        </EntityBrowserCommandBarProvider>
      ) : null}

      <div className="overflow-hidden rounded-xl border border-border bg-card shadow-xs">
        {children}
      </div>

      {footer}
    </main>
  );
}

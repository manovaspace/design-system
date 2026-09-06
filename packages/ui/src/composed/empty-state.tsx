"use client";

import type * as React from "react";

import { cn } from "../lib/utils.js";

export type EmptyStateProps = {
  title: React.ReactNode;
  description?: React.ReactNode;
  action?: React.ReactNode;
  icon?: React.ReactNode;
  className?: string;
};

export function EmptyState({
  title,
  description,
  action,
  icon,
  className,
}: EmptyStateProps) {
  return (
    <div
      role="status"
      aria-live="polite"
      className={cn(
        "flex min-h-32 flex-col items-center justify-center gap-3 rounded-[var(--radius-lg)] border border-dashed border-border p-6 text-center",
        className,
      )}
    >
      {icon ? (
        <div className="text-muted-foreground" aria-hidden="true">
          {icon}
        </div>
      ) : null}
      <div className="space-y-1">
        <h2 className="font-semibold text-foreground">{title}</h2>
        {description ? (
          <p className="text-sm text-muted-foreground">{description}</p>
        ) : null}
      </div>
      {action ? <div className="pt-1">{action}</div> : null}
    </div>
  );
}

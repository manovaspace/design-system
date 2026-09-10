/**
 * Shared mobile list body states — loading skeletons, error, empty, emptyFiltered.
 */
"use client";

import type { ReactNode } from "react";
import { Button } from "../../button.js";

const SKELETON_KEYS = ["sk-1", "sk-2", "sk-3", "sk-4", "sk-5", "sk-6"] as const;

export function EntityMobileLoadingList({ rows = 4 }: { rows?: number }) {
  const keys = SKELETON_KEYS.slice(0, Math.min(rows, SKELETON_KEYS.length));

  return (
    <div className="divide-y divide-border">
      {keys.map((key) => (
        <div key={key} className="p-4" aria-hidden>
          <div className="flex items-start justify-between gap-3">
            <div className="h-5 w-32 animate-pulse rounded bg-muted/50 motion-reduce:animate-none" />
            <div className="h-6 w-16 animate-pulse rounded-full bg-muted/50 motion-reduce:animate-none" />
          </div>
          <div className="mt-3 space-y-2">
            <div className="h-4 w-full animate-pulse rounded bg-muted/40 motion-reduce:animate-none" />
            <div className="h-4 w-2/3 animate-pulse rounded bg-muted/40 motion-reduce:animate-none" />
          </div>
          <div className="mt-4 h-9 animate-pulse rounded-md bg-muted/50 motion-reduce:animate-none" />
        </div>
      ))}
    </div>
  );
}

export function EntityMobileMessage({
  children,
  tone = "muted",
}: {
  children: ReactNode;
  tone?: "muted" | "destructive";
}) {
  return (
    <p
      className={
        tone === "destructive"
          ? "px-4 py-10 text-center text-sm text-destructive"
          : "px-4 py-10 text-center text-sm text-muted-foreground"
      }
    >
      {children}
    </p>
  );
}

export function EntityMobileEmptyFiltered({
  message,
  clearLabel,
  onClear,
}: {
  message: string;
  clearLabel: string;
  onClear: () => void;
}) {
  return (
    <div className="flex flex-col items-center gap-3 px-4 py-10 text-center">
      <p className="text-sm text-muted-foreground">{message}</p>
      <Button type="button" variant="outline" size="sm" onClick={onClear}>
        {clearLabel}
      </Button>
    </div>
  );
}

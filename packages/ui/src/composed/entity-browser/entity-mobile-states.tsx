"use client";

import type { ReactNode } from "react";
import { Button } from "../../button";
import { cn } from "../../lib/utils";
import { Skeleton } from "../../skeleton";

export function EntityMobileLoadingList({ rows = 4 }: { rows?: number }) {
  return (
    <div className="divide-y divide-border border-b border-border">
      {Array.from({ length: rows }).map((_, idx) => (
        // biome-ignore lint/suspicious/noArrayIndexKey: pure skeleton rows
        <div key={idx} className="space-y-2 p-4">
          <Skeleton className="h-4 w-1/3" />
          <Skeleton className="h-4 w-2/3" />
        </div>
      ))}
    </div>
  );
}

export function EntityMobileMessage({
  tone = "neutral",
  children,
}: {
  tone?: "neutral" | "destructive";
  children: ReactNode;
}) {
  return (
    <div
      className={cn(
        "p-8 text-center text-sm",
        tone === "destructive" ? "text-destructive" : "text-muted-foreground",
      )}
    >
      {children}
    </div>
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
    <EntityMobileMessage>
      <div className="flex flex-col items-center justify-center gap-2">
        <p>{message}</p>
        <Button type="button" variant="outline" size="sm" onClick={onClear}>
          {clearLabel}
        </Button>
      </div>
    </EntityMobileMessage>
  );
}

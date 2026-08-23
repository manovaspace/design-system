"use client";

import type { ReactNode } from "react";
import { Button } from "../../button";
import { cn } from "../../lib/utils";
import { Skeleton } from "../../skeleton";
import { TableCell, TableRow } from "../../table";

export function EntityTableLoadingRows({
  colSpan,
  rows = 5,
}: {
  colSpan: number;
  rows?: number;
}) {
  return (
    <>
      {Array.from({ length: rows }).map((_, idx) => (
        // biome-ignore lint/suspicious/noArrayIndexKey: pure skeleton rows
        <TableRow key={idx} className="hover:bg-transparent">
          <TableCell colSpan={colSpan} className="py-3">
            <Skeleton className="h-5 w-full" />
          </TableCell>
        </TableRow>
      ))}
    </>
  );
}

export function EntityTableMessageRow({
  colSpan,
  tone = "neutral",
  children,
}: {
  colSpan: number;
  tone?: "neutral" | "destructive";
  children: ReactNode;
}) {
  return (
    <TableRow className="hover:bg-transparent">
      <TableCell
        colSpan={colSpan}
        className={cn(
          "py-12 text-center text-sm",
          tone === "destructive" ? "text-destructive" : "text-muted-foreground",
        )}
      >
        {children}
      </TableCell>
    </TableRow>
  );
}

export function EntityTableEmptyFiltered({
  colSpan,
  message,
  clearLabel,
  onClear,
}: {
  colSpan: number;
  message: string;
  clearLabel: string;
  onClear: () => void;
}) {
  return (
    <EntityTableMessageRow colSpan={colSpan}>
      <div className="flex flex-col items-center justify-center gap-2">
        <p>{message}</p>
        <Button type="button" variant="outline" size="sm" onClick={onClear}>
          {clearLabel}
        </Button>
      </div>
    </EntityTableMessageRow>
  );
}

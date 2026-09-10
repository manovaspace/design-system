/**
 * Shared table body states — loading skeleton rows, error, empty, emptyFiltered.
 */
"use client";

import type { ReactNode } from "react";
import { Button } from "../../button.js";
import { TableCell, TableRow } from "../../table.js";

const SKELETON_KEYS = [
  "sk-1",
  "sk-2",
  "sk-3",
  "sk-4",
  "sk-5",
  "sk-6",
  "sk-7",
  "sk-8",
] as const;

export function EntityTableLoadingRows({
  colSpan,
  rows = 5,
}: {
  colSpan: number;
  rows?: number;
}) {
  const keys = SKELETON_KEYS.slice(0, Math.min(rows, SKELETON_KEYS.length));

  return (
    <>
      {keys.map((key) => (
        <TableRow key={key} className="hover:bg-transparent">
          <TableCell colSpan={colSpan} className="py-3">
            <div className="h-10 animate-pulse rounded-md bg-muted/50 motion-reduce:animate-none" />
          </TableCell>
        </TableRow>
      ))}
    </>
  );
}

export function EntityTableMessageRow({
  colSpan,
  children,
  tone = "muted",
}: {
  colSpan: number;
  children: ReactNode;
  tone?: "muted" | "destructive";
}) {
  return (
    <TableRow className="hover:bg-transparent">
      <TableCell
        colSpan={colSpan}
        className={
          tone === "destructive"
            ? "py-10 text-center text-sm text-destructive"
            : "py-10 text-center text-sm text-muted-foreground"
        }
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
      <div className="flex flex-col items-center gap-3">
        <p>{message}</p>
        <Button type="button" variant="outline" size="sm" onClick={onClear}>
          {clearLabel}
        </Button>
      </div>
    </EntityTableMessageRow>
  );
}

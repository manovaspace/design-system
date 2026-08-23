"use client";

import type { ReactNode } from "react";
import { cn } from "../../lib/utils";
import { DataValue } from "../data-value";

export interface EntityResultMetaProps {
  count: number;
  label?: (count: number) => ReactNode;
  className?: string;
}

export function EntityResultMeta({
  count,
  label,
  className,
}: EntityResultMetaProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 text-sm text-muted-foreground",
        className,
      )}
    >
      {label ? (
        label(count)
      ) : (
        <>
          <DataValue tabular>{String(count)}</DataValue>
          <span>results</span>
        </>
      )}
    </span>
  );
}

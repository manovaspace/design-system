"use client";

import { Button } from "../../button";
import { DataValue } from "../data-value";

export interface EntityPaginationProps {
  page: number;
  totalPages: number;
  prevLabel: string;
  nextLabel: string;
  pageOf?: (params: { page: number | string; total: number | string }) => string;
  onPageChange: (page: number) => void;
}

export function EntityPagination({
  page,
  totalPages,
  prevLabel,
  nextLabel,
  pageOf,
  onPageChange,
}: EntityPaginationProps) {
  const safeTotalPages = Math.max(1, totalPages);
  const safePage = Math.min(Math.max(1, page), safeTotalPages);
  const pageOfLabel = pageOf
    ? pageOf({ page: safePage, total: safeTotalPages })
    : `${safePage} / ${safeTotalPages}`;

  return (
    <div className="flex items-center justify-between gap-4">
      <Button
        type="button"
        variant="outline"
        size="sm"
        disabled={safePage <= 1}
        onClick={() => onPageChange(Math.max(1, safePage - 1))}
      >
        {prevLabel}
      </Button>
      <DataValue tabular className="text-sm text-muted-foreground">
        {pageOfLabel}
      </DataValue>
      <Button
        type="button"
        variant="outline"
        size="sm"
        disabled={safePage >= safeTotalPages}
        onClick={() => onPageChange(Math.min(safeTotalPages, safePage + 1))}
      >
        {nextLabel}
      </Button>
    </div>
  );
}

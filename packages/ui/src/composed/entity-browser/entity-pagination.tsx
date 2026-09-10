/**
 * Prev / next pagination footer for Entity Browser.
 */
"use client";

import { Button } from "../../button.js";
import { persianizeDigits } from "../../lib/numeric.js";
import { DataValue } from "../data-value.js";

export interface EntityPaginationProps {
  page: number;
  totalPages: number;
  prevLabel: string;
  nextLabel: string;
  /**
   * Render the page indicator. Receives pre-localized `{ page, total }` strings.
   * Message should use plain `{page}` / `{total}`.
   */
  pageOf: (params: { page: string; total: string }) => string;
  onPageChange: (page: number) => void;
  locale?: string;
}

export function EntityPagination({
  page,
  totalPages,
  prevLabel,
  nextLabel,
  pageOf,
  onPageChange,
  locale = "fa-IR",
}: EntityPaginationProps) {
  const safeTotalPages = Math.max(1, totalPages);
  const safePage = Math.min(Math.max(1, page), safeTotalPages);
  const isPersian = !locale || locale.toLowerCase().startsWith("fa");
  const formattedPage = isPersian
    ? persianizeDigits(safePage)
    : String(safePage);
  const formattedTotal = isPersian
    ? persianizeDigits(safeTotalPages)
    : String(safeTotalPages);

  const pageOfLabel = pageOf({
    page: formattedPage,
    total: formattedTotal,
  });

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
      <DataValue
        value={pageOfLabel}
        locale={locale}
        className="text-sm text-muted-foreground"
      />
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

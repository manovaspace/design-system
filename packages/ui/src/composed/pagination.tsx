"use client";

import { Button } from "../button.js";
import { useDirection } from "../direction-provider.js";
import { ChevronLeftIcon, ChevronRightIcon } from "../icons.js";
import { persianizeDigits } from "../lib/numeric.js";
import { cn } from "../lib/utils.js";

export type PaginationProps = {
  page: number; // 1-indexed
  pageSize: number;
  total: number;
  onChange: (page: number) => void;
  siblingCount?: number; // default 1
  locale?: string;
  className?: string;
  "aria-label"?: string;
};

export type PaginationItem = number | "ellipsis-left" | "ellipsis-right";

export function getPaginationRange({
  totalPages,
  page,
  siblingCount = 1,
}: {
  totalPages: number;
  page: number;
  siblingCount?: number;
}): PaginationItem[] {
  const totalNumbers = siblingCount * 2 + 5;
  if (totalPages <= totalNumbers) {
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }

  const leftSiblingIndex = Math.max(page - siblingCount, 1);
  const rightSiblingIndex = Math.min(page + siblingCount, totalPages);

  const shouldShowLeftDots = leftSiblingIndex > 2;
  const shouldShowRightDots = rightSiblingIndex < totalPages - 1;

  if (!shouldShowLeftDots && shouldShowRightDots) {
    const leftItemCount = 3 + 2 * siblingCount;
    const leftRange = Array.from({ length: leftItemCount }, (_, i) => i + 1);
    return [...leftRange, "ellipsis-right", totalPages];
  }

  if (shouldShowLeftDots && !shouldShowRightDots) {
    const rightItemCount = 3 + 2 * siblingCount;
    const rightRange = Array.from(
      { length: rightItemCount },
      (_, i) => totalPages - rightItemCount + i + 1,
    );
    return [1, "ellipsis-left", ...rightRange];
  }

  const middleRange = Array.from(
    { length: rightSiblingIndex - leftSiblingIndex + 1 },
    (_, i) => leftSiblingIndex + i,
  );
  return [1, "ellipsis-left", ...middleRange, "ellipsis-right", totalPages];
}

export function Pagination({
  page,
  pageSize,
  total,
  onChange,
  siblingCount = 1,
  locale,
  className,
  "aria-label": ariaLabel,
}: PaginationProps) {
  const direction = useDirection();
  const isPersian = Boolean(locale?.toLowerCase().startsWith("fa"));
  const isRtl = direction === "rtl" || isPersian;

  const totalPages = Math.max(1, Math.ceil(total / Math.max(1, pageSize)));
  const safePage = Math.min(Math.max(1, page), totalPages);

  const PrevIcon = isRtl ? ChevronRightIcon : ChevronLeftIcon;
  const NextIcon = isRtl ? ChevronLeftIcon : ChevronRightIcon;

  const range = getPaginationRange({
    totalPages,
    page: safePage,
    siblingCount,
  });

  const formatNumber = (num: number) => {
    return isPersian ? persianizeDigits(num) : String(num);
  };

  const navLabel = ariaLabel ?? (isPersian ? "صفحه‌بندی" : "Pagination");

  return (
    <nav
      aria-label={navLabel}
      dir={isRtl ? "rtl" : "ltr"}
      className={cn("flex items-center justify-center", className)}
    >
      <ul className="flex items-center gap-1 list-none p-0 m-0">
        <li>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            disabled={safePage <= 1}
            onClick={() => onChange(Math.max(1, safePage - 1))}
            aria-label={isPersian ? "صفحه قبل" : "Previous page"}
            className="size-8 min-w-8 p-0"
          >
            <PrevIcon className="size-4" />
          </Button>
        </li>

        {range.map((item) => {
          if (item === "ellipsis-left" || item === "ellipsis-right") {
            return (
              <li key={item} aria-hidden="true">
                <span className="flex size-8 items-center justify-center text-sm text-muted-foreground select-none">
                  …
                </span>
              </li>
            );
          }

          const isCurrent = item === safePage;
          return (
            <li key={item}>
              <Button
                type="button"
                variant={isCurrent ? "default" : "ghost"}
                size="sm"
                aria-current={isCurrent ? "page" : undefined}
                aria-label={
                  isPersian ? `صفحه ${formatNumber(item)}` : `Page ${item}`
                }
                onClick={() => onChange(item)}
                className={cn(
                  "size-8 min-w-8 p-0 text-sm font-medium",
                  isCurrent && "pointer-events-none shadow-xs font-semibold",
                )}
              >
                {formatNumber(item)}
              </Button>
            </li>
          );
        })}

        <li>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            disabled={safePage >= totalPages}
            onClick={() => onChange(Math.min(totalPages, safePage + 1))}
            aria-label={isPersian ? "صفحه بعد" : "Next page"}
            className="size-8 min-w-8 p-0"
          >
            <NextIcon className="size-4" />
          </Button>
        </li>
      </ul>
    </nav>
  );
}

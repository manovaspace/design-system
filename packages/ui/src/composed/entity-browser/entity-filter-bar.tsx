"use client";

import { type ReactNode, useState } from "react";
import { Badge } from "../../badge";
import { Button } from "../../button";
import { ListFilterIcon, XMarkIcon } from "../../icons";
import { cn } from "../../lib/utils";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "../../sheet";
import { useEntityBrowserCommandBarSuffix } from "./entity-command-bar-context";
import { partitionFilterBarChildren } from "./entity-filter-bar-children";

export interface EntityFilterChip {
  key: string;
  label: string;
  onRemove: () => void;
}

export interface EntityFilterBarProps {
  children: ReactNode;
  chips: EntityFilterChip[];
  clearAllLabel: string;
  onClearAll: () => void;
  removeChipLabel: string;
  filtersLabel?: string;
  filtersSheetTitle?: string;
  showResultsLabel?: string;
  suffix?: ReactNode;
  className?: string;
}

export function EntityFilterBar({
  children,
  chips,
  clearAllLabel,
  onClearAll,
  removeChipLabel,
  filtersLabel = "Filters",
  filtersSheetTitle = "Filters",
  showResultsLabel = "Show Results",
  suffix: suffixProp,
  className,
}: EntityFilterBarProps) {
  const [sheetOpen, setSheetOpen] = useState(false);

  const { search, filters } = partitionFilterBarChildren(children);
  const hasFilterControls = filters.length > 0;
  const showClear = chips.length > 0;
  const activeFilterCount = chips.filter((chip) => chip.key !== "q").length;

  const commandBarSuffix = useEntityBrowserCommandBarSuffix();
  const suffix = suffixProp ?? commandBarSuffix;
  const showMetaRow = suffix != null || chips.length > 0;

  const filterControlsDesktop = (
    <div className="hidden sm:flex sm:flex-row sm:flex-wrap sm:items-end sm:gap-3">
      {filters}
      {showClear ? (
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="self-end text-muted-foreground"
          onClick={onClearAll}
        >
          {clearAllLabel}
        </Button>
      ) : null}
    </div>
  );

  return (
    <div className={cn("space-y-2", className)}>
      <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-end">
        <div className="flex w-full min-w-0 items-end gap-2 sm:contents">
          {search}
          {hasFilterControls ? (
            <div className="sm:hidden">
              <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
                <Button
                  type="button"
                  variant="outline"
                  size={search.length === 0 ? "default" : "icon"}
                  className={cn(
                    "gap-1.5",
                    search.length === 0 ? "w-full" : "shrink-0",
                  )}
                  onClick={() => setSheetOpen(true)}
                  aria-label={search.length > 0 ? filtersLabel : undefined}
                >
                  <ListFilterIcon className="size-4 shrink-0" aria-hidden />
                  {search.length === 0 ? <span>{filtersLabel}</span> : null}
                  {activeFilterCount > 0 ? (
                    <Badge
                      variant="secondary"
                      className="min-w-5 justify-center px-1.5 font-data tabular-nums"
                    >
                      {activeFilterCount}
                    </Badge>
                  ) : null}
                </Button>
                <SheetContent
                  side="bottom"
                  className="flex max-h-[min(85dvh,640px)] flex-col gap-0 rounded-t-xl border-t p-0"
                >
                  <SheetHeader className="border-b border-border px-4 py-4">
                    <SheetTitle>{filtersSheetTitle}</SheetTitle>
                  </SheetHeader>
                  <div className="flex-1 overflow-y-auto px-4 py-4">
                    <div className="flex flex-col gap-4">{filters}</div>
                  </div>
                  <SheetFooter className="gap-2 border-t border-border p-4">
                    {showClear ? (
                      <Button
                        type="button"
                        variant="ghost"
                        className="text-muted-foreground"
                        onClick={onClearAll}
                      >
                        {clearAllLabel}
                      </Button>
                    ) : null}
                    <SheetClose asChild>
                      <Button type="button" className="w-full sm:w-auto">
                        {showResultsLabel}
                      </Button>
                    </SheetClose>
                  </SheetFooter>
                </SheetContent>
              </Sheet>
            </div>
          ) : null}
        </div>
        {hasFilterControls ? filterControlsDesktop : null}
      </div>

      {showMetaRow ? (
        <div
          className="flex min-h-7 flex-wrap items-center gap-x-3 gap-y-2"
          data-slot="entity-filter-meta-row"
        >
          {chips.length > 0 ? (
            <ul
              className="flex min-w-0 flex-1 flex-wrap gap-2"
              aria-label={clearAllLabel}
            >
              {chips.map((chip) => (
                <li key={chip.key}>
                  <Badge
                    variant="secondary"
                    className="gap-0.5 pe-1 ps-2.5 font-normal"
                  >
                    <span>{chip.label}</span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="size-5 p-0 text-muted-foreground hover:bg-background hover:text-foreground"
                      onClick={chip.onRemove}
                      aria-label={`${removeChipLabel}: ${chip.label}`}
                    >
                      <XMarkIcon className="size-3" />
                    </Button>
                  </Badge>
                </li>
              ))}
            </ul>
          ) : (
            <div className="min-w-0 flex-1" aria-hidden="true" />
          )}
          {suffix ? <div className="ms-auto shrink-0">{suffix}</div> : null}
        </div>
      ) : null}
    </div>
  );
}

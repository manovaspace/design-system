/**
 * Filter controls + removable chip strip + clear-all for Entity Browser.
 * Below `sm`, non-search filters move into a bottom sheet so list content stays visible.
 */
"use client";

import {
  Children,
  isValidElement,
  type ReactElement,
  type ReactNode,
  useState,
  useSyncExternalStore,
} from "react";
import { Badge } from "../../badge.js";
import { Button } from "../../button.js";
import { FunnelIcon, XMarkIcon } from "../../icons.js";
import { persianizeDigits } from "../../lib/numeric.js";
import { cn } from "../../lib/utils.js";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "../../sheet.js";
import { useEntityBrowserCommandBarSuffix } from "./entity-browser-command-bar-context.js";
import { EntitySearchField } from "./entity-search-field.js";

const SM_MEDIA_QUERY = "(min-width: 640px)";

function subscribe(onStoreChange: () => void) {
  if (
    typeof window === "undefined" ||
    typeof window.matchMedia !== "function"
  ) {
    return () => {};
  }
  const media = window.matchMedia(SM_MEDIA_QUERY);
  media.addEventListener("change", onStoreChange);
  return () => media.removeEventListener("change", onStoreChange);
}

function getSnapshot() {
  if (
    typeof window === "undefined" ||
    typeof window.matchMedia !== "function"
  ) {
    return true;
  }
  return window.matchMedia(SM_MEDIA_QUERY).matches;
}

function useMinSmViewport() {
  return useSyncExternalStore(subscribe, getSnapshot, () => false);
}

export interface PartitionedFilterBarChildren {
  search: ReactNode[];
  filters: ReactNode[];
}

function isSearchFieldElement(
  child: ReactNode,
): child is ReactElement<typeof EntitySearchField> {
  return isValidElement(child) && child.type === EntitySearchField;
}

/** Split toolbar children into always-visible search vs sheet/inline filters. */
export function partitionFilterBarChildren(
  children: ReactNode,
): PartitionedFilterBarChildren {
  const search: ReactNode[] = [];
  const filters: ReactNode[] = [];

  for (const child of Children.toArray(children)) {
    if (isSearchFieldElement(child)) {
      search.push(child);
      continue;
    }
    filters.push(child);
  }

  return { search, filters };
}

export interface EntityFilterChip {
  key: string;
  label: string;
  onRemove: () => void;
}

export interface EntityFilterBarProps {
  /** Compact filter controls (Selects, etc.). First `EntitySearchField` stays inline on mobile. */
  children: ReactNode;
  chips: EntityFilterChip[];
  clearAllLabel: string;
  onClearAll: () => void;
  removeChipLabel: string;
  /** Mobile sheet trigger label. Defaults to "فیلترها". */
  filtersLabel?: string;
  /** Mobile sheet title. Defaults to "فیلتر نتایج". */
  filtersSheetTitle?: string;
  /** Mobile sheet dismiss CTA. Defaults to "نمایش نتایج". */
  showResultsLabel?: string;
  /** Right-aligned meta (e.g. result count). Overrides EntityBrowser `resultMeta`. */
  suffix?: ReactNode;
  className?: string;
}

export function EntityFilterBar({
  children,
  chips,
  clearAllLabel,
  onClearAll,
  removeChipLabel,
  filtersLabel,
  filtersSheetTitle,
  showResultsLabel,
  suffix: suffixProp,
  className,
}: EntityFilterBarProps) {
  const isDesktop = useMinSmViewport();
  const [sheetOpen, setSheetOpen] = useState(false);

  const { search, filters } = partitionFilterBarChildren(children);
  const hasFilterControls = filters.length > 0;
  const showClear = chips.length > 0;
  const activeFilterCount = chips.filter((chip) => chip.key !== "q").length;

  const commandBarSuffix = useEntityBrowserCommandBarSuffix();
  const suffix = suffixProp ?? commandBarSuffix;
  const showMetaRow = suffix != null || chips.length > 0;

  const resolvedFiltersLabel = filtersLabel ?? "فیلترها";
  const resolvedSheetTitle = filtersSheetTitle ?? "فیلتر نتایج";
  const resolvedShowResultsLabel = showResultsLabel ?? "نمایش نتایج";

  const filterControls = (
    <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-end">
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
          {!isDesktop && hasFilterControls ? (
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
                aria-label={
                  search.length > 0 ? resolvedFiltersLabel : undefined
                }
              >
                <FunnelIcon className="size-4 shrink-0" aria-hidden />
                {search.length === 0 ? (
                  <span>{resolvedFiltersLabel}</span>
                ) : null}
                {activeFilterCount > 0 ? (
                  <Badge
                    variant="secondary"
                    className="min-w-5 justify-center px-1.5 font-data tabular-nums"
                  >
                    {persianizeDigits(String(activeFilterCount))}
                  </Badge>
                ) : null}
              </Button>
              <SheetContent
                side="bottom"
                className="flex max-h-[min(85dvh,640px)] flex-col gap-0 rounded-t-xl border-t p-0"
              >
                <SheetHeader className="border-b border-border px-4 py-4">
                  <SheetTitle>{resolvedSheetTitle}</SheetTitle>
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
                      {resolvedShowResultsLabel}
                    </Button>
                  </SheetClose>
                </SheetFooter>
              </SheetContent>
            </Sheet>
          ) : null}
        </div>
        {isDesktop && hasFilterControls ? filterControls : null}
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
                    <span>{persianizeDigits(chip.label)}</span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon-xs"
                      className={cn(
                        "shrink-0 text-muted-foreground",
                        "hover:bg-background hover:text-foreground",
                      )}
                      onClick={chip.onRemove}
                      aria-label={`${removeChipLabel}: ${chip.label}`}
                    >
                      <XMarkIcon />
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

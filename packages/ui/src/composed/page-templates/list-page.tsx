"use client";

import type * as React from "react";
import { useState } from "react";

import { Button } from "../../button.js";
import { FunnelIcon, SortIcon, XMarkIcon } from "../../icons.js";
import { cn } from "../../lib/utils.js";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetTitle,
} from "../../sheet.js";
import { EntityBrowser } from "../entity-browser/entity-browser.js";
import { EntitySearchField } from "../entity-browser/entity-search-field.js";
import { FilterSheet, type FilterSheetProps } from "../filter-sheet.js";
import { FloatingActionButton } from "../floating-action-button.js";
import { Row, RowList } from "../row-list.js";

/** @experimental */
export type ListPageAddAction = {
  label: string;
  icon: React.ReactNode;
  onClick: () => void;
  disabled?: boolean;
};

/** @experimental */
export type ListPageSearch = {
  id: string;
  label: string;
  /** Holds the filtered total, e.g. «جستجو در ۵۲ کالا». There is no separate count line. */
  placeholder: string;
  value: string;
  onValueChange: (value: string) => void;
  clearLabel: string;
};

/** @experimental */
export type ListPageFilterChip = {
  id: string;
  label: string;
  onRemove: () => void;
};

/** @experimental */
export type ListPageFilters = {
  /** Filter button name; also the filter sheet title. */
  label: string;
  /** Active filters only. Each one is a removable chip. */
  chips: ListPageFilterChip[];
  /** Accessible name prefix of a chip's remove button: `${removeChipLabel}: ${chip.label}`. */
  removeChipLabel: string;
  sheet: Omit<FilterSheetProps, "open" | "onOpenChange" | "title">;
};

/** @experimental */
export type ListPageSortOption = {
  value: string;
  label: string;
};

/** @experimental */
export type ListPageSort = {
  /** Sort button name; also the sort sheet title. */
  label: string;
  options: ListPageSortOption[];
  value: string;
  onValueChange: (value: string) => void;
  /** Accessible label of the sheet's close button. */
  closeLabel: string;
};

/**
 * Section name of a list page. Give either a visible `title` or an
 * `aria-label`, never both.
 * @experimental
 */
export type ListPageName =
  | {
      /** Visible h2 heading; names the section. Use it when a page holds more than one list. */
      title: string;
      "aria-label"?: never;
    }
  | {
      title?: never;
      /** Accessible section name when the app shell shows the visible title. */
      "aria-label": string;
    };

/** @experimental */
export type ListPageProps = ListPageName & {
  /** Shows a meta line in the header row. Without it the header row only holds the add button below `lg`. */
  description?: string;
  /** Untitled: header button from `lg`, floating action button below `lg`. Titled: header button at every width. */
  addAction?: ListPageAddAction;
  search: ListPageSearch;
  /** Sort button and sheet of choices. Omit when the list has no sort order. */
  sort?: ListPageSort;
  /** Filter button, chip row and filter sheet. Omit when the list has no filters. */
  filters?: ListPageFilters;
  /** Results: `EntityDataTable` (rows below md, table from md) with its `state`. */
  children: React.ReactNode;
  /** Pagination or `InfiniteScrollTrigger`. */
  footer?: React.ReactNode;
  className?: string;
};

const HIDE_HEADER_BELOW_LG =
  "max-lg:[&>[data-slot=entity-browser-header]]:hidden";
const CLEAR_FAB_SPACE = "max-lg:pb-[calc(6rem+var(--fab-bottom-offset,0px))]";

/**
 * List page with search, filters and add.
 *
 * Usage rules:
 * - One per list. A page with several lists uses titled ListPages.
 * - Untitled: the page's main list; the app shell shows the title.
 * - Titled: one of several lists on a page; add stays a header button at every width.
 * - Untitled add action: a labelled header button from `lg`; a `FloatingActionButton`
 *   below `lg`, bottom inline-end, lifted by `--fab-bottom-offset`.
 * - Put the filtered total in `search.placeholder`, never a count line.
 * - Only active filters become chips.
 * - The filter sheet title equals the filter button label.
 * - Sort button opens a sheet of choices titled with the button label.
 * - Results go in `children` as `EntityDataTable`; its `state.emptyContent` is
 *   an `EmptyState` that says what the list holds and offers the next step.
 * - Sticky search uses `--entity-browser-sticky-top`.
 * @experimental
 */
export function ListPage({
  title,
  "aria-label": ariaLabel,
  description,
  addAction,
  search,
  sort,
  filters,
  children,
  footer,
  className,
}: ListPageProps) {
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [sortOpen, setSortOpen] = useState(false);
  const chips = filters?.chips ?? [];
  const hasChips = chips.length > 0;
  const titled = Boolean(title);
  const currentSortOption = sort?.options.find(
    (option) => option.value === sort.value,
  );

  const headerAddButton = addAction ? (
    <Button
      type="button"
      className={titled ? "min-h-11" : "hidden min-h-11 lg:inline-flex"}
      onClick={addAction.onClick}
      disabled={addAction.disabled}
    >
      {addAction.icon}
      {addAction.label}
    </Button>
  ) : null;

  const toolbar = (
    <>
      <div className="flex items-center gap-2">
        <EntitySearchField
          id={search.id}
          label={search.label}
          placeholder={search.placeholder}
          value={search.value}
          onValueChange={search.onValueChange}
          onClear={() => search.onValueChange("")}
          clearLabel={search.clearLabel}
          className="min-w-0 flex-1 [&_input]:min-h-11"
        />
        {filters ? (
          <Button
            type="button"
            variant="outline"
            size="icon-touch"
            className="relative shrink-0"
            aria-label={filters.label}
            aria-haspopup="dialog"
            data-active={hasChips ? "true" : undefined}
            onClick={() => setFiltersOpen(true)}
          >
            <FunnelIcon aria-hidden="true" />
            {hasChips ? (
              <span
                aria-hidden="true"
                className="absolute end-2 top-2 size-2 rounded-full bg-primary"
              />
            ) : null}
          </Button>
        ) : null}
        {sort ? (
          <Button
            type="button"
            variant="outline"
            size="icon-touch"
            className="shrink-0"
            aria-label={
              currentSortOption
                ? `${sort.label}: ${currentSortOption.label}`
                : sort.label
            }
            aria-haspopup="dialog"
            onClick={() => setSortOpen(true)}
          >
            <SortIcon aria-hidden="true" />
          </Button>
        ) : null}
      </div>
      {filters && hasChips ? (
        <ul aria-label={filters.label} className="flex gap-2 overflow-x-auto">
          {chips.map((chip) => (
            <li key={chip.id} className="shrink-0">
              <button
                type="button"
                aria-label={`${filters.removeChipLabel}: ${chip.label}`}
                onClick={chip.onRemove}
                className="inline-flex min-h-11 items-center gap-1 rounded-full bg-surface-sunken px-3 text-sm text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
              >
                {chip.label}
                <XMarkIcon
                  aria-hidden="true"
                  className="size-4 text-muted-foreground"
                />
              </button>
            </li>
          ))}
        </ul>
      ) : null}
    </>
  );

  return (
    <div data-slot="list-page">
      <EntityBrowser
        title={title}
        aria-label={ariaLabel}
        description={description}
        primaryAction={headerAddButton}
        toolbar={toolbar}
        stickyToolbar
        frame="flat"
        footer={footer}
        className={cn(
          !description && !titled && HIDE_HEADER_BELOW_LG,
          addAction && !titled && CLEAR_FAB_SPACE,
          className,
        )}
      >
        {children}
      </EntityBrowser>
      {addAction && !titled ? (
        <FloatingActionButton
          label={addAction.label}
          icon={addAction.icon}
          onClick={addAction.onClick}
          disabled={addAction.disabled}
          className="lg:hidden"
        />
      ) : null}
      {filters ? (
        <FilterSheet
          {...filters.sheet}
          open={filtersOpen}
          onOpenChange={setFiltersOpen}
          title={filters.label}
        />
      ) : null}
      {sort ? (
        <Sheet open={sortOpen} onOpenChange={setSortOpen}>
          <SheetContent
            side="bottom"
            showCloseButton={false}
            data-slot="list-page-sort-sheet"
            className="flex max-h-[85dvh] flex-col gap-0 p-0 md:mx-auto md:inset-x-0 md:max-w-lg md:rounded-t-xl"
          >
            <SheetDescription className="sr-only">
              {sort.label}
            </SheetDescription>
            <div className="flex min-h-14 items-center gap-2 border-b border-border px-2">
              <Button
                type="button"
                variant="ghost"
                size="icon-touch"
                aria-label={sort.closeLabel}
                onClick={() => setSortOpen(false)}
              >
                <XMarkIcon aria-hidden="true" />
              </Button>
              <SheetTitle className="min-w-0 flex-1 truncate text-base font-semibold text-foreground">
                {sort.label}
              </SheetTitle>
            </div>
            <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain pb-[max(0.75rem,env(safe-area-inset-bottom))]">
              <RowList className="px-1">
                {sort.options.map((option) => (
                  <Row
                    key={option.value}
                    selected={option.value === sort.value}
                    onPress={() => {
                      sort.onValueChange(option.value);
                      setSortOpen(false);
                    }}
                  >
                    <span className="text-sm font-medium text-foreground">
                      {option.label}
                    </span>
                  </Row>
                ))}
              </RowList>
            </div>
          </SheetContent>
        </Sheet>
      ) : null}
    </div>
  );
}

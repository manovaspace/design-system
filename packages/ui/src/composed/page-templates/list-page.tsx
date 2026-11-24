"use client";

import type * as React from "react";
import { useState } from "react";

import { Button } from "../../button.js";
import { FunnelIcon, XMarkIcon } from "../../icons.js";
import { cn } from "../../lib/utils.js";
import { EntityBrowser } from "../entity-browser/entity-browser.js";
import { EntitySearchField } from "../entity-browser/entity-search-field.js";
import { FilterSheet, type FilterSheetProps } from "../filter-sheet.js";
import { FloatingActionButton } from "../floating-action-button.js";

export type ListPageAddAction = {
  label: string;
  icon: React.ReactNode;
  onClick: () => void;
  disabled?: boolean;
};

export type ListPageSearch = {
  id: string;
  label: string;
  /** Holds the filtered total, e.g. «جستجو در ۵۲ کالا». There is no separate count line. */
  placeholder: string;
  value: string;
  onValueChange: (value: string) => void;
  clearLabel: string;
};

export type ListPageFilterChip = {
  id: string;
  label: string;
  onRemove: () => void;
};

export type ListPageFilters = {
  /** Filter button name; also the filter sheet title. */
  label: string;
  /** Active filters only. Each one is a removable chip. */
  chips: ListPageFilterChip[];
  /** Accessible name prefix of a chip's remove button: `${removeChipLabel}: ${chip.label}`. */
  removeChipLabel: string;
  sheet: Omit<FilterSheetProps, "open" | "onOpenChange" | "title">;
};

export type ListPageProps = {
  /** Page name; the section's accessible name. The app shell shows the visible title. */
  "aria-label": string;
  /** Shows a meta line in the header row. Without it the header row only holds the add button below `lg`. */
  description?: string;
  /** Header button from `lg`, floating action button below `lg`. */
  addAction?: ListPageAddAction;
  search: ListPageSearch;
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
 * - One per list, directory or ledger page.
 * - Add action: a labelled header button from `lg`; a `FloatingActionButton`
 *   below `lg`, bottom inline-end, lifted by `--fab-bottom-offset`.
 * - Put the filtered total in `search.placeholder`, never a count line.
 * - Only active filters become chips.
 * - The filter sheet title equals the filter button label.
 * - Results go in `children` as `EntityDataTable`; its `state.emptyContent` is
 *   an `EmptyState` that says what the list holds and offers the next step.
 * - Sticky search uses `--entity-browser-sticky-top`.
 */
export function ListPage({
  "aria-label": ariaLabel,
  description,
  addAction,
  search,
  filters,
  children,
  footer,
  className,
}: ListPageProps) {
  const [filtersOpen, setFiltersOpen] = useState(false);
  const chips = filters?.chips ?? [];
  const hasChips = chips.length > 0;

  const headerAddButton = addAction ? (
    <Button
      type="button"
      className="hidden min-h-11 lg:inline-flex"
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
        aria-label={ariaLabel}
        description={description}
        primaryAction={headerAddButton}
        toolbar={toolbar}
        stickyToolbar
        frame="flat"
        footer={footer}
        className={cn(
          !description && HIDE_HEADER_BELOW_LG,
          addAction && CLEAR_FAB_SPACE,
          className,
        )}
      >
        {children}
      </EntityBrowser>
      {addAction ? (
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
    </div>
  );
}

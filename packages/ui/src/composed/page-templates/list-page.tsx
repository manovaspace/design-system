"use client";

import { AnimatePresence, motion, type Variants } from "framer-motion";
import type * as React from "react";
import { useRef, useState } from "react";

import { Button } from "../../button.js";
import { FunnelIcon, SortIcon, XMarkIcon } from "../../icons.js";
import { cn } from "../../lib/utils.js";
import { Collapse } from "../../motion/collapse.js";
import { useReducedMotion } from "../../motion/hooks.js";
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

/**
 * Text button at the start of the chip row that removes every chip.
 * Shown only with two or more chips.
 * @experimental
 */
export type ListPageClearAll = {
  label: string;
  onClear: () => void;
};

/** @experimental */
export type ListPageFilters = {
  /** Filter button name; also the filter sheet title. */
  label: string;
  /** Active filters only. Each one is a removable chip. */
  chips: ListPageFilterChip[];
  /** Accessible name prefix of a chip's remove button: `${removeChipLabel}: ${chip.label}`. */
  removeChipLabel: string;
  /**
   * Clears every chip at once. Shown as the first item of the chip row when
   * there are two or more chips. With one chip, that chip is its own clear.
   */
  clearAll?: ListPageClearAll;
  /**
   * Number shown as a badge on the filter button when above zero.
   * Defaults to `chips.length`.
   */
  activeCount?: number;
  /**
   * Formats the badge number, for example with locale digits.
   * Defaults to `String`.
   */
  formatCount?: (count: number) => string;
  /**
   * Called with `true` when the filter sheet opens and `false` when it closes.
   * Use it to load filter options lazily.
   */
  onOpenChange?: (open: boolean) => void;
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

/**
 * `framed` puts bordered card controls on the search field and the filter and
 * sort buttons. `default` keeps the plain look.
 * @experimental
 */
export type ListPageVariant = "default" | "framed";

/**
 * Maximum width of the list: `default` 72rem, `wide` 80rem, `full` no limit.
 * @experimental
 */
export type ListPageWidth = "default" | "wide" | "full";

/**
 * Where the page padding comes from. `page`: the list pads itself.
 * `shell`: the app shell already pads the page; the list has no horizontal
 * padding and pulls up by `--list-page-gutter`.
 * @experimental
 */
export type ListPageInset = "page" | "shell";

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
  /** `default` (plain controls) or `framed` (bordered card controls). Default `default`. */
  variant?: ListPageVariant;
  /** Maximum width of the list. Default `default`. */
  width?: ListPageWidth;
  /**
   * Padding owner. `page` (default): the list pads itself, 16/24/32 px.
   * `shell`: the app shell pads the page; set `--list-page-gutter` on the
   * shell to the same value as its top padding.
   */
  inset?: ListPageInset;
  /** Results: `EntityDataTable` (rows below md, table from md) with its `state`. */
  children: React.ReactNode;
  /** Pagination or `InfiniteScrollTrigger`. */
  footer?: React.ReactNode;
  className?: string;
};

const HIDE_HEADER_BELOW_LG =
  "max-lg:[&>[data-slot=entity-browser-header]]:hidden";
const FAB_BOTTOM_CLEARANCE =
  "max-lg:pb-[calc(var(--list-page-fab-clearance,6rem)+var(--fab-bottom-offset,0px))]";

/** Sticky toolbar: 16 px above the search, 12 px below the controls, then a divider. */
const SECTION_SPACING =
  "space-y-3 pt-0 [&>[data-slot=entity-browser-header]]:pt-4 [&>[data-sticky=true]]:border-b [&>[data-sticky=true]]:border-border [&>[data-sticky=true]]:pt-4 [&>[data-sticky=true]]:pb-3";

const WIDTH_CLASS: Record<ListPageWidth, string | undefined> = {
  default: undefined,
  wide: "max-w-7xl",
  full: "max-w-none",
};

const PAGE_INSET_CLASS = "pb-[var(--list-page-bottom-padding,1.5rem)]";

const SHELL_INSET_CLASS = cn(
  "-mt-[var(--list-page-gutter,1rem)] px-0 sm:px-0 lg:px-0 pb-[var(--list-page-bottom-padding,0px)]",
  "[&>[data-sticky=true]]:-mx-[var(--list-page-gutter,1rem)] [&>[data-sticky=true]]:px-[var(--list-page-gutter,1rem)]",
  "sm:[&>[data-sticky=true]]:-mx-[var(--list-page-gutter,1rem)] sm:[&>[data-sticky=true]]:px-[var(--list-page-gutter,1rem)]",
  "lg:[&>[data-sticky=true]]:-mx-[var(--list-page-gutter,1rem)] lg:[&>[data-sticky=true]]:px-[var(--list-page-gutter,1rem)]",
);

const FRAMED_SEARCH_CLASS =
  "min-w-0 flex-1 h-11 rounded-xl border border-border bg-card transition-colors focus-within:border-primary [&>div]:h-full [&_input]:h-full [&_input]:rounded-none [&_input]:border-0 [&_input]:bg-transparent [&_input]:shadow-none [&_input]:focus-visible:border-0 [&_input]:focus-visible:ring-0";

const DEFAULT_SEARCH_CLASS = "min-w-0 flex-1 [&_input]:min-h-11";

const FRAMED_BUTTON_CLASS =
  "rounded-xl border border-border bg-card shadow-none hover:bg-surface-sunken";

const CHIP_VARIANTS: Variants = {
  initial: { opacity: 0, scale: 0.9 },
  animate: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.18, ease: "easeOut" },
  },
  exit: {
    opacity: 0,
    scale: 0.9,
    pointerEvents: "none",
    transition: { duration: 0.15, ease: "easeIn" },
  },
};

const CHIP_VARIANTS_REDUCED: Variants = {
  initial: { opacity: 1, scale: 1 },
  animate: { opacity: 1, scale: 1, transition: { duration: 0 } },
  exit: {
    opacity: 0,
    scale: 0.9,
    pointerEvents: "none",
    transition: { duration: 0 },
  },
};

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
 * - Layout hooks (set on a parent or the app shell, not on the list):
 *   - `--entity-browser-sticky-top`: top offset of the sticky toolbar (default `0px`).
 *   - `--fab-bottom-offset`: lifts the floating add button (default `0px`).
 *   - `--list-page-gutter`: shell gutter for `inset="shell"` (default `1rem`).
 *     Set it to the shell's top padding; responsive values are fine.
 *   - `--list-page-fab-clearance`: bottom space below `lg` when the FAB shows (default `6rem`).
 *   - `--list-page-bottom-padding`: bottom padding of the list (default `1.5rem`
 *     for `inset="page"`, `0px` for `inset="shell"`).
 * - `variant="framed"` for bordered card controls; `width` and `inset` for the page frame.
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
  variant = "default",
  width = "default",
  inset = "page",
  children,
  footer,
  className,
}: ListPageProps) {
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [sortOpen, setSortOpen] = useState(false);
  const optionRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const reducedMotion = useReducedMotion();
  const chips = filters?.chips ?? [];
  const hasChips = chips.length > 0;
  const showClearAll = Boolean(filters?.clearAll) && chips.length >= 2;
  const activeCount = filters?.activeCount ?? chips.length;
  const formatCount = filters?.formatCount ?? String;
  const framed = variant === "framed";
  const titled = Boolean(title);
  const currentSortOption = sort?.options.find(
    (option) => option.value === sort.value,
  );
  const selectedOptionIndex = Math.max(
    0,
    sort?.options.findIndex((option) => option.value === sort.value) ?? 0,
  );
  const chipVariants = reducedMotion ? CHIP_VARIANTS_REDUCED : CHIP_VARIANTS;

  function setFiltersOpenState(open: boolean) {
    setFiltersOpen(open);
    filters?.onOpenChange?.(open);
  }

  function onOptionKeyDown(
    event: React.KeyboardEvent<HTMLButtonElement>,
    index: number,
    count: number,
  ) {
    let next: number;
    switch (event.key) {
      case "ArrowDown":
        next = (index + 1) % count;
        break;
      case "ArrowUp":
        next = (index - 1 + count) % count;
        break;
      case "Home":
        next = 0;
        break;
      case "End":
        next = count - 1;
        break;
      default:
        return;
    }
    event.preventDefault();
    optionRefs.current[next]?.focus();
  }

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
    <div>
      <div className="flex items-center gap-2">
        <EntitySearchField
          id={search.id}
          label={search.label}
          placeholder={search.placeholder}
          value={search.value}
          onValueChange={search.onValueChange}
          onClear={() => search.onValueChange("")}
          clearLabel={search.clearLabel}
          className={framed ? FRAMED_SEARCH_CLASS : DEFAULT_SEARCH_CLASS}
        />
        {filters ? (
          <Button
            type="button"
            variant="outline"
            size="icon-touch"
            className={cn("relative shrink-0", framed && FRAMED_BUTTON_CLASS)}
            aria-label={filters.label}
            aria-haspopup="dialog"
            data-active={activeCount > 0 ? "true" : undefined}
            onClick={() => setFiltersOpenState(true)}
          >
            <FunnelIcon aria-hidden="true" />
            {activeCount > 0 ? (
              <span
                data-slot="list-page-filter-count"
                aria-hidden="true"
                className="absolute -end-1 -top-1 grid min-w-5 place-items-center rounded-full bg-primary px-1 text-xs font-bold leading-5 text-primary-foreground tabular-nums"
              >
                {formatCount(activeCount)}
              </span>
            ) : null}
          </Button>
        ) : null}
        {sort ? (
          <Button
            type="button"
            variant="outline"
            size="icon-touch"
            className={cn("shrink-0", framed && FRAMED_BUTTON_CLASS)}
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
      {filters ? (
        <Collapse
          open={hasChips}
          aria-hidden={hasChips ? undefined : true}
          data-slot="list-page-chip-row"
        >
          <ul
            aria-label={filters.label}
            className="mt-2 flex gap-2 overflow-x-auto"
          >
            <AnimatePresence initial={false}>
              {showClearAll && filters.clearAll ? (
                <motion.li
                  key="list-page-clear-all"
                  className="shrink-0"
                  variants={chipVariants}
                  initial={reducedMotion ? false : "initial"}
                  animate="animate"
                  exit="exit"
                >
                  <Button
                    type="button"
                    variant="ghost"
                    className="min-h-11 text-xs font-medium text-muted-foreground underline underline-offset-2 hover:bg-transparent hover:text-foreground"
                    onClick={filters.clearAll.onClear}
                  >
                    {filters.clearAll.label}
                  </Button>
                </motion.li>
              ) : null}
              {chips.map((chip) => (
                <motion.li
                  key={chip.id}
                  className="shrink-0"
                  variants={chipVariants}
                  initial={reducedMotion ? false : "initial"}
                  animate="animate"
                  exit="exit"
                >
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
                </motion.li>
              ))}
            </AnimatePresence>
          </ul>
        </Collapse>
      ) : null}
    </div>
  );

  return (
    <div
      data-slot="list-page"
      data-variant={variant}
      data-width={width}
      data-inset={inset}
    >
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
          SECTION_SPACING,
          WIDTH_CLASS[width],
          inset === "shell" ? SHELL_INSET_CLASS : PAGE_INSET_CLASS,
          !description && !titled && HIDE_HEADER_BELOW_LG,
          addAction && !titled && FAB_BOTTOM_CLEARANCE,
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
          onOpenChange={setFiltersOpenState}
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
            onOpenAutoFocus={(event) => {
              event.preventDefault();
              optionRefs.current[selectedOptionIndex]?.focus();
            }}
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
                {sort.options.map((option, index) => (
                  <Row
                    key={option.value}
                    asChild
                    selected={option.value === sort.value}
                  >
                    <button
                      type="button"
                      ref={(element) => {
                        optionRefs.current[index] = element;
                      }}
                      tabIndex={index === selectedOptionIndex ? 0 : -1}
                      onKeyDown={(event) =>
                        onOptionKeyDown(event, index, sort.options.length)
                      }
                      onClick={() => {
                        sort.onValueChange(option.value);
                        setSortOpen(false);
                      }}
                    >
                      <span className="text-sm font-medium text-foreground">
                        {option.label}
                      </span>
                    </button>
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

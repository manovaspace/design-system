"use client";

import type { JSX } from "react";
import * as React from "react";

import { Button } from "../button.js";
import { useDirection } from "../direction-provider.js";
import { ChevronLeftIcon, XMarkIcon } from "../icons.js";
import { toLatinDigits } from "../lib/numeric.js";
import { foldPersian } from "../lib/persian.js";
import { cn } from "../lib/utils.js";
import { Sheet, SheetContent, SheetDescription, SheetTitle } from "../sheet.js";
import { Switch } from "../switch.js";
import { Row, RowList } from "./row-list.js";
import { SearchInput } from "./search-input.js";

/** One choice of a `single` or `multi` filter field. */
export type FilterSheetOption = {
  value: string;
  label: string;
  description?: string;
};

/**
 * Search field of a `single` or `multi` sub-page. Provide `value` and
 * `onValueChange` for server-side search (options are shown as given); omit
 * both for client-side filtering on the option label.
 */
export type FilterSheetSearch = {
  placeholder: string;
  value?: string;
  onValueChange?: (value: string) => void;
};

type FieldBase = { id: string; label: string; icon?: React.ReactNode };

/**
 * One row of a `FilterSheet`. `toggle` is a switch row; `single`, `multi` and
 * `page` open a sub-page; `link` calls `onPress` and opens nothing.
 */
export type FilterSheetField =
  | (FieldBase & {
      kind: "toggle";
      description?: string;
      checked: boolean;
      onCheckedChange: (checked: boolean) => void;
    })
  | (FieldBase & {
      kind: "single";
      options: FilterSheetOption[];
      value: string | null;
      onValueChange: (value: string | null) => void;
      /** Label of the "no value" first option. Omit it when a value is required. */
      allLabel?: string;
      /** Overrides the summary line shown under the label when active. */
      summary?: string;
      search?: FilterSheetSearch;
      /** Rendered below the option list. */
      after?: React.ReactNode;
      /** Replaces the option list (for example a loading or empty message). */
      status?: React.ReactNode;
    })
  | (FieldBase & {
      kind: "multi";
      options: FilterSheetOption[];
      values: string[];
      onValuesChange: (values: string[]) => void;
      summary?: string;
      search?: FilterSheetSearch;
      after?: React.ReactNode;
      status?: React.ReactNode;
    })
  | (FieldBase & {
      kind: "link";
      summary?: string;
      active?: boolean;
      onPress: () => void;
    })
  | (FieldBase & {
      kind: "page";
      summary?: string;
      active: boolean;
      /** Content of the sub-page. */
      children: React.ReactNode;
    });

/** Props of `FilterSheet`. The sheet is controlled through `open` and `onOpenChange`. */
export type FilterSheetProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Title of the list view. */
  title: string;
  /** Accessible label of the close button on the list view. */
  closeLabel: string;
  /** Accessible label of the back button on a sub-page. */
  backLabel: string;
  fields: FilterSheetField[];
  resetLabel: string;
  onReset: () => void;
  resetDisabled?: boolean;
  /** Primary button on the list view, e.g. "Show 52 results"; closes the sheet. */
  applyLabel: string;
  /** Primary button inside a sub-page; returns to the list. */
  doneLabel: string;
  className?: string;
};

type ToggleField = Extract<FilterSheetField, { kind: "toggle" }>;
type SingleField = Extract<FilterSheetField, { kind: "single" }>;
type MultiField = Extract<FilterSheetField, { kind: "multi" }>;
type PageField = Extract<FilterSheetField, { kind: "page" }>;

function isActive(field: FilterSheetField): boolean {
  switch (field.kind) {
    case "toggle":
      return false;
    case "single":
      return field.value !== null;
    case "multi":
      return field.values.length > 0;
    case "link":
    case "page":
      return field.active === true;
  }
}

function fieldSummary(
  field: FilterSheetField,
  separator: string,
): string | undefined {
  if (field.kind === "toggle") {
    return undefined;
  }
  if (field.summary !== undefined) {
    return field.summary;
  }
  if (field.kind === "single") {
    return field.options.find((option) => option.value === field.value)?.label;
  }
  if (field.kind === "multi") {
    const labels = field.options
      .filter((option) => field.values.includes(option.value))
      .map((option) => option.label);
    return labels.length > 0 ? labels.join(separator) : undefined;
  }
  return undefined;
}

/** Folds Persian letters and digits so `۱۲` matches `12` and `ی` matches `ي`. */
function normalizeForSearch(text: string): string {
  return toLatinDigits(foldPersian(text)).toLowerCase();
}

/**
 * Search state of a sub-page. With `search.onValueChange` the query is the
 * controlled `search.value` and options are not filtered. Without it the
 * query is local state and options are filtered on their label.
 */
function useOptionSearch(
  search: FilterSheetSearch | undefined,
  options: FilterSheetOption[],
) {
  const [localQuery, setLocalQuery] = React.useState("");
  const onValueChange = search?.onValueChange;
  const query = onValueChange ? (search?.value ?? "") : localQuery;
  const setQuery = (next: string) => {
    if (onValueChange) {
      onValueChange(next);
    } else {
      setLocalQuery(next);
    }
  };
  const needle = normalizeForSearch(query.trim());
  const visible =
    onValueChange || needle === ""
      ? options
      : options.filter((option) =>
          normalizeForSearch(option.label).includes(needle),
        );
  return { query, setQuery, visible };
}

function SearchField({
  search,
  query,
  setQuery,
}: {
  search: FilterSheetSearch;
  query: string;
  setQuery: (next: string) => void;
}): JSX.Element {
  return (
    <div className="sticky top-0 z-10 bg-background px-3 pt-3 pb-2">
      <SearchInput
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        onClear={() => setQuery("")}
        placeholder={search.placeholder}
        aria-label={search.placeholder}
      />
    </div>
  );
}

function OptionContent({ option }: { option: FilterSheetOption }): JSX.Element {
  return (
    <span className="flex min-w-0 flex-col text-start">
      <span className="truncate text-sm font-medium text-foreground">
        {option.label}
      </span>
      {option.description ? (
        <span className="text-xs text-muted-foreground">
          {option.description}
        </span>
      ) : null}
    </span>
  );
}

function SingleSubPage({
  field,
  onDone,
}: {
  field: SingleField;
  onDone: () => void;
}): JSX.Element {
  const { query, setQuery, visible } = useOptionSearch(
    field.search,
    field.options,
  );
  const choose = (value: string | null) => {
    field.onValueChange(value);
    onDone();
  };
  const list = (
    <RowList className="px-1">
      {field.allLabel !== undefined ? (
        <Row selected={field.value === null} onPress={() => choose(null)}>
          <span className="text-sm font-medium text-foreground">
            {field.allLabel}
          </span>
        </Row>
      ) : null}
      {visible.map((option) => (
        <Row
          key={option.value}
          selected={field.value === option.value}
          onPress={() => choose(option.value)}
        >
          <OptionContent option={option} />
        </Row>
      ))}
    </RowList>
  );
  return (
    <>
      {field.search ? (
        <SearchField search={field.search} query={query} setQuery={setQuery} />
      ) : null}
      {field.status ? field.status : list}
      {field.after}
    </>
  );
}

function MultiSubPage({ field }: { field: MultiField }): JSX.Element {
  const { query, setQuery, visible } = useOptionSearch(
    field.search,
    field.options,
  );
  const toggle = (value: string) => {
    field.onValuesChange(
      field.values.includes(value)
        ? field.values.filter((item) => item !== value)
        : [...field.values, value],
    );
  };
  const list = (
    <RowList className="px-1">
      {visible.map((option) => (
        <Row
          key={option.value}
          pressed={field.values.includes(option.value)}
          onPress={() => toggle(option.value)}
        >
          <OptionContent option={option} />
        </Row>
      ))}
    </RowList>
  );
  return (
    <>
      {field.search ? (
        <SearchField search={field.search} query={query} setQuery={setQuery} />
      ) : null}
      {field.status ? field.status : list}
      {field.after}
    </>
  );
}

function ToggleRow({ field }: { field: ToggleField }): JSX.Element {
  const switchId = React.useId();
  return (
    <Row
      trailing={
        <Switch
          id={switchId}
          size="touch"
          checked={field.checked}
          onCheckedChange={field.onCheckedChange}
          className="relative z-10"
        />
      }
    >
      <label
        htmlFor={switchId}
        className="flex min-w-0 flex-1 cursor-pointer items-center gap-3 py-2 text-start after:absolute after:inset-0 after:content-['']"
      >
        {field.icon ? <span className="shrink-0">{field.icon}</span> : null}
        <span className="flex min-w-0 flex-col">
          <span className="text-sm font-medium text-foreground">
            {field.label}
          </span>
          {field.description ? (
            <span className="text-xs text-muted-foreground">
              {field.description}
            </span>
          ) : null}
        </span>
      </label>
    </Row>
  );
}

function NavRow({
  field,
  separator,
  onPress,
}: {
  field: Exclude<FilterSheetField, { kind: "toggle" }>;
  separator: string;
  onPress: () => void;
}): JSX.Element {
  const summary = isActive(field) ? fieldSummary(field, separator) : undefined;
  return (
    <Row chevron onPress={onPress}>
      <span className="flex min-w-0 flex-1 items-center gap-3 text-start">
        {field.icon ? <span className="shrink-0">{field.icon}</span> : null}
        <span className="flex min-w-0 flex-col">
          <span className="truncate text-sm font-medium text-foreground">
            {field.label}
          </span>
          {summary ? (
            <span className="truncate text-xs text-primary">{summary}</span>
          ) : null}
        </span>
      </span>
    </Row>
  );
}

/**
 * Bottom sheet of filter rows. Each row is a navigation row that opens a
 * sub-page (single choice, multi choice or custom page), a link row, or a
 * toggle row with a switch. The footer has reset and apply on the list view
 * and done on a sub-page. Closing the sheet returns to the list view.
 */
export function FilterSheet({
  open,
  onOpenChange,
  title,
  closeLabel,
  backLabel,
  fields,
  resetLabel,
  onReset,
  resetDisabled = false,
  applyLabel,
  doneLabel,
  className,
}: FilterSheetProps): JSX.Element {
  const direction = useDirection();
  const separator = direction === "rtl" ? "، " : ", ";
  const [view, setView] = React.useState<string | null>(null);
  const [wasOpen, setWasOpen] = React.useState(open);
  // Reset on open, not on close, so the sub-page stays put during the exit animation.
  if (wasOpen !== open) {
    setWasOpen(open);
    if (open) {
      setView(null);
    }
  }

  const currentField =
    view === null
      ? undefined
      : fields.find(
          (field): field is SingleField | MultiField | PageField =>
            field.id === view &&
            (field.kind === "single" ||
              field.kind === "multi" ||
              field.kind === "page"),
        );
  if (view !== null && currentField === undefined) {
    setView(null);
  }
  const currentId = currentField?.id ?? null;

  const headingRef = React.useRef<HTMLHeadingElement | null>(null);
  const bodyRef = React.useRef<HTMLDivElement | null>(null);
  const lastViewRef = React.useRef<string | null>(currentId);
  React.useEffect(() => {
    if (lastViewRef.current === currentId) {
      return;
    }
    lastViewRef.current = currentId;
    headingRef.current?.focus();
    if (bodyRef.current) {
      bodyRef.current.scrollTop = 0;
    }
  }, [currentId]);

  const goBack = () => setView(null);

  let body: React.ReactNode;
  if (currentField === undefined) {
    body = (
      <RowList className="px-1">
        {fields.map((field) =>
          field.kind === "toggle" ? (
            <ToggleRow key={field.id} field={field} />
          ) : (
            <NavRow
              key={field.id}
              field={field}
              separator={separator}
              onPress={() => {
                if (field.kind === "link") {
                  field.onPress();
                } else {
                  setView(field.id);
                }
              }}
            />
          ),
        )}
      </RowList>
    );
  } else if (currentField.kind === "single") {
    body = <SingleSubPage field={currentField} onDone={goBack} />;
  } else if (currentField.kind === "multi") {
    body = <MultiSubPage field={currentField} />;
  } else {
    body = <div className="p-4">{currentField.children}</div>;
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="bottom"
        showCloseButton={false}
        onEscapeKeyDown={(event) => {
          if (currentField !== undefined) {
            event.preventDefault();
            goBack();
          }
        }}
        className={cn(
          "flex h-dvh flex-col gap-0 p-0 md:mx-auto md:h-[min(100dvh,48rem)] md:inset-x-0 md:max-w-lg md:rounded-t-xl",
          className,
        )}
      >
        <SheetDescription className="sr-only">{title}</SheetDescription>
        <div className="flex min-h-14 items-center gap-2 border-b border-border px-2">
          <Button
            type="button"
            variant="ghost"
            size="icon-touch"
            aria-label={currentField ? backLabel : closeLabel}
            onClick={currentField ? goBack : () => onOpenChange(false)}
          >
            {currentField ? (
              <ChevronLeftIcon className="rtl:rotate-180" aria-hidden="true" />
            ) : (
              <XMarkIcon aria-hidden="true" />
            )}
          </Button>
          <SheetTitle
            ref={headingRef}
            tabIndex={-1}
            className="min-w-0 flex-1 truncate text-base font-semibold text-foreground outline-hidden"
          >
            {currentField ? currentField.label : title}
          </SheetTitle>
        </div>
        <div
          ref={bodyRef}
          className="min-h-0 flex-1 overflow-y-auto overscroll-contain"
        >
          <div
            key={currentId ?? "list"}
            className="motion-safe:animate-in motion-safe:fade-in-0 motion-safe:duration-150"
          >
            {body}
          </div>
        </div>
        {currentField === undefined ? (
          <div className="flex gap-2 border-t border-border bg-card p-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
            <Button
              type="button"
              variant="ghost"
              className="min-h-11 flex-1 text-primary"
              disabled={resetDisabled}
              onClick={onReset}
            >
              {resetLabel}
            </Button>
            <Button
              type="button"
              className="min-h-11 flex-[2]"
              onClick={() => onOpenChange(false)}
            >
              {applyLabel}
            </Button>
          </div>
        ) : (
          <div className="flex gap-2 border-t border-border bg-card p-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
            <Button type="button" className="min-h-11 w-full" onClick={goBack}>
              {doneLabel}
            </Button>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}

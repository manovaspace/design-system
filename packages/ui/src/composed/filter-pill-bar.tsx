"use client";

import * as React from "react";

import { useDirection } from "../direction-provider.js";
import { CheckIcon, ChevronDownIcon, XMarkIcon } from "../icons.js";
import { foldPersian } from "../lib/persian.js";
import { cn } from "../lib/utils.js";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "../sheet.js";
import { SearchInput } from "./search-input.js";

export type FilterPillOption = { value: string; label: string };

export type FilterPillGroup =
  | {
      kind: "toggle";
      id: string;
      label: string;
      options: FilterPillOption[];
      value: string | null;
      onChange(value: string | null): void;
      allLabel?: string;
    }
  | {
      kind: "menu";
      id: string;
      label: string;
      options: FilterPillOption[];
      value: string | null;
      onChange(value: string | null): void;
      allLabel: string;
      searchPlaceholder?: string;
    };

export interface FilterPillBarProps {
  groups: FilterPillGroup[];
  "aria-label": string;
  /** Label of the clear-all pill. Defaults to "Clear". */
  clearLabel?: string;
  /** Shows a clear-all pill while any group has a value. */
  onClearAll?(): void;
  className?: string;
}

/** Menus with more options than this get a search field in the picker. */
const MENU_SEARCH_THRESHOLD = 8;

/**
 * Scroll row classes. `--fade-l` and `--fade-r` are physical edges and are set
 * to 1.5rem only on the side that has hidden content. The mask classes are
 * written out in full so Tailwind's source scan generates them.
 */
const SCROLL_ROW_CLASS = [
  "flex flex-nowrap items-center gap-2 overflow-x-auto overscroll-x-contain scroll-px-4 snap-x",
  "[scrollbar-width:none] [&::-webkit-scrollbar]:hidden",
  "[--fade-l:0px] [--fade-r:0px]",
  "data-[fade-left=true]:[--fade-l:1.5rem] data-[fade-right=true]:[--fade-r:1.5rem]",
  "[mask-image:linear-gradient(to_right,transparent_0px,black_var(--fade-l),black_calc(100%_-_var(--fade-r)),transparent_100%)]",
  "[-webkit-mask-image:linear-gradient(to_right,transparent_0px,black_var(--fade-l),black_calc(100%_-_var(--fade-r)),transparent_100%)]",
].join(" ");

type FadeState = { left: boolean; right: boolean };

function pillKey(id: string, value: string | null | "menu"): string {
  return JSON.stringify([id, value]);
}

function groupPillKey(group: FilterPillGroup): string {
  return group.kind === "menu"
    ? pillKey(group.id, "menu")
    : pillKey(group.id, group.value);
}

type PillProps = React.ComponentProps<"button"> & {
  active: boolean;
  pillKey: string;
};

function Pill({
  active,
  pillKey: key,
  className,
  children,
  ...props
}: PillProps) {
  return (
    <button
      type="button"
      data-pill-key={key}
      data-active={active ? "true" : undefined}
      className={cn(
        "group inline-flex min-h-11 shrink-0 snap-start items-center whitespace-nowrap rounded-full outline-hidden cursor-pointer",
        className,
      )}
      {...props}
    >
      <span
        className={cn(
          "inline-flex h-9 items-center gap-1.5 rounded-full border px-3.5 text-sm font-medium transition-colors group-focus-visible:ring-2 group-focus-visible:ring-ring",
          active
            ? "border-primary bg-primary text-primary-foreground"
            : "border-border bg-card text-foreground hover:bg-muted",
        )}
      >
        {children}
      </span>
    </button>
  );
}

function TogglePills({
  group,
}: {
  group: Extract<FilterPillGroup, { kind: "toggle" }>;
}) {
  return (
    // biome-ignore lint/a11y/useSemanticElements: role="group" is the ARIA pattern for a pill set with a label
    <div
      role="group"
      aria-label={group.label}
      className="flex shrink-0 items-center gap-2"
    >
      {group.allLabel !== undefined ? (
        <Pill
          pillKey={pillKey(group.id, null)}
          active={group.value === null}
          aria-pressed={group.value === null}
          onClick={() => group.onChange(null)}
        >
          {group.allLabel}
        </Pill>
      ) : null}
      {group.options.map((option) => {
        const selected = group.value === option.value;
        return (
          <Pill
            key={option.value}
            pillKey={pillKey(group.id, option.value)}
            active={selected}
            aria-pressed={selected}
            onClick={() => group.onChange(selected ? null : option.value)}
          >
            {option.label}
          </Pill>
        );
      })}
    </div>
  );
}

function MenuPill({
  group,
}: {
  group: Extract<FilterPillGroup, { kind: "menu" }>;
}) {
  const [open, setOpen] = React.useState(false);
  const [query, setQuery] = React.useState("");

  const selected = group.options.find((option) => option.value === group.value);
  const needle = foldPersian(query.trim()).toLowerCase();
  const visibleOptions =
    needle === ""
      ? group.options
      : group.options.filter((option) =>
          foldPersian(option.label).toLowerCase().includes(needle),
        );

  const choose = (value: string | null) => {
    group.onChange(value);
    setOpen(false);
    setQuery("");
  };

  return (
    // biome-ignore lint/a11y/useSemanticElements: role="group" is the ARIA pattern for a pill set with a label
    <div
      role="group"
      aria-label={group.label}
      className="flex shrink-0 items-center"
    >
      <Pill
        pillKey={pillKey(group.id, "menu")}
        active={group.value !== null}
        aria-haspopup="dialog"
        aria-expanded={open}
        onClick={() => setOpen(true)}
      >
        <span>{selected ? selected.label : group.label}</span>
        <ChevronDownIcon className="size-3.5 shrink-0" aria-hidden="true" />
      </Pill>
      <Sheet
        open={open}
        onOpenChange={(next) => {
          setOpen(next);
          if (!next) setQuery("");
        }}
      >
        <SheetContent
          side="bottom"
          className="flex max-h-[85dvh] flex-col gap-0 p-0"
        >
          <SheetHeader className="border-b border-border px-4 py-4">
            <SheetTitle>{group.label}</SheetTitle>
            <SheetDescription className="sr-only">
              {group.label}
            </SheetDescription>
          </SheetHeader>
          {group.options.length > MENU_SEARCH_THRESHOLD ? (
            <div className="px-4 pt-3">
              <SearchInput
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                onClear={() => setQuery("")}
                placeholder={group.searchPlaceholder}
                aria-label={group.searchPlaceholder ?? group.label}
              />
            </div>
          ) : null}
          <div
            role="radiogroup"
            aria-label={group.label}
            className="flex min-h-0 flex-1 flex-col overflow-y-auto overscroll-contain p-2"
          >
            <MenuOption
              checked={group.value === null}
              onSelect={() => choose(null)}
            >
              {group.allLabel}
            </MenuOption>
            {visibleOptions.map((option) => (
              <MenuOption
                key={option.value}
                checked={group.value === option.value}
                onSelect={() => choose(option.value)}
              >
                {option.label}
              </MenuOption>
            ))}
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}

function MenuOption({
  checked,
  onSelect,
  children,
}: {
  checked: boolean;
  onSelect: () => void;
  children: React.ReactNode;
}) {
  return (
    // biome-ignore lint/a11y/useSemanticElements: ARIA radio button pattern inside a picker sheet
    <button
      type="button"
      role="radio"
      aria-checked={checked}
      onClick={onSelect}
      className="flex min-h-11 w-full items-center justify-between gap-3 rounded-md px-3 text-start text-sm text-foreground outline-hidden cursor-pointer hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring"
    >
      <span>{children}</span>
      {checked ? (
        <CheckIcon
          className="size-4 shrink-0 text-primary"
          aria-hidden="true"
        />
      ) : null}
    </button>
  );
}

/**
 * One single-line, horizontally scrollable row of filter pills. Toggle groups
 * are single-select pills; menu groups open a picker in a bottom sheet.
 */
export function FilterPillBar({
  groups,
  "aria-label": ariaLabel,
  clearLabel = "Clear",
  onClearAll,
  className,
}: FilterPillBarProps) {
  const direction = useDirection();
  const scrollRef = React.useRef<HTMLDivElement>(null);
  const previousValues = React.useRef<Map<string, string | null>>(new Map());
  const [fade, setFade] = React.useState<FadeState>({
    left: false,
    right: false,
  });

  const hasValue = groups.some((group) => group.value !== null);
  const showClear = Boolean(onClearAll) && hasValue;

  const updateFade = React.useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    const computed =
      typeof window !== "undefined"
        ? window.getComputedStyle(el).direction
        : "";
    // Computed direction wins; otherwise the nearest dir attribute, then the
    // DirectionProvider value.
    const dirAttribute = el.closest("[dir]")?.getAttribute("dir");
    const isRtl =
      computed === "rtl" ||
      (dirAttribute ? dirAttribute === "rtl" : direction === "rtl");
    const maxScroll = el.scrollWidth - el.clientWidth;
    // Chromium, Firefox and WebKit report RTL scrollLeft as 0 at the start
    // edge (right) and negative toward the end, so the magnitude is used.
    const position = Math.abs(el.scrollLeft);
    const hiddenAtStart = maxScroll > 1 && position > 1;
    const hiddenAtEnd = maxScroll > 1 && position < maxScroll - 1;
    const next: FadeState = isRtl
      ? { left: hiddenAtEnd, right: hiddenAtStart }
      : { left: hiddenAtStart, right: hiddenAtEnd };
    setFade((prev) =>
      prev.left === next.left && prev.right === next.right ? prev : next,
    );
  }, [direction]);

  React.useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    updateFade();
    el.addEventListener("scroll", updateFade, { passive: true });
    window.addEventListener("resize", updateFade);
    const observer =
      typeof ResizeObserver !== "undefined"
        ? new ResizeObserver(updateFade)
        : null;
    observer?.observe(el);
    return () => {
      el.removeEventListener("scroll", updateFade);
      window.removeEventListener("resize", updateFade);
      observer?.disconnect();
    };
  }, [updateFade]);

  // Content changes (groups, clear pill) can change scrollWidth without
  // resizing the viewport, so recompute the fade after each render. The
  // setter bails out when the edges did not change.
  React.useEffect(() => {
    updateFade();
  });

  // Scroll a pill into view when its group value changed (press or programmatic).
  React.useEffect(() => {
    const root = scrollRef.current;
    if (!root) return;
    const next = new Map<string, string | null>();
    let target: HTMLElement | undefined;
    for (const group of groups) {
      next.set(group.id, group.value);
      const previous = previousValues.current;
      if (previous.has(group.id) && previous.get(group.id) !== group.value) {
        const key = groupPillKey(group);
        target = Array.from(
          root.querySelectorAll<HTMLElement>("[data-pill-key]"),
        ).find((el) => el.dataset.pillKey === key);
      }
    }
    previousValues.current = next;
    if (target && typeof target.scrollIntoView === "function") {
      target.scrollIntoView({ inline: "nearest", block: "nearest" });
    }
  }, [groups]);

  return (
    // biome-ignore lint/a11y/useSemanticElements: role="group" is the ARIA pattern for a pill set with a label
    <div
      role="group"
      aria-label={ariaLabel}
      data-slot="filter-pill-bar"
      className={cn("min-w-0", className)}
    >
      <div
        ref={scrollRef}
        data-fade-left={fade.left ? "true" : "false"}
        data-fade-right={fade.right ? "true" : "false"}
        className={SCROLL_ROW_CLASS}
      >
        {groups.map((group, index) => (
          <React.Fragment key={group.id}>
            {index > 0 ? (
              <span
                aria-hidden="true"
                className="h-6 w-px shrink-0 bg-border"
              />
            ) : null}
            {group.kind === "menu" ? (
              <MenuPill group={group} />
            ) : (
              <TogglePills group={group} />
            )}
          </React.Fragment>
        ))}
        {showClear ? (
          <Pill
            pillKey={pillKey("__clear__", null)}
            active={false}
            onClick={() => onClearAll?.()}
          >
            <XMarkIcon className="size-3.5 shrink-0" aria-hidden="true" />
            <span>{clearLabel}</span>
          </Pill>
        ) : null}
      </div>
    </div>
  );
}

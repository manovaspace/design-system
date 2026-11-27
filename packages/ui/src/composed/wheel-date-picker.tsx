"use client";

import { type KeyboardEvent, useEffect, useRef, useState } from "react";
import DateObject from "react-date-object";
import gregorian from "react-date-object/calendars/gregorian";
import persian from "react-date-object/calendars/persian";
import { Button } from "../button.js";
import { CalendarIcon } from "../icons.js";
import {
  fieldControlVariants,
  resolveFieldState,
} from "../lib/field-control.js";
import { persianizeDigits } from "../lib/persian.js";
import { cn } from "../lib/utils.js";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "../sheet.js";

/** @experimental */
export type WheelDatePickerProps = {
  /** "YYYY-MM-DD" Gregorian. Empty or undefined shows the placeholder. */
  value?: string;
  /** Emits "YYYY-MM-DD" Gregorian, only on confirm. */
  onValueChange: (next: string) => void;
  /** "YYYY-MM-DD" Gregorian lower bound. Earlier days are disabled. */
  min?: string;
  /** "YYYY-MM-DD" Gregorian upper bound. Later days are disabled. */
  max?: string;
  /** Only "fa" is supported. Defaults to "fa". */
  locale?: "fa";
  disabled?: boolean;
  /** Shown when no value is set. */
  placeholder?: string;
  labels?: {
    title?: string;
    confirm?: string;
    cancel?: string;
    year?: string;
    month?: string;
    day?: string;
  };
  /** Forwarded to the trigger button, so an external `<label htmlFor>` names the field. */
  id?: string;
  /** Accessible name for the trigger. */
  "aria-label"?: string;
  /** Accessible name source for the trigger, e.g. the id of an external label. */
  "aria-labelledby"?: string;
  "aria-invalid"?: boolean | "true" | "false";
  "aria-describedby"?: string;
  size?: "default" | "touch";
  className?: string;
};

type JalaliDate = { year: number; month: number; day: number };

type WheelOption = { value: number; label: string; disabled: boolean };

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;
const JALALI_MONTH_NAMES = [
  "فروردین",
  "اردیبهشت",
  "خرداد",
  "تیر",
  "مرداد",
  "شهریور",
  "مهر",
  "آبان",
  "آذر",
  "دی",
  "بهمن",
  "اسفند",
] as const;
const YEARS_BACK = 100;
const YEARS_FORWARD = 20;
const SCROLL_SETTLE_MS = 120;

const DEFAULT_LABELS = {
  title: "انتخاب تاریخ",
  confirm: "تأیید",
  cancel: "انصراف",
  year: "سال",
  month: "ماه",
  day: "روز",
};

const pad2 = (value: number) => String(value).padStart(2, "0");

function isoToJalali(iso: string): JalaliDate {
  const date = new DateObject({
    date: iso,
    format: "YYYY-MM-DD",
    calendar: gregorian,
  }).convert(persian);
  return { year: date.year, month: date.month.number, day: date.day };
}

function jalaliToIso(date: JalaliDate): string {
  const gregorianDate = new DateObject({
    year: date.year,
    month: date.month,
    day: date.day,
    calendar: persian,
  }).convert(gregorian);
  return `${gregorianDate.year}-${pad2(gregorianDate.month.number)}-${pad2(gregorianDate.day)}`;
}

function jalaliMonthLength(year: number, month: number): number {
  return new DateObject({ year, month, day: 1, calendar: persian }).month
    .length;
}

/** Today's calendar date in Asia/Tehran (+03:30, no DST), as "YYYY-MM-DD". */
function tehranTodayIso(): string {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: "Asia/Tehran",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(new Date());
  const read = (type: Intl.DateTimeFormatPartTypes) =>
    parts.find((part) => part.type === type)?.value ?? "";
  return `${read("year")}-${read("month")}-${read("day")}`;
}

const validIso = (value: string | undefined): string | undefined =>
  value && ISO_DATE.test(value) ? value : undefined;

/** True when the inclusive [first, last] ISO span lies entirely outside [min, max]. */
function spanOutOfBounds(
  first: string,
  last: string,
  min: string | undefined,
  max: string | undefined,
): boolean {
  return (
    (min !== undefined && last < min) || (max !== undefined && first > max)
  );
}

function clampDay(date: JalaliDate): JalaliDate {
  return {
    ...date,
    day: Math.min(date.day, jalaliMonthLength(date.year, date.month)),
  };
}

function centerItem(list: HTMLElement, index: number) {
  const item = list.querySelectorAll<HTMLElement>('[role="option"]')[index];
  if (!item) return;
  list.scrollTop =
    item.offsetTop + item.offsetHeight / 2 - list.clientHeight / 2;
}

type WheelColumnProps = {
  label: string;
  options: WheelOption[];
  selected: number;
  onSelect: (value: number) => void;
};

function WheelColumn({ label, options, selected, onSelect }: WheelColumnProps) {
  const listRef = useRef<HTMLDivElement>(null);
  const settleTimer = useRef<ReturnType<typeof setTimeout> | undefined>(
    undefined,
  );
  const selectedIndex = options.findIndex(
    (option) => option.value === selected,
  );

  // Keep the selected row centred whenever the selection changes.
  useEffect(() => {
    const list = listRef.current;
    if (list && selectedIndex >= 0) centerItem(list, selectedIndex);
  }, [selectedIndex]);

  useEffect(() => () => clearTimeout(settleTimer.current), []);

  const handleScroll = () => {
    clearTimeout(settleTimer.current);
    settleTimer.current = setTimeout(() => {
      const list = listRef.current;
      if (!list) return;
      const itemHeight =
        list.querySelector<HTMLElement>('[role="option"]')?.offsetHeight || 1;
      const index = Math.min(
        Math.max(Math.round(list.scrollTop / itemHeight), 0),
        options.length - 1,
      );
      const next = options[index];
      if (!next || next.disabled) {
        if (selectedIndex >= 0) centerItem(list, selectedIndex);
        return;
      }
      if (next.value !== selected) onSelect(next.value);
    }, SCROLL_SETTLE_MS);
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === "Enter") {
      event.preventDefault();
      if (selectedIndex >= 0 && !options[selectedIndex]?.disabled) {
        onSelect(selected);
      }
      return;
    }
    if (event.key !== "ArrowDown" && event.key !== "ArrowUp") return;
    event.preventDefault();
    const step = event.key === "ArrowDown" ? 1 : -1;
    let index = selectedIndex + step;
    while (index >= 0 && index < options.length && options[index]?.disabled) {
      index += step;
    }
    const next = options[index];
    if (next && !next.disabled) onSelect(next.value);
  };

  return (
    <div className="flex min-w-0 flex-col gap-1">
      <span className="text-center text-xs text-muted-foreground">{label}</span>
      <div className="relative">
        <div
          ref={listRef}
          role="listbox"
          tabIndex={0}
          aria-label={label}
          onScroll={handleScroll}
          onKeyDown={handleKeyDown}
          className="relative h-[200px] snap-y snap-mandatory overflow-y-auto overscroll-contain rounded-[var(--radius-lg)] py-20 outline-none focus-visible:ring-2 focus-visible:ring-ring/50"
        >
          {options.map((option) => (
            <div
              key={option.value}
              role="option"
              tabIndex={-1}
              aria-selected={option.value === selected}
              aria-disabled={option.disabled}
              onClick={() => {
                if (!option.disabled) onSelect(option.value);
              }}
              onKeyDown={(event) => {
                if (event.key !== "Enter" && event.key !== " ") return;
                event.preventDefault();
                event.stopPropagation();
                if (!option.disabled) onSelect(option.value);
              }}
              className={cn(
                "flex h-10 snap-center cursor-pointer select-none items-center justify-center text-sm",
                option.value === selected
                  ? "font-semibold text-foreground"
                  : "text-muted-foreground",
                option.disabled && "cursor-not-allowed opacity-50",
              )}
            >
              {option.label}
            </div>
          ))}
        </div>
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 top-1/2 h-10 -translate-y-1/2 border-y border-border"
        />
      </div>
    </div>
  );
}

/**
 * Jalali (Persian) wheel-style date picker. Opens a bottom sheet with year,
 * month and day columns. The value is Gregorian "YYYY-MM-DD".
 * @experimental
 */
export function WheelDatePicker({
  value,
  onValueChange,
  min,
  max,
  disabled,
  placeholder,
  labels,
  id,
  "aria-label": ariaLabel,
  "aria-labelledby": ariaLabelledBy,
  "aria-invalid": ariaInvalid,
  "aria-describedby": ariaDescribedBy,
  size = "default",
  className,
}: WheelDatePickerProps) {
  const text = { ...DEFAULT_LABELS, ...labels };
  const minIso = validIso(min);
  const maxIso = validIso(max);
  const selectedIso = validIso(value);

  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState<JalaliDate>(() =>
    isoToJalali(selectedIso ?? tehranTodayIso()),
  );

  const handleOpenChange = (next: boolean) => {
    if (next) {
      setDraft(isoToJalali(selectedIso ?? tehranTodayIso()));
    }
    setOpen(next);
  };

  const selected = selectedIso ? isoToJalali(selectedIso) : null;
  const triggerText = selected
    ? persianizeDigits(
        `${selected.year}/${pad2(selected.month)}/${pad2(selected.day)}`,
      )
    : placeholder || text.title;

  const todayYear = isoToJalali(tehranTodayIso()).year;
  // The window is today-100..today+20; a draft outside it still gets a row.
  const firstYear = Math.min(todayYear - YEARS_BACK, draft.year);
  const lastYear = Math.max(todayYear + YEARS_FORWARD, draft.year);
  const years: WheelOption[] = [];
  for (let year = firstYear; year <= lastYear; year += 1) {
    const first = jalaliToIso({ year, month: 1, day: 1 });
    const last = jalaliToIso({
      year,
      month: 12,
      day: jalaliMonthLength(year, 12),
    });
    years.push({
      value: year,
      label: persianizeDigits(year),
      disabled: spanOutOfBounds(first, last, minIso, maxIso),
    });
  }

  const months: WheelOption[] = JALALI_MONTH_NAMES.map((name, index) => {
    const month = index + 1;
    const first = jalaliToIso({ year: draft.year, month, day: 1 });
    const last = jalaliToIso({
      year: draft.year,
      month,
      day: jalaliMonthLength(draft.year, month),
    });
    return {
      value: month,
      label: name,
      disabled: spanOutOfBounds(first, last, minIso, maxIso),
    };
  });

  const dayCount = jalaliMonthLength(draft.year, draft.month);
  const days: WheelOption[] = [];
  for (let day = 1; day <= dayCount; day += 1) {
    const iso = jalaliToIso({ year: draft.year, month: draft.month, day });
    days.push({
      value: day,
      label: persianizeDigits(day),
      disabled: spanOutOfBounds(iso, iso, minIso, maxIso),
    });
  }

  const draftIso = jalaliToIso(draft);
  const draftInBounds = !spanOutOfBounds(draftIso, draftIso, minIso, maxIso);

  const confirm = () => {
    if (!draftInBounds) return;
    onValueChange(draftIso);
    setOpen(false);
  };

  return (
    <Sheet open={open} onOpenChange={handleOpenChange}>
      <SheetTrigger asChild>
        <button
          type="button"
          id={id}
          disabled={disabled}
          aria-haspopup="dialog"
          aria-label={ariaLabel}
          aria-labelledby={ariaLabelledBy}
          aria-invalid={ariaInvalid}
          aria-describedby={ariaDescribedBy}
          className={cn(
            fieldControlVariants({
              size,
              state: resolveFieldState({
                disabled,
                invalid: ariaInvalid === true || ariaInvalid === "true",
              }),
              adornment: "none",
            }),
            "flex cursor-pointer items-center justify-start gap-2 font-normal",
            !selected && "text-muted-foreground",
            className,
          )}
        >
          <CalendarIcon className="size-4 shrink-0" aria-hidden="true" />
          <span className="truncate">{triggerText}</span>
        </button>
      </SheetTrigger>
      <SheetContent
        side="bottom"
        className="max-h-[60vh] overflow-y-auto bg-background text-foreground"
      >
        <SheetHeader>
          <SheetTitle>{text.title}</SheetTitle>
          <SheetDescription className="sr-only">{text.title}</SheetDescription>
        </SheetHeader>
        <div className="grid grid-cols-3 gap-2 px-4 pb-2">
          <WheelColumn
            label={text.year}
            options={years}
            selected={draft.year}
            onSelect={(year) =>
              setDraft((current) => clampDay({ ...current, year }))
            }
          />
          <WheelColumn
            label={text.month}
            options={months}
            selected={draft.month}
            onSelect={(month) =>
              setDraft((current) => clampDay({ ...current, month }))
            }
          />
          <WheelColumn
            label={text.day}
            options={days}
            selected={draft.day}
            onSelect={(day) => setDraft((current) => ({ ...current, day }))}
          />
        </div>
        <SheetFooter className="flex-row gap-2 px-4 pb-4">
          <Button
            type="button"
            variant="outline"
            className="flex-1"
            onClick={() => setOpen(false)}
          >
            {text.cancel}
          </Button>
          <Button
            type="button"
            className="flex-1"
            disabled={!draftInBounds}
            onClick={confirm}
          >
            {text.confirm}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}

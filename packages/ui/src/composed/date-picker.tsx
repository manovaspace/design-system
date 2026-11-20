"use client";

import { type KeyboardEvent, type MouseEvent, useId, useState } from "react";
import type { Calendar, Locale } from "react-date-object";
import gregorian from "react-date-object/calendars/gregorian";
import persian from "react-date-object/calendars/persian";
import gregorianEn from "react-date-object/locales/gregorian_en";
import persianFa from "react-date-object/locales/persian_fa";
import DatePickerPrimitive, { DateObject } from "react-multi-date-picker";
import { Button } from "../button.js";
import {
  CalendarIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  XMarkIcon,
} from "../icons.js";
import { cn } from "../lib/utils.js";
import { useLocalePreference } from "../locale-preference.js";
import { Popover, PopoverContent, PopoverTrigger } from "../popover.js";
import {
  describeCalendarDay,
  useCalendarKeyboard,
} from "./use-calendar-keyboard.js";

/** @experimental */
export type DatePickerProps = {
  /** Gregorian date as `YYYY-MM-DD`. Malformed or impossible values render empty. */
  value?: string;
  /** Emits a Gregorian `YYYY-MM-DD` date, or `""` after clearing. */
  onValueChange: (value: string) => void;
  /** Visible label shown before the trigger and included in its accessible name. */
  label?: string;
  placeholder?: string;
  /** Defaults to the active locale from LocalePreferenceProvider. */
  locale?: "fa" | "en";
  disabled?: boolean;
  /** Shows a clear button while a value is set. */
  clearable?: boolean;
  /** Called after the value has been cleared. */
  onClear?: () => void;
  /** Earliest selectable day, `YYYY-MM-DD`. Earlier days are disabled. */
  minDate?: string;
  /** Latest selectable day, `YYYY-MM-DD`. Later days are disabled. */
  maxDate?: string;
  /** Forwarded to the trigger button, so an external `<label htmlFor>` names the field. */
  id?: string;
  /** Accessible name for the trigger when `label` is not set. Ignored when `label` is set. */
  "aria-label"?: string;
  /** Accessible name source for the trigger when `label` is not set. Ignored when `label` is set. */
  "aria-labelledby"?: string;
  className?: string;
  size?: "default" | "sm";
};

type IsoDateParts = { year: number; month: number; day: number };

const ISO_DATE_PATTERN = /^(\d{4})-(\d{2})-(\d{2})$/;

/** Parses a strict `YYYY-MM-DD` string. Returns null for malformed or impossible dates. */
function parseIsoDate(value: string | null | undefined): IsoDateParts | null {
  if (!value) return null;
  const match = ISO_DATE_PATTERN.exec(value);
  if (!match) return null;
  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const probe = new Date(Date.UTC(year, month - 1, day));
  if (
    probe.getUTCFullYear() !== year ||
    probe.getUTCMonth() !== month - 1 ||
    probe.getUTCDate() !== day
  ) {
    return null;
  }
  return { year, month, day };
}

function toDateObject(
  value: string,
  calendar: Calendar,
  locale: Locale,
): DateObject | undefined {
  const parts = parseIsoDate(value);
  if (!parts) return undefined;
  return new DateObject({
    year: parts.year,
    month: parts.month,
    day: parts.day,
    calendar: gregorian,
    locale,
  }).convert(calendar);
}

function toIsoDate(date: DateObject): string {
  const gregorianDate = date.convert(gregorian);
  return `${gregorianDate.year}-${String(gregorianDate.month.number).padStart(2, "0")}-${String(gregorianDate.day).padStart(2, "0")}`;
}

function isWithinBounds(
  value: string,
  minDate: string | undefined,
  maxDate: string | undefined,
): boolean {
  if (minDate && value < minDate) return false;
  if (maxDate && value > maxDate) return false;
  return true;
}

type CalendarArrowProps = {
  /** Set by react-multi-date-picker: "left" goes to the previous month. */
  direction?: "left" | "right";
  handleClick?: (event: MouseEvent<HTMLButtonElement>) => void;
  onKeyDown?: (event: KeyboardEvent<HTMLButtonElement>) => void;
  disabled?: boolean;
  previousLabel: string;
  nextLabel: string;
  compact: boolean;
  /** True for the fa calendar, which the library renders right to left. */
  rtl: boolean;
};

/** Named month navigation button. The library's default arrow has no accessible name. */
function CalendarArrow({
  direction,
  handleClick,
  onKeyDown,
  disabled,
  previousLabel,
  nextLabel,
  compact,
  rtl,
}: CalendarArrowProps) {
  const isPrevious = direction === "left";
  // "previous" points back along the reading order: left in en, right in fa.
  const pointsLeft = isPrevious !== rtl;
  const Icon = pointsLeft ? ChevronLeftIcon : ChevronRightIcon;
  return (
    <button
      type="button"
      aria-label={isPrevious ? previousLabel : nextLabel}
      disabled={disabled}
      onClick={handleClick}
      onKeyDown={onKeyDown}
      className={cn(
        "inline-flex shrink-0 items-center justify-center rounded-md text-muted-foreground transition-colors outline-none hover:bg-accent-hover hover:text-accent-foreground focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:pointer-events-none disabled:opacity-50",
        compact ? "size-8" : "size-11",
      )}
    >
      <Icon className="size-4" aria-hidden="true" />
    </button>
  );
}

/**
 * Shared Jalali/Gregorian date picker. The public value is always a Gregorian `YYYY-MM-DD` string.
 * @experimental
 */
export function DatePicker({
  value,
  onValueChange,
  label,
  placeholder,
  locale: localeProp,
  disabled,
  clearable,
  onClear,
  minDate,
  maxDate,
  id,
  "aria-label": ariaLabel,
  "aria-labelledby": ariaLabelledBy,
  className,
  size = "default",
}: DatePickerProps) {
  const controlId = useId();
  const preference = useLocalePreference();
  const [open, setOpen] = useState(false);
  const [announcement, setAnnouncement] = useState("");
  const locale = localeProp ?? (preference.locale === "fa" ? "fa" : "en");
  const compact = size === "sm";
  const calendar = locale === "fa" ? persian : gregorian;
  const dateLocale = locale === "fa" ? persianFa : gregorianEn;
  const valueIso = parseIsoDate(value) ? value : undefined;
  const minValue = parseIsoDate(minDate) ? minDate : undefined;
  const maxValue = parseIsoDate(maxDate) ? maxDate : undefined;
  const calendarRef = useCalendarKeyboard({
    calendar,
    locale: dateLocale,
    minDate: minValue,
    maxDate: maxValue,
  });
  const selectedDate = valueIso
    ? toDateObject(valueIso, calendar, dateLocale)
    : undefined;
  const minDateObject = minValue
    ? toDateObject(minValue, calendar, dateLocale)
    : undefined;
  const maxDateObject = maxValue
    ? toDateObject(maxValue, calendar, dateLocale)
    : undefined;
  const displayText = selectedDate ? selectedDate.format("YYYY/MM/DD") : "";
  const labels =
    locale === "fa"
      ? {
          placeholder: "انتخاب تاریخ",
          date: "تاریخ",
          clear: "پاک کردن تاریخ",
          previous: "ماه قبل",
          next: "ماه بعد",
        }
      : {
          placeholder: "Select date",
          date: "Date",
          clear: "Clear date",
          previous: "Previous month",
          next: "Next month",
        };
  const labelId = `${controlId}-label`;
  const valueId = `${controlId}-value`;
  const inputId = `${controlId}-input`;

  const handleSelect = (next: DateObject | null) => {
    if (!next?.isValid) return;
    const iso = toIsoDate(next);
    if (!isWithinBounds(iso, minValue, maxValue)) return;
    setAnnouncement(describeCalendarDay(iso, { calendar, locale: dateLocale }));
    onValueChange(iso);
    setOpen(false);
  };

  const handleClear = () => {
    onValueChange("");
    onClear?.();
  };

  return (
    <div className={cn("relative inline-flex items-center gap-1.5", className)}>
      {label && (
        <span
          id={labelId}
          className="shrink-0 whitespace-nowrap text-xs font-medium text-muted-foreground"
        >
          {label}
        </span>
      )}
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            type="button"
            variant="outline"
            id={id}
            disabled={disabled}
            aria-label={label ? undefined : ariaLabel}
            aria-labelledby={label ? `${labelId} ${valueId}` : ariaLabelledBy}
            className={cn(
              compact
                ? "h-8 min-w-[6.5rem] gap-1.5 rounded-md px-2.5 text-xs"
                : "h-11 min-w-[8.5rem] gap-2 rounded-lg px-3",
              "flex-1 justify-start text-start font-normal text-foreground",
              !valueIso && "text-muted-foreground",
            )}
          >
            <CalendarIcon
              className={cn(
                "shrink-0 text-muted-foreground",
                compact ? "size-3.5" : "size-4",
              )}
              aria-hidden="true"
            />
            <span id={valueId} className="truncate">
              {displayText || placeholder || labels.placeholder}
            </span>
          </Button>
        </PopoverTrigger>
        <PopoverContent align="start" className="w-auto p-2">
          <div ref={calendarRef} className="flex flex-col gap-2">
            <label
              htmlFor={inputId}
              className="text-sm font-medium text-foreground"
            >
              {labels.date}
            </label>
            <DatePickerPrimitive
              id={inputId}
              value={selectedDate}
              onChange={handleSelect}
              calendar={calendar}
              locale={dateLocale}
              minDate={minDateObject}
              maxDate={maxDateObject}
              format="YYYY/MM/DD"
              calendarPosition="bottom-center"
              containerClassName="w-full"
              className={compact ? undefined : "[&_.rmdp-day]:size-11"}
              inputClass={cn(
                "w-full rounded-[var(--radius-lg)] border border-input bg-background px-3 text-sm",
                compact ? "h-8" : "h-11",
              )}
              renderButton={
                <CalendarArrow
                  previousLabel={labels.previous}
                  nextLabel={labels.next}
                  compact={compact}
                  rtl={locale === "fa"}
                />
              }
            />
          </div>
        </PopoverContent>
      </Popover>
      {/* Outside the popover, which closes on select: the live region must survive that. */}
      <span aria-live="polite" aria-atomic="true" className="sr-only">
        {announcement}
      </span>
      {clearable && valueIso && (
        <Button
          type="button"
          variant="ghost"
          size="icon"
          disabled={disabled}
          onClick={handleClear}
          aria-label={labels.clear}
          className={cn(
            "rounded-full text-muted-foreground",
            compact ? "size-6" : "size-11",
          )}
        >
          <XMarkIcon className="size-4" aria-hidden="true" />
        </Button>
      )}
    </div>
  );
}

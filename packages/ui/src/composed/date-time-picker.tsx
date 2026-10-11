"use client";

import { useId } from "react";
import gregorian from "react-date-object/calendars/gregorian";
import persian from "react-date-object/calendars/persian";
import gregorianEn from "react-date-object/locales/gregorian_en";
import persianFa from "react-date-object/locales/persian_fa";
import DatePicker, { DateObject } from "react-multi-date-picker";
import { Button } from "../button.js";
import { CalendarIcon } from "../icons.js";
import { Input } from "../input.js";
import { cn } from "../lib/utils.js";
import { useLocalePreference } from "../locale-preference.js";
import { Popover, PopoverContent, PopoverTrigger } from "../popover.js";

export type DateTimePickerProps = {
  /** ISO-8601 instant. The picker displays this instant in `timeZone`. */
  value?: string | null;
  /** Emits an ISO-8601 instant with an explicit UTC offset. */
  onValueChange: (value: string | null) => void;
  /** Defaults to the active locale from LocalePreferenceProvider. */
  locale?: "fa" | "en";
  /** IANA timezone used to display and interpret the selected wall time. */
  timeZone?: string;
  disabled?: boolean;
  className?: string;
  placeholder?: string;
};

const dateParts = (date: Date, timeZone: string) => {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).formatToParts(date);
  return Object.fromEntries(parts.map(({ type, value }) => [type, value]));
};

function wallTimeToInstant(
  year: number,
  month: number,
  day: number,
  hour: number,
  minute: number,
  timeZone: string,
): string {
  const target = Date.UTC(year, month - 1, day, hour, minute);
  let instant = target;
  // Reconcile the requested wall time against the target zone's UTC offset.
  for (let attempt = 0; attempt < 3; attempt += 1) {
    const parts = dateParts(new Date(instant), timeZone);
    const projected = Date.UTC(
      Number(parts.year),
      Number(parts.month) - 1,
      Number(parts.day),
      Number(parts.hour),
      Number(parts.minute),
    );
    const adjustment = target - projected;
    instant += adjustment;
    if (adjustment === 0) break;
  }
  return new Date(instant).toISOString();
}

function formatInstant(
  value: string | null | undefined,
  timeZone: string,
  locale: "fa" | "en",
) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return new Intl.DateTimeFormat(
    locale === "fa" ? "fa-IR-u-ca-persian" : "en-GB",
    {
      timeZone,
      dateStyle: "medium",
      timeStyle: "short",
    },
  ).format(date);
}

/** Shared Jalali/Gregorian date and time picker. The public value is always an ISO instant. */
export function DateTimePicker({
  value,
  onValueChange,
  locale: localeProp,
  timeZone = "Asia/Tehran",
  disabled,
  className,
  placeholder,
}: DateTimePickerProps) {
  const controlId = useId();
  const preference = useLocalePreference();
  const locale = localeProp ?? (preference.locale === "fa" ? "fa" : "en");
  const calendar = locale === "fa" ? persian : gregorian;
  const dateLocale = locale === "fa" ? persianFa : gregorianEn;
  const instant = value ? new Date(value) : new Date();
  const parts = Number.isNaN(instant.getTime())
    ? null
    : dateParts(instant, timeZone);
  const gregorianDate = parts
    ? `${parts.year}-${parts.month}-${parts.day}`
    : new Date().toISOString().slice(0, 10);
  const selectedDate = new DateObject({
    date: gregorianDate,
    format: "YYYY-MM-DD",
    calendar: gregorian,
  }).convert(calendar);
  const time = parts ? `${parts.hour}:${parts.minute}` : "";
  const labels =
    locale === "fa"
      ? {
          placeholder: "انتخاب تاریخ و ساعت",
          date: "تاریخ",
          time: "ساعت",
          choose: "انتخاب",
        }
      : {
          placeholder: "Choose date and time",
          date: "Date",
          time: "Time",
          choose: "Choose",
        };

  const emit = (date: DateObject, nextTime: string) => {
    const gregorianValue = date.convert(gregorian);
    const match = nextTime.match(/^(\d{2}):(\d{2})$/);
    if (!match) return;
    onValueChange(
      wallTimeToInstant(
        gregorianValue.year,
        gregorianValue.month.number,
        gregorianValue.day,
        Number(match[1]),
        Number(match[2]),
        timeZone,
      ),
    );
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          disabled={disabled}
          className={cn(
            "w-full justify-start gap-2 text-start font-normal",
            !value && "text-muted-foreground",
            className,
          )}
        >
          <CalendarIcon className="size-4 shrink-0" aria-hidden="true" />
          <span className="truncate">
            {formatInstant(value, timeZone, locale) ||
              placeholder ||
              labels.placeholder}
          </span>
        </Button>
      </PopoverTrigger>
      <PopoverContent
        align="start"
        className="w-[min(22rem,calc(100vw-2rem))] p-3"
      >
        <div className="flex flex-col gap-3">
          <label
            htmlFor={`${controlId}-date`}
            className="flex flex-col gap-1.5 text-sm font-medium"
          >
            {labels.date}
            <DatePicker
              id={`${controlId}-date`}
              value={selectedDate}
              onChange={(next) => {
                if (next) emit(next, time || "12:00");
              }}
              calendar={calendar}
              locale={dateLocale}
              format={locale === "fa" ? "YYYY/MM/DD" : "DD/MM/YYYY"}
              calendarPosition="bottom-center"
              containerClassName="w-full"
              inputClass="h-10 w-full rounded-[var(--radius-lg)] border border-input bg-background px-3 text-sm"
            />
          </label>
          <label
            htmlFor={`${controlId}-time`}
            className="flex flex-col gap-1.5 text-sm font-medium"
          >
            {labels.time}
            <Input
              id={`${controlId}-time`}
              type="time"
              value={time || "12:00"}
              onChange={(event) =>
                emit(selectedDate, event.currentTarget.value)
              }
            />
          </label>
          <span className="sr-only">{labels.choose}</span>
        </div>
      </PopoverContent>
    </Popover>
  );
}

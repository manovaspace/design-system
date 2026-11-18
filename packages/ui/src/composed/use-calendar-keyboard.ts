import {
  type Dispatch,
  type SetStateAction,
  useEffect,
  useRef,
  useState,
} from "react";
import type { Calendar, Locale } from "react-date-object";
import gregorian from "react-date-object/calendars/gregorian";
import { DateObject } from "react-multi-date-picker";

/**
 * Internal keyboard support for the calendar rendered by react-multi-date-picker.
 * The library renders day cells as `div.rmdp-day` with no keyboard model, so this hook
 * enhances the rendered DOM: roving tabindex, grid semantics, arrow/Home/End/Page keys,
 * and Enter/Space selection. It is not exported from any package entry.
 */

const DAY_SELECTOR = ".rmdp-day-picker .rmdp-day";
const ROW_SELECTOR = ".rmdp-day-picker .rmdp-week";
const WEEKDAY_SELECTOR = ".rmdp-day-picker .rmdp-week-day";
const GRID_SELECTOR = ".rmdp-day-picker";
const HEADER_BUTTON_SELECTOR = ".rmdp-header button";
/** Guards the search for a selectable day; well beyond any run of disabled days. */
const MAX_SEARCH_STEPS = 400;
/** Polling for the calendar to close after a pick: tries and delay between them. */
const SETTLE_TRIES = 8;
const SETTLE_DELAY_MS = 25;
/** Re-tries for focusing a day after a month change re-renders the calendar. */
const FOCUS_RETRIES = 10;
/** Attributes the library or this hook write; a change re-runs the enhancement. */
const OBSERVED_ATTRIBUTES = [
  "class",
  "tabindex",
  "role",
  "aria-label",
  "aria-selected",
  "aria-disabled",
  "aria-hidden",
];

type CalendarDate = { year: number; month: number; day: number };
type CalendarMonth = { year: number; month: number };
type CalendarSettings = { calendar: Calendar; locale: Locale };
type Env = CalendarSettings & {
  /** Gregorian `YYYY-MM-DD`, inclusive. */
  minIso?: string;
  /** Gregorian `YYYY-MM-DD`, inclusive. */
  maxIso?: string;
  /** Month names of the calendar in the picker locale, index 0 is month 1. */
  monthNames: string[];
};

type DayEntry = {
  el: HTMLElement;
  /** Gregorian `YYYY-MM-DD` of the cell, null for hidden or unreadable cells. */
  iso: string | null;
  hidden: boolean;
  disabled: boolean;
  enabled: boolean;
  selected: boolean;
  today: boolean;
};

type Scan = {
  month: CalendarMonth | null;
  entries: DayEntry[];
  byIso: Map<string, DayEntry>;
};

/** Maps Persian and Arabic-Indic digits to ASCII so day and year text parse in both locales. */
function toAsciiDigits(text: string): string {
  return text
    .replace(/[۰-۹]/g, (digit) => String(digit.charCodeAt(0) - 0x06f0))
    .replace(/[٠-٩]/g, (digit) => String(digit.charCodeAt(0) - 0x0660));
}

function pad(value: number): string {
  return String(value).padStart(2, "0");
}

function parseGregorianIso(iso: string): CalendarDate {
  const [year = 0, month = 1, day = 1] = iso.split("-").map(Number);
  return { year, month, day };
}

function isoToCalendar(iso: string, settings: CalendarSettings): CalendarDate {
  const { year, month, day } = parseGregorianIso(iso);
  const date = new DateObject({
    year,
    month,
    day,
    calendar: gregorian,
  }).convert(settings.calendar, settings.locale);
  return { year: date.year, month: date.month.number, day: date.day };
}

function calendarToIso(date: CalendarDate, settings: CalendarSettings): string {
  const converted = new DateObject({
    year: date.year,
    month: date.month,
    day: date.day,
    calendar: settings.calendar,
    locale: settings.locale,
  }).convert(gregorian);
  return `${converted.year}-${pad(converted.month.number)}-${pad(converted.day)}`;
}

/** Adds whole days to a Gregorian `YYYY-MM-DD`. Same weekday for multiples of 7. */
function addDays(iso: string, days: number): string {
  const { year, month, day } = parseGregorianIso(iso);
  return new Date(Date.UTC(year, month - 1, day + days))
    .toISOString()
    .slice(0, 10);
}

/** Shifts a calendar month by `delta`, clamping the day to the target month length. */
function shiftMonth(
  date: CalendarDate,
  delta: number,
  settings: CalendarSettings,
): CalendarDate {
  const index = date.year * 12 + (date.month - 1) + delta;
  const year = Math.floor(index / 12);
  const month = (index % 12) + 1;
  const length = new DateObject({
    year,
    month,
    day: 1,
    calendar: settings.calendar,
    locale: settings.locale,
  }).month.length;
  return { year, month, day: Math.min(date.day, length) };
}

/**
 * Formats a Gregorian `YYYY-MM-DD` as the full date in the picker locale,
 * e.g. `15 October 2026` (en) or `۲۴ آبان ۱۴۰۵` (fa).
 */
export function describeCalendarDay(
  iso: string,
  settings: CalendarSettings,
): string {
  const { year, month, day } = isoToCalendar(iso, settings);
  return new DateObject({
    year,
    month,
    day,
    calendar: settings.calendar,
    locale: settings.locale,
  }).format("D MMMM YYYY");
}

function createEnv(
  settings: CalendarSettings,
  minIso: string | undefined,
  maxIso: string | undefined,
): Env {
  const anchor = new DateObject({
    calendar: settings.calendar,
    locale: settings.locale,
  });
  const monthNames = Array.from({ length: 12 }, (_, index) =>
    new DateObject({
      year: anchor.year,
      month: index + 1,
      day: 1,
      calendar: settings.calendar,
      locale: settings.locale,
    }).format("MMMM"),
  );
  return { ...settings, minIso, maxIso, monthNames };
}

/** Reads the visible month and year from the library header (month and year spans). */
function readVisibleMonth(root: HTMLElement, env: Env): CalendarMonth | null {
  const values = root.querySelector(".rmdp-header-values");
  if (!values) return null;
  let month: number | null = null;
  let year: number | null = null;
  for (const span of Array.from(values.querySelectorAll("span[tabindex]"))) {
    const text = (span.textContent ?? "").trim();
    const index = env.monthNames.indexOf(text);
    if (index >= 0) {
      month = index + 1;
      continue;
    }
    const digits = toAsciiDigits(text);
    if (/^\d+$/.test(digits)) year = Number(digits);
  }
  return month !== null && year !== null ? { year, month } : null;
}

function scan(root: HTMLElement, env: Env): Scan {
  const month = readVisibleMonth(root, env);
  const byIso = new Map<string, DayEntry>();
  const entries = Array.from(
    root.querySelectorAll<HTMLElement>(DAY_SELECTOR),
  ).map((el) => {
    const hidden = el.classList.contains("rmdp-day-hidden");
    const disabled = el.classList.contains("rmdp-disabled");
    const dayNumber = Number(toAsciiDigits((el.textContent ?? "").trim()));
    let iso: string | null = null;
    if (!hidden && month && Number.isInteger(dayNumber) && dayNumber > 0) {
      iso = calendarToIso(
        { year: month.year, month: month.month, day: dayNumber },
        env,
      );
    }
    const entry: DayEntry = {
      el,
      iso,
      hidden,
      disabled,
      enabled: !hidden && !disabled && iso !== null,
      selected: el.classList.contains("rmdp-selected"),
      today: el.classList.contains("rmdp-today"),
    };
    if (iso !== null && !byIso.has(iso)) byIso.set(iso, entry);
    return entry;
  });
  return { month, entries, byIso };
}

function isWithinBounds(iso: string, env: Env): boolean {
  return (
    (!env.minIso || iso >= env.minIso) && (!env.maxIso || iso <= env.maxIso)
  );
}

/**
 * Next selectable day from `from` in `step` days (1, -1, 7, -7). Returns null when the
 * search leaves minDate/maxDate. Disabled cells in the visible month are skipped.
 */
function findSelectableDay(
  from: string,
  step: number,
  s: Scan,
  env: Env,
): string | null {
  let iso = from;
  for (let attempt = 0; attempt < MAX_SEARCH_STEPS; attempt += 1) {
    iso = addDays(iso, step);
    if (!isWithinBounds(iso, env)) return null;
    const entry = s.byIso.get(iso);
    if (entry && !entry.enabled) continue;
    return iso;
  }
  return null;
}

function headerButtons(root: HTMLElement): {
  previous?: HTMLButtonElement;
  next?: HTMLButtonElement;
} {
  // The library header is [previous, month/year, next]; the first and last buttons are the arrows.
  const buttons = Array.from(
    root.querySelectorAll<HTMLButtonElement>(HEADER_BUTTON_SELECTOR),
  );
  if (buttons.length < 2) return {};
  return { previous: buttons[0], next: buttons[buttons.length - 1] };
}

function isButtonDisabled(button: HTMLButtonElement): boolean {
  return button.disabled || button.classList.contains("disabled");
}

/**
 * Visual direction of a day cell. Computed style wins; the library's `rmdp-rtl` class
 * on the calendar is the fallback where computed direction is not available (jsdom).
 */
function isRightToLeft(cell: HTMLElement): boolean {
  const direction = window.getComputedStyle(cell).direction;
  if (direction === "rtl" || direction === "ltr") return direction === "rtl";
  return (
    cell.closest(".rmdp-calendar")?.classList.contains("rmdp-rtl") ?? false
  );
}

function setAttribute(el: Element, name: string, value: string | null): void {
  if (value === null) {
    if (el.hasAttribute(name)) el.removeAttribute(name);
    return;
  }
  // Compare first: writing an unchanged value still queues a mutation and would loop the observer.
  if (el.getAttribute(name) !== value) el.setAttribute(name, value);
}

function attachCalendarKeyboard(
  root: HTMLElement,
  env: Env,
  onSelectionClosed: () => void,
): () => void {
  let focusedIso: string | null = null;
  const timers = new Set<number>();

  const later = (task: () => void, delay = 0) => {
    const id = window.setTimeout(() => {
      timers.delete(id);
      task();
    }, delay);
    timers.add(id);
  };

  /** Writes roles, labels, selection and the single roving tab stop. Idempotent. */
  const apply = () => {
    const s = scan(root, env);
    const enabled = s.entries.filter((entry) => entry.enabled);
    const roving =
      enabled.find((entry) => entry.iso === focusedIso) ??
      enabled.find((entry) => entry.selected) ??
      enabled.find((entry) => entry.today) ??
      enabled[0];

    for (const entry of s.entries) {
      const { el, iso } = entry;
      setAttribute(el, "role", "gridcell");
      if (entry.enabled && iso !== null) {
        setAttribute(el, "aria-label", describeCalendarDay(iso, env));
        setAttribute(el, "aria-selected", entry.selected ? "true" : "false");
        setAttribute(el, "aria-disabled", null);
        setAttribute(el, "aria-hidden", null);
        setAttribute(el, "tabindex", entry === roving ? "0" : "-1");
      } else if (entry.hidden) {
        setAttribute(el, "aria-label", null);
        setAttribute(el, "aria-selected", null);
        setAttribute(el, "aria-disabled", null);
        setAttribute(el, "aria-hidden", "true");
        setAttribute(el, "tabindex", null);
      } else {
        // Disabled by minDate/maxDate: announced as dimmed, never focusable.
        if (iso !== null) {
          setAttribute(el, "aria-label", describeCalendarDay(iso, env));
        }
        setAttribute(el, "aria-selected", null);
        setAttribute(el, "aria-disabled", "true");
        setAttribute(el, "aria-hidden", null);
        setAttribute(el, "tabindex", null);
      }
    }

    for (const row of Array.from(root.querySelectorAll(ROW_SELECTOR))) {
      setAttribute(row, "role", "row");
    }
    for (const header of Array.from(root.querySelectorAll(WEEKDAY_SELECTOR))) {
      setAttribute(header, "role", "columnheader");
    }
    const grid = root.querySelector<HTMLElement>(GRID_SELECTOR);
    if (grid) {
      setAttribute(grid, "role", "grid");
      setAttribute(
        grid,
        "aria-label",
        s.month
          ? new DateObject({
              year: s.month.year,
              month: s.month.month,
              day: 1,
              calendar: env.calendar,
              locale: env.locale,
            }).format("MMMM YYYY")
          : null,
      );
    }
  };

  const focusDay = (iso: string, retries: number) => {
    const entry = scan(root, env).byIso.get(iso);
    if (entry?.enabled) {
      focusedIso = iso;
      entry.el.focus();
      apply();
      return;
    }
    if (retries > 0) later(() => focusDay(iso, retries - 1));
  };

  /** True when the day is still rendered and focused afterwards. */
  const keepFocusOnPickedDay = (iso: string): boolean => {
    const entry = scan(root, env).byIso.get(iso);
    if (!entry?.enabled) return false;
    if (document.activeElement !== entry.el) focusDay(iso, 0);
    return true;
  };

  /** Focuses `target`, clicking a header arrow first when it is in another month. */
  const navigateTo = (target: string, s: Scan) => {
    const entry = s.byIso.get(target);
    if (entry?.enabled) {
      focusDay(target, 0);
      return;
    }
    focusedIso = target;
    if (!s.month) return;
    const next = isoToCalendar(target, env);
    const forward =
      next.year > s.month.year ||
      (next.year === s.month.year && next.month > s.month.month);
    const { previous, next: nextButton } = headerButtons(root);
    const button = forward ? nextButton : previous;
    if (!button || isButtonDisabled(button)) return;
    button.click();
    focusDay(target, FOCUS_RETRIES);
  };

  const onKeyDown = (event: KeyboardEvent) => {
    const target = event.target;
    if (!(target instanceof HTMLElement)) return;

    if (target instanceof HTMLInputElement) {
      if (event.key !== "ArrowDown") return;
      const s = scan(root, env);
      const roving = s.entries.find(
        (entry) => entry.el.getAttribute("tabindex") === "0",
      );
      if (roving?.iso) {
        event.preventDefault();
        focusDay(roving.iso, 0);
      }
      return;
    }

    const cell = target.closest<HTMLElement>(DAY_SELECTOR);
    if (!cell || !root.contains(cell)) return;
    // The library's own cell handler calls preventDefault on every key and matches cells
    // by aria-label; stop it here so this hook owns day keys.
    event.stopPropagation();

    const s = scan(root, env);
    const entry = s.entries.find((item) => item.el === cell);
    if (!entry?.enabled || entry.iso === null) return;
    const iso = entry.iso;

    switch (event.key) {
      case "ArrowLeft":
      case "ArrowRight": {
        // Visual direction: ArrowRight is the next day in LTR and the previous day in RTL.
        const sign = event.key === "ArrowRight" ? 1 : -1;
        const step = isRightToLeft(cell) ? -sign : sign;
        event.preventDefault();
        const next = findSelectableDay(iso, step, s, env);
        if (next) navigateTo(next, s);
        return;
      }
      case "ArrowDown":
      case "ArrowUp": {
        event.preventDefault();
        const next = findSelectableDay(
          iso,
          event.key === "ArrowDown" ? 7 : -7,
          s,
          env,
        );
        if (next) navigateTo(next, s);
        return;
      }
      case "Home":
      case "End": {
        event.preventDefault();
        const row = cell.parentElement;
        const rowDays = s.entries.filter(
          (item) => item.enabled && item.el.parentElement === row,
        );
        const edge =
          event.key === "Home" ? rowDays[0] : rowDays[rowDays.length - 1];
        if (edge?.iso) focusDay(edge.iso, 0);
        return;
      }
      case "PageUp":
      case "PageDown": {
        event.preventDefault();
        const shifted = shiftMonth(
          isoToCalendar(iso, env),
          event.key === "PageDown" ? 1 : -1,
          env,
        );
        let target = calendarToIso(shifted, env);
        if (env.minIso && target < env.minIso) target = env.minIso;
        if (env.maxIso && target > env.maxIso) target = env.maxIso;
        navigateTo(target, s);
        return;
      }
      case "Enter":
      case " ": {
        event.preventDefault();
        cell.click();
        // A label click can move focus to the date input, and a single-date pick closes the
        // library calendar, which removes the day cell after React commits. Check now and again
        // after the commit: keep focus on the day while it exists, otherwise hand off.
        keepFocusOnPickedDay(iso);
        // The library may remove the calendar a few frames later, so poll briefly.
        const settle = (tries: number) => {
          if (!keepFocusOnPickedDay(iso)) {
            onSelectionClosed();
            return;
          }
          if (tries > 0) later(() => settle(tries - 1), SETTLE_DELAY_MS);
        };
        later(() => settle(SETTLE_TRIES), SETTLE_DELAY_MS);
        return;
      }
      default:
        return;
    }
  };

  const onFocusIn = (event: FocusEvent) => {
    const target = event.target;
    if (!(target instanceof HTMLElement) || !target.matches(DAY_SELECTOR)) {
      return;
    }
    const entry = scan(root, env).entries.find((item) => item.el === target);
    if (entry?.enabled && entry.iso !== null) {
      focusedIso = entry.iso;
      apply();
    }
  };

  const observer = new MutationObserver(() => apply());
  observer.observe(root, {
    subtree: true,
    childList: true,
    attributes: true,
    attributeFilter: OBSERVED_ATTRIBUTES,
  });
  root.addEventListener("keydown", onKeyDown, true);
  root.addEventListener("focusin", onFocusIn);
  apply();

  return () => {
    observer.disconnect();
    root.removeEventListener("keydown", onKeyDown, true);
    root.removeEventListener("focusin", onFocusIn);
    for (const id of timers) window.clearTimeout(id);
    timers.clear();
  };
}

export type CalendarKeyboardOptions = {
  calendar: Calendar;
  locale: Locale;
  /** Earliest selectable day, Gregorian `YYYY-MM-DD`. */
  minDate?: string;
  /** Latest selectable day, Gregorian `YYYY-MM-DD`. */
  maxDate?: string;
  /**
   * Called after Enter or Space picks a day and the library closed the calendar, so focus has
   * no day to return to. Use it to move focus to the next field.
   */
  onSelectionClosed?: () => void;
};

/**
 * Returns a ref callback for the element that contains the library calendar. The
 * enhancement attaches when that element mounts (popover opened) and detaches on unmount.
 *
 * Why a container ref rather than the library's `onOpen`/`onClose`: the popup is rendered
 * inline inside the picker's own wrapper, so a wrapper element is always the right root,
 * and a MutationObserver on it covers every re-render (month, selection, header clicks).
 */
export function useCalendarKeyboard({
  calendar,
  locale,
  minDate,
  maxDate,
  onSelectionClosed,
}: CalendarKeyboardOptions): Dispatch<SetStateAction<HTMLElement | null>> {
  const [root, setRoot] = useState<HTMLElement | null>(null);
  // Read through a ref so an inline callback does not re-attach the observer on every render.
  const selectionClosedRef = useRef(onSelectionClosed);

  useEffect(() => {
    selectionClosedRef.current = onSelectionClosed;
  });

  useEffect(() => {
    if (!root) return;
    const env = createEnv({ calendar, locale }, minDate, maxDate);
    return attachCalendarKeyboard(root, env, () =>
      selectionClosedRef.current?.(),
    );
  }, [root, calendar, locale, minDate, maxDate]);

  return setRoot;
}

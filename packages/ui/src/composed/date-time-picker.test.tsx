import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import type { ComponentProps } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { LocalePreferenceProvider } from "../locale-preference.js";
import { DateTimePicker } from "./date-time-picker.js";

describe("DateTimePicker", () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it("opens an unset value with the current wall time in its timezone", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-10-11T09:26:00.000Z"));

    render(
      <LocalePreferenceProvider
        storageKey="test-locale"
        locales={["en", "fa"]}
        defaultLocale="en"
      >
        <DateTimePicker value={null} onValueChange={() => undefined} />
      </LocalePreferenceProvider>,
    );

    fireEvent.click(
      screen.getByRole("button", { name: "Choose date and time" }),
    );

    expect(screen.getByLabelText("Time").getAttribute("value")).toBe("12:56");
  });

  it("disables days outside minDate and maxDate and emits only in-range days", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-10-11T09:26:00.000Z"));
    const onValueChange = vi.fn();

    render(
      <LocalePreferenceProvider
        storageKey="test-locale-bounds"
        locales={["en", "fa"]}
        defaultLocale="en"
      >
        <DateTimePicker
          value={null}
          onValueChange={onValueChange}
          minDate="2026-10-10"
          maxDate="2026-10-12"
        />
      </LocalePreferenceProvider>,
    );

    fireEvent.click(
      screen.getByRole("button", { name: "Choose date and time" }),
    );

    fireEvent.click(screen.getByText("9"));
    fireEvent.click(screen.getByText("13"));
    expect(onValueChange).not.toHaveBeenCalled();

    fireEvent.click(screen.getByText("12"));
    expect(onValueChange).toHaveBeenCalledWith("2026-10-12T09:26:00.000Z");
  });

  it("keeps the existing unbounded behaviour when min and max are absent", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-10-11T09:26:00.000Z"));
    const onValueChange = vi.fn();

    render(
      <LocalePreferenceProvider
        storageKey="test-locale-unbounded"
        locales={["en", "fa"]}
        defaultLocale="en"
      >
        <DateTimePicker value={null} onValueChange={onValueChange} />
      </LocalePreferenceProvider>,
    );

    fireEvent.click(
      screen.getByRole("button", { name: "Choose date and time" }),
    );

    fireEvent.click(screen.getByText("9"));
    expect(onValueChange).toHaveBeenCalledWith("2026-10-09T09:26:00.000Z");
  });
});

const VALUE = "2026-10-11T09:26:00.000Z";

/** Opens the popover from the trigger. The calendar enhancement runs from a MutationObserver, so wait for it. */
async function openTimePicker(
  props: Partial<ComponentProps<typeof DateTimePicker>> & {
    locale: "fa" | "en";
  },
) {
  const { locale, ...rest } = props;
  const utils = render(
    <LocalePreferenceProvider
      storageKey={`test-dtp-keyboard-${locale}`}
      locales={["en", "fa"]}
      defaultLocale="en"
    >
      <DateTimePicker
        value={VALUE}
        locale={locale}
        onValueChange={() => undefined}
        {...rest}
      />
    </LocalePreferenceProvider>,
  );
  fireEvent.click(screen.getAllByRole("button")[0] as HTMLElement);
  await waitFor(() =>
    expect(
      document.querySelector('.rmdp-day-picker [role="gridcell"]'),
    ).not.toBeNull(),
  );
  return utils;
}

function activeLabel(): string | null {
  return document.activeElement?.getAttribute("aria-label") ?? null;
}

function pressKey(key: string, code?: string) {
  const target = document.activeElement;
  if (!target) throw new Error("no focused element");
  fireEvent.keyDown(target, { key, code });
}

function rovingCells(): HTMLElement[] {
  return Array.from(
    document.querySelectorAll<HTMLElement>(
      '.rmdp-day-picker .rmdp-day[tabindex="0"]',
    ),
  );
}

describe("DateTimePicker keyboard day selection", () => {
  it("keeps exactly one roving day, marked selected, in en", async () => {
    await openTimePicker({ locale: "en" });

    const roving = rovingCells();
    expect(roving).toHaveLength(1);
    expect(roving[0]?.getAttribute("aria-label")).toBe("11 October 2026");
    expect(
      screen
        .getByRole("gridcell", { name: "11 October 2026" })
        .getAttribute("aria-selected"),
    ).toBe("true");
  });

  it("moves focus with the arrow keys, Home and End in en", async () => {
    await openTimePicker({ locale: "en" });
    screen.getByRole("gridcell", { name: "11 October 2026" }).focus();

    pressKey("ArrowRight");
    expect(activeLabel()).toBe("12 October 2026");
    pressKey("ArrowLeft");
    expect(activeLabel()).toBe("11 October 2026");
    pressKey("ArrowDown");
    expect(activeLabel()).toBe("18 October 2026");
    pressKey("ArrowUp");
    expect(activeLabel()).toBe("11 October 2026");
    pressKey("End");
    expect(activeLabel()).toBe("17 October 2026");
    pressKey("Home");
    expect(activeLabel()).toBe("11 October 2026");
  });

  it("moves focus to the roving day from the date input with ArrowDown", async () => {
    await openTimePicker({ locale: "en" });
    const input =
      document.querySelector<HTMLInputElement>('input[type="text"]');
    if (!input) throw new Error("date input not rendered");

    fireEvent.keyDown(input, { key: "ArrowDown" });

    expect(activeLabel()).toBe("11 October 2026");
  });

  it("selects with Enter, keeps the time, moves focus to the time field and announces it", async () => {
    const onValueChange = vi.fn();
    const { container } = await openTimePicker({
      locale: "en",
      onValueChange,
    });
    screen.getByRole("gridcell", { name: "11 October 2026" }).focus();

    pressKey("ArrowRight");
    pressKey("Enter");

    expect(onValueChange).toHaveBeenCalledWith("2026-10-12T09:26:00.000Z");
    // The library closes its calendar after a single-date pick, so the day cell is gone.
    await waitFor(() =>
      expect(document.activeElement).toBe(
        document.querySelector('input[type="time"]'),
      ),
    );
    expect(container.querySelector('[aria-live="polite"]')?.textContent).toBe(
      "12 October 2026",
    );
  });

  it("selects the focused day with Space", async () => {
    const onValueChange = vi.fn();
    await openTimePicker({ locale: "en", onValueChange });
    screen.getByRole("gridcell", { name: "11 October 2026" }).focus();

    pressKey("ArrowRight");
    pressKey("ArrowRight");
    pressKey(" ", "Space");

    expect(onValueChange).toHaveBeenCalledWith("2026-10-13T09:26:00.000Z");
  });

  it("never focuses or selects days outside minDate and maxDate", async () => {
    const onValueChange = vi.fn();
    await openTimePicker({
      locale: "en",
      minDate: "2026-10-10",
      maxDate: "2026-10-12",
      onValueChange,
    });
    screen.getByRole("gridcell", { name: "11 October 2026" }).focus();

    pressKey("ArrowRight");
    expect(activeLabel()).toBe("12 October 2026");
    pressKey("ArrowRight");
    expect(activeLabel()).toBe("12 October 2026");

    const disabled = screen.getByRole("gridcell", {
      name: "13 October 2026",
    });
    expect(disabled.hasAttribute("tabindex")).toBe(false);
    fireEvent.keyDown(disabled, { key: "Enter" });
    expect(onValueChange).not.toHaveBeenCalled();

    pressKey("Enter");
    expect(onValueChange).toHaveBeenCalledWith("2026-10-12T09:26:00.000Z");
  });

  it("pages by month and focuses the same day in the new month", async () => {
    await openTimePicker({ locale: "en" });
    screen.getByRole("gridcell", { name: "11 October 2026" }).focus();

    pressKey("PageDown");

    await waitFor(() => expect(activeLabel()).toBe("11 November 2026"));
    expect(rovingCells()).toHaveLength(1);
  });

  it("renders the Jalali calendar in fa with the visual arrow rule", async () => {
    const onValueChange = vi.fn();
    await openTimePicker({ locale: "fa", onValueChange });
    expect(
      document.querySelector(".rmdp-calendar")?.classList.contains("rmdp-rtl"),
    ).toBe(true);
    screen.getByRole("gridcell", { name: "۱۹ مهر ۱۴۰۵" }).focus();

    // RTL: ArrowLeft visually moves toward the next day.
    pressKey("ArrowLeft");
    expect(activeLabel()).toBe("۲۰ مهر ۱۴۰۵");
    pressKey("Enter");

    expect(onValueChange).toHaveBeenCalledWith("2026-10-12T09:26:00.000Z");
  });
});

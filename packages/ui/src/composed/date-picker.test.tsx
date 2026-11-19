import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import type { ComponentProps } from "react";
import { describe, expect, it, vi } from "vitest";

import { LocalePreferenceProvider } from "../locale-preference.js";
import { DatePicker } from "./date-picker.js";

function renderPicker(
  props: Partial<ComponentProps<typeof DatePicker>> & {
    locale?: "fa" | "en";
  } = {},
) {
  return render(
    <LocalePreferenceProvider
      storageKey={`test-date-picker-${props.locale ?? "en"}`}
      locales={["en", "fa"]}
      defaultLocale="en"
    >
      <DatePicker onValueChange={() => undefined} {...props} />
    </LocalePreferenceProvider>,
  );
}

describe("DatePicker", () => {
  it("renders the Gregorian value in en", () => {
    renderPicker({ value: "2026-11-15", locale: "en" });

    expect(screen.getByRole("button", { name: "2026/11/15" })).toBeTruthy();
  });

  it("renders Jalali digits and month names in fa and emits Gregorian", () => {
    const onValueChange = vi.fn();
    renderPicker({
      value: "2026-11-15",
      locale: "fa",
      onValueChange,
    });

    const trigger = screen.getByRole("button", { name: "۱۴۰۵/۰۸/۲۴" });
    fireEvent.click(trigger);

    expect(screen.getAllByText("آبان").length).toBeGreaterThan(0);

    fireEvent.click(screen.getByText("۱۰"));
    expect(onValueChange).toHaveBeenCalledWith("2026-11-01");
  });

  it("disables days before minDate and after maxDate", () => {
    const onValueChange = vi.fn();
    renderPicker({
      value: "2026-11-15",
      locale: "en",
      minDate: "2026-11-10",
      maxDate: "2026-11-20",
      onValueChange,
    });

    fireEvent.click(screen.getByRole("button", { name: "2026/11/15" }));

    fireEvent.click(screen.getByText("9"));
    fireEvent.click(screen.getByText("21"));
    expect(onValueChange).not.toHaveBeenCalled();

    fireEvent.click(screen.getByText("12"));
    expect(onValueChange).toHaveBeenCalledWith("2026-11-12");
  });

  it("navigates months with the named previous and next buttons in en", () => {
    renderPicker({ value: "2026-11-15", locale: "en" });

    fireEvent.click(screen.getByRole("button", { name: "2026/11/15" }));
    const header = () =>
      document.querySelector(".rmdp-header-values")?.textContent ?? "";
    expect(header()).toContain("November");

    fireEvent.click(screen.getByRole("button", { name: "Next month" }));
    expect(header()).toContain("December");

    fireEvent.click(screen.getByRole("button", { name: "Previous month" }));
    fireEvent.click(screen.getByRole("button", { name: "Previous month" }));
    expect(header()).toContain("October");
  });

  it("navigates months with the named buttons in fa", () => {
    renderPicker({ value: "2026-11-15", locale: "fa" });

    fireEvent.click(screen.getByRole("button", { name: "۱۴۰۵/۰۸/۲۴" }));
    const header = () =>
      document.querySelector(".rmdp-header-values")?.textContent ?? "";
    expect(header()).toContain("آبان");

    fireEvent.click(screen.getByRole("button", { name: "ماه بعد" }));
    expect(header()).toContain("آذر");

    fireEvent.click(screen.getByRole("button", { name: "ماه قبل" }));
    fireEvent.click(screen.getByRole("button", { name: "ماه قبل" }));
    expect(header()).toContain("مهر");
  });

  it("clears to an empty string and calls onClear", () => {
    const onValueChange = vi.fn();
    const onClear = vi.fn();
    renderPicker({
      value: "2026-11-15",
      locale: "en",
      clearable: true,
      onValueChange,
      onClear,
    });

    fireEvent.click(screen.getByRole("button", { name: "Clear date" }));

    expect(onValueChange).toHaveBeenCalledWith("");
    expect(onClear).toHaveBeenCalledTimes(1);
  });

  it("renders empty without throwing for an invalid value", () => {
    expect(() =>
      renderPicker({ value: "2026-02-31", locale: "en" }),
    ).not.toThrow();

    expect(screen.getByRole("button", { name: "Select date" })).toBeTruthy();
  });
});

describe("DatePicker external labelling", () => {
  it("is named by an external label through id and htmlFor", () => {
    render(
      <LocalePreferenceProvider
        storageKey="test-date-picker-external-label"
        locales={["en", "fa"]}
        defaultLocale="en"
      >
        <label htmlFor="paid-on">Paid on</label>
        <DatePicker
          id="paid-on"
          value="2026-11-15"
          onValueChange={() => undefined}
        />
      </LocalePreferenceProvider>,
    );

    expect(screen.getByRole("button", { name: /Paid on/ })).toBeTruthy();
  });

  it("uses aria-label on the trigger when no internal label is set", () => {
    renderPicker({
      value: "2026-11-15",
      locale: "en",
      "aria-label": "Due",
    });

    expect(screen.getByRole("button", { name: "Due" })).toBeTruthy();
  });

  it("lets the internal label win over a passed aria-labelledby", () => {
    renderPicker({
      value: "2026-11-15",
      locale: "en",
      label: "Date",
      "aria-labelledby": "external-name",
    });

    expect(
      screen.getByRole("button", { name: "Date 2026/11/15" }),
    ).toBeTruthy();
  });
});

/** Opens the popover. The calendar enhancement runs from a MutationObserver (a microtask), so wait for it. */
async function openPicker(
  locale: "fa" | "en",
  props: Partial<ComponentProps<typeof DatePicker>> = {},
) {
  const utils = renderPicker({ value: "2026-11-15", locale, ...props });
  fireEvent.click(
    screen.getByRole("button", {
      name: locale === "fa" ? "۱۴۰۵/۰۸/۲۴" : "2026/11/15",
    }),
  );
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

describe("DatePicker keyboard day selection", () => {
  it("keeps exactly one roving day, marked selected, in en", async () => {
    await openPicker("en");

    const roving = rovingCells();
    expect(roving).toHaveLength(1);
    expect(roving[0]?.getAttribute("aria-label")).toBe("15 November 2026");
    expect(
      screen
        .getByRole("gridcell", { name: "15 November 2026" })
        .getAttribute("aria-selected"),
    ).toBe("true");
    expect(
      screen
        .getByRole("gridcell", { name: "16 November 2026" })
        .getAttribute("aria-selected"),
    ).toBe("false");
  });

  it("moves focus with the arrow keys, Home and End in en", async () => {
    await openPicker("en");
    screen.getByRole("gridcell", { name: "15 November 2026" }).focus();

    pressKey("ArrowRight");
    expect(activeLabel()).toBe("16 November 2026");
    pressKey("ArrowLeft");
    expect(activeLabel()).toBe("15 November 2026");
    pressKey("ArrowDown");
    expect(activeLabel()).toBe("22 November 2026");
    pressKey("ArrowUp");
    expect(activeLabel()).toBe("15 November 2026");
    pressKey("End");
    expect(activeLabel()).toBe("21 November 2026");
    pressKey("Home");
    expect(activeLabel()).toBe("15 November 2026");
  });

  it("moves focus to the roving day from the date input with ArrowDown", async () => {
    await openPicker("en");
    const input =
      document.querySelector<HTMLInputElement>('input[type="text"]');
    if (!input) throw new Error("date input not rendered");

    fireEvent.keyDown(input, { key: "ArrowDown" });

    expect(activeLabel()).toBe("15 November 2026");
  });

  it("pages by month and focuses the same day in the new month", async () => {
    await openPicker("en");
    screen.getByRole("gridcell", { name: "15 November 2026" }).focus();

    pressKey("PageDown");
    await waitFor(() => expect(activeLabel()).toBe("15 December 2026"));
    expect(rovingCells()).toHaveLength(1);

    pressKey("PageUp");
    await waitFor(() => expect(activeLabel()).toBe("15 November 2026"));
  });

  it("selects the focused day with Enter and announces it", async () => {
    const onValueChange = vi.fn();
    const { container } = await openPicker("en", { onValueChange });
    screen.getByRole("gridcell", { name: "15 November 2026" }).focus();

    pressKey("ArrowRight");
    pressKey("Enter");

    expect(onValueChange).toHaveBeenCalledWith("2026-11-16");
    const live = container.querySelector('[aria-live="polite"]');
    expect(live?.textContent).toBe("16 November 2026");
  });

  it("selects the focused day with Space", async () => {
    const onValueChange = vi.fn();
    await openPicker("en", { onValueChange });
    screen.getByRole("gridcell", { name: "15 November 2026" }).focus();

    pressKey("ArrowRight");
    pressKey("ArrowRight");
    pressKey(" ", "Space");

    expect(onValueChange).toHaveBeenCalledWith("2026-11-17");
  });

  it("never focuses or selects days outside minDate and maxDate", async () => {
    const onValueChange = vi.fn();
    await openPicker("en", {
      minDate: "2026-11-10",
      maxDate: "2026-11-20",
      onValueChange,
    });
    screen.getByRole("gridcell", { name: "15 November 2026" }).focus();

    for (let index = 0; index < 5; index += 1) pressKey("ArrowRight");
    expect(activeLabel()).toBe("20 November 2026");
    pressKey("ArrowRight");
    expect(activeLabel()).toBe("20 November 2026");

    const disabled = screen.getByRole("gridcell", {
      name: "21 November 2026",
    });
    expect(disabled.hasAttribute("tabindex")).toBe(false);
    expect(disabled.getAttribute("aria-disabled")).toBe("true");
    fireEvent.keyDown(disabled, { key: "Enter" });
    expect(onValueChange).not.toHaveBeenCalled();

    pressKey("Enter");
    expect(onValueChange).toHaveBeenCalledWith("2026-11-20");
  });

  it("stops Home and End at the disabled edge of the row", async () => {
    await openPicker("en", { minDate: "2026-11-10", maxDate: "2026-11-20" });
    screen.getByRole("gridcell", { name: "15 November 2026" }).focus();

    pressKey("End");

    expect(activeLabel()).toBe("20 November 2026");
  });

  it("renders the Jalali calendar in fa with the visual arrow rule", async () => {
    const onValueChange = vi.fn();
    await openPicker("fa", { onValueChange });
    expect(
      document.querySelector(".rmdp-calendar")?.classList.contains("rmdp-rtl"),
    ).toBe(true);
    screen.getByRole("gridcell", { name: "۲۴ آبان ۱۴۰۵" }).focus();

    // RTL: ArrowLeft visually moves toward the next day.
    pressKey("ArrowLeft");
    expect(activeLabel()).toBe("۲۵ آبان ۱۴۰۵");
    pressKey("ArrowRight");
    expect(activeLabel()).toBe("۲۴ آبان ۱۴۰۵");
    pressKey("ArrowRight");
    expect(activeLabel()).toBe("۲۳ آبان ۱۴۰۵");

    pressKey("ArrowLeft");
    pressKey("ArrowLeft");
    expect(activeLabel()).toBe("۲۵ آبان ۱۴۰۵");
    pressKey("Enter");
    expect(onValueChange).toHaveBeenCalledWith("2026-11-16");
  });

  it("pages by Jalali month in fa", async () => {
    await openPicker("fa");
    screen.getByRole("gridcell", { name: "۲۴ آبان ۱۴۰۵" }).focus();

    pressKey("PageDown");

    await waitFor(() => expect(activeLabel()).toBe("۲۴ آذر ۱۴۰۵"));
  });

  it("uses LTR arrow semantics in en", async () => {
    await openPicker("en");
    expect(
      document.querySelector(".rmdp-calendar")?.classList.contains("rmdp-rtl"),
    ).toBe(false);
    screen.getByRole("gridcell", { name: "15 November 2026" }).focus();

    pressKey("ArrowLeft");
    expect(activeLabel()).toBe("14 November 2026");
    pressKey("ArrowRight");
    pressKey("ArrowRight");
    expect(activeLabel()).toBe("16 November 2026");
  });

  it("closes on Escape and leaves no focused day behind", async () => {
    await openPicker("en");
    screen.getByRole("gridcell", { name: "15 November 2026" }).focus();

    pressKey("Escape");

    await waitFor(() =>
      expect(
        screen.queryByRole("gridcell", { name: "15 November 2026" }),
      ).toBeNull(),
    );
  });
});

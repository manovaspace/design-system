import { fireEvent, render, screen } from "@testing-library/react";
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

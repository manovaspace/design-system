import { fireEvent, render, screen } from "@testing-library/react";
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

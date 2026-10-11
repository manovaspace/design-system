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
});

import { fireEvent, render, screen, within } from "@testing-library/react";
import DateObject from "react-date-object";
import gregorian from "react-date-object/calendars/gregorian";
import persian from "react-date-object/calendars/persian";
import { describe, expect, it, vi } from "vitest";

import { WheelDatePicker } from "./wheel-date-picker.js";

const openPicker = (trigger: string) => {
  fireEvent.click(screen.getByRole("button", { name: trigger }));
};

const dayOptions = () =>
  within(screen.getByRole("listbox", { name: "روز" })).getAllByRole("option");

describe("WheelDatePicker", () => {
  it("renders the placeholder when there is no value", () => {
    render(<WheelDatePicker onValueChange={() => undefined} />);

    expect(screen.getByRole("button", { name: "انتخاب تاریخ" })).toBeTruthy();
  });

  it("shows the Jalali date with Persian digits for a Gregorian value", () => {
    // 2026-09-20 is 29 Shahrivar 1405 (month 6).
    render(
      <WheelDatePicker value="2026-09-20" onValueChange={() => undefined} />,
    );

    const trigger = screen.getByRole("button", { name: "۱۴۰۵/۰۶/۲۹" });
    expect(trigger.getAttribute("aria-haspopup")).toBe("dialog");
  });

  it("emits the unchanged Gregorian value on confirm", () => {
    const onValueChange = vi.fn();
    render(
      <WheelDatePicker value="2026-09-20" onValueChange={onValueChange} />,
    );

    openPicker("۱۴۰۵/۰۶/۲۹");
    fireEvent.click(screen.getByRole("button", { name: "تأیید" }));

    expect(onValueChange).toHaveBeenCalledWith("2026-09-20");
  });

  it("does not emit on cancel", () => {
    const onValueChange = vi.fn();
    render(
      <WheelDatePicker value="2026-09-20" onValueChange={onValueChange} />,
    );

    openPicker("۱۴۰۵/۰۶/۲۹");
    fireEvent.click(screen.getByRole("button", { name: "انصراف" }));

    expect(onValueChange).not.toHaveBeenCalled();
  });

  it("clamps the day to the new month length when the month changes", () => {
    const onValueChange = vi.fn();
    // 2026-04-20 is 31 Farvardin 1405.
    render(
      <WheelDatePicker value="2026-04-20" onValueChange={onValueChange} />,
    );

    openPicker("۱۴۰۵/۰۱/۳۱");
    fireEvent.click(
      within(screen.getByRole("listbox", { name: "ماه" })).getByRole("option", {
        name: "مهر",
      }),
    );

    // Mehr has 30 days, so the selected day is clamped to ۳۰.
    expect(dayOptions()).toHaveLength(30);
    expect(
      dayOptions().find(
        (option) => option.getAttribute("aria-selected") === "true",
      )?.textContent,
    ).toBe("۳۰");

    fireEvent.click(screen.getByRole("button", { name: "تأیید" }));
    // 30 Mehr 1405 is 2026-10-22.
    expect(onValueChange).toHaveBeenCalledWith("2026-10-22");
  });

  it("offers the month length reported by the Persian calendar for Esfand", () => {
    const esfandLength = (year: number) =>
      new DateObject({ year, month: 12, day: 1, calendar: persian }).month
        .length;

    for (const year of [1403, 1404]) {
      const expected = esfandLength(year);
      const isLeap = new DateObject({
        year,
        month: 12,
        day: 1,
        calendar: persian,
      }).isLeap;
      expect(expected).toBe(isLeap ? 30 : 29);

      const first = new DateObject({
        year,
        month: 12,
        day: 1,
        calendar: persian,
      }).convert(gregorian);
      const iso = `${first.year}-${String(first.month.number).padStart(2, "0")}-${String(first.day).padStart(2, "0")}`;
      const { unmount } = render(
        <WheelDatePicker value={iso} onValueChange={() => undefined} />,
      );

      openPicker(year === 1403 ? "۱۴۰۳/۱۲/۰۱" : "۱۴۰۴/۱۲/۰۱");
      expect(dayOptions()).toHaveLength(expected);
      unmount();
    }
  });

  it("marks days before min as aria-disabled without removing them", () => {
    render(
      <WheelDatePicker
        value="2026-09-20"
        min="2026-09-10"
        onValueChange={() => undefined}
      />,
    );

    openPicker("۱۴۰۵/۰۶/۲۹");
    const day1 = within(screen.getByRole("listbox", { name: "روز" })).getByRole(
      "option",
      { name: "۱" },
    );
    const day20 = within(
      screen.getByRole("listbox", { name: "روز" }),
    ).getByRole("option", { name: "۲۰" });

    expect(day1.getAttribute("aria-disabled")).toBe("true");
    expect(day20.getAttribute("aria-disabled")).toBe("false");
    expect(dayOptions()).toHaveLength(31);
  });

  it("moves the day selection with ArrowDown", () => {
    const onValueChange = vi.fn();
    render(
      <WheelDatePicker value="2026-09-20" onValueChange={onValueChange} />,
    );

    openPicker("۱۴۰۵/۰۶/۲۹");
    fireEvent.keyDown(screen.getByRole("listbox", { name: "روز" }), {
      key: "ArrowDown",
    });
    fireEvent.click(screen.getByRole("button", { name: "تأیید" }));

    // 30 Shahrivar 1405 is 2026-09-21.
    expect(onValueChange).toHaveBeenCalledWith("2026-09-21");
  });
});

describe("WheelDatePicker external labelling", () => {
  it("is named by an external label through id and htmlFor", () => {
    render(
      <>
        <label htmlFor="due-on">Paid on</label>
        <WheelDatePicker
          id="due-on"
          value="2026-09-20"
          onValueChange={() => undefined}
        />
      </>,
    );

    expect(screen.getByRole("button", { name: /Paid on/ })).toBeTruthy();
  });

  it("uses aria-label on the trigger", () => {
    render(
      <WheelDatePicker
        value="2026-09-20"
        aria-label="Due"
        onValueChange={() => undefined}
      />,
    );

    expect(screen.getByRole("button", { name: "Due" })).toBeTruthy();
  });
});

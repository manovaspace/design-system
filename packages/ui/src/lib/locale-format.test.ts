import { describe, expect, it } from "vitest";

import {
  formatLocaleInteger,
  formatLocaleRelativeTime,
  formatPersianDate,
  formatToman,
} from "./locale-format.js";

describe("formatLocaleInteger", () => {
  it("formats integers using Persian digits for 'fa' locale by default", () => {
    expect(formatLocaleInteger(42)).toBe("۴۲");
    expect(formatLocaleInteger(1234567)).toBe("۱٬۲۳۴٬۵۶۷");
    expect(formatLocaleInteger(0)).toBe("۰");
  });

  it("formats integers using standard ASCII digits for 'en' locale", () => {
    expect(formatLocaleInteger(42, "en")).toBe("42");
    expect(formatLocaleInteger(1234567, "en")).toBe("1,234,567");
    expect(formatLocaleInteger(0, "en")).toBe("0");
  });

  it("rounds floating point numbers to maximumFractionDigits: 0", () => {
    expect(formatLocaleInteger(12.7, "fa")).toBe("۱۳");
    expect(formatLocaleInteger(12.3, "en")).toBe("12");
  });

  it("returns empty string for non-finite or invalid numbers", () => {
    expect(formatLocaleInteger(NaN)).toBe("");
    expect(formatLocaleInteger(Infinity)).toBe("");
  });
});

describe("formatToman", () => {
  it("formats amounts with grouping and Persian digits by default", () => {
    expect(formatToman(50000)).toBe("۵۰٬۰۰۰");
    expect(formatToman(10000000)).toBe("۱۰٬۰۰۰٬۰۰۰");
    expect(formatToman(0)).toBe("۰");
  });

  it("appends ' تومان' when showUnit is true for 'fa'", () => {
    expect(formatToman(50000, { showUnit: true })).toBe("۵۰٬۰۰۰ تومان");
    expect(formatToman(0, { showUnit: true })).toBe("۰ تومان");
  });

  it("formats with Latin numerals when locale is 'en'", () => {
    expect(formatToman(50000, { locale: "en" })).toBe("50,000");
  });

  it("appends ' Toman' when showUnit is true for non-fa locales", () => {
    expect(formatToman(50000, { locale: "en", showUnit: true })).toBe(
      "50,000 Toman",
    );
    expect(formatToman(0, { locale: "en", showUnit: true })).toBe("0 Toman");
  });

  it("returns empty string for invalid input", () => {
    expect(formatToman(NaN)).toBe("");
  });
});

describe("formatLocaleRelativeTime", () => {
  const now = new Date("2026-09-24T12:00:00.000Z");

  it("formats current time (0 sec) as 'اکنون' in Persian and 'now' in English", () => {
    expect(formatLocaleRelativeTime(now, "fa", now)).toBe("اکنون");
    expect(formatLocaleRelativeTime(now, "en", now)).toBe("now");
  });

  it("formats past seconds", () => {
    const fifteenSecAgo = new Date(now.getTime() - 15 * 1000);
    expect(formatLocaleRelativeTime(fifteenSecAgo, "fa", now)).toBe(
      "۱۵ ثانیه پیش",
    );
    expect(formatLocaleRelativeTime(fifteenSecAgo, "en", now)).toBe(
      "15 seconds ago",
    );
  });

  it("formats past minutes", () => {
    const fiveMinAgo = new Date(now.getTime() - 5 * 60 * 1000);
    expect(formatLocaleRelativeTime(fiveMinAgo, "fa", now)).toBe("۵ دقیقه پیش");
    expect(formatLocaleRelativeTime(fiveMinAgo, "en", now)).toBe(
      "5 minutes ago",
    );
  });

  it("formats past hours", () => {
    const twoHoursAgo = new Date(now.getTime() - 2 * 3600 * 1000);
    expect(formatLocaleRelativeTime(twoHoursAgo, "fa", now)).toBe("۲ ساعت پیش");
    expect(formatLocaleRelativeTime(twoHoursAgo, "en", now)).toBe(
      "2 hours ago",
    );
  });

  it("formats 1 day ago as 'دیروز' and 'yesterday'", () => {
    const yesterday = new Date(now.getTime() - 24 * 3600 * 1000);
    expect(formatLocaleRelativeTime(yesterday, "fa", now)).toBe("دیروز");
    expect(formatLocaleRelativeTime(yesterday, "en", now)).toBe("yesterday");
  });

  it("formats multiple days ago", () => {
    const threeDaysAgo = new Date(now.getTime() - 3 * 24 * 3600 * 1000);
    expect(formatLocaleRelativeTime(threeDaysAgo, "fa", now)).toBe("۳ روز پیش");
    expect(formatLocaleRelativeTime(threeDaysAgo, "en", now)).toBe(
      "3 days ago",
    );
  });

  it("accepts ISO string input", () => {
    expect(
      formatLocaleRelativeTime("2026-09-24T11:55:00.000Z", "fa", now),
    ).toBe("۵ دقیقه پیش");
  });

  it("returns empty string for invalid date input", () => {
    expect(formatLocaleRelativeTime("invalid-date", "fa", now)).toBe("");
  });
});

describe("formatPersianDate", () => {
  const nowruzDate = new Date("2024-03-20T12:00:00.000Z");

  it("formats dates using the Solar Hijri (Shamsi) calendar", () => {
    expect(
      formatPersianDate(nowruzDate, { format: "medium", timeZone: "UTC" }),
    ).toBe("۱ فروردین ۱۴۰۳");
    expect(
      formatPersianDate(nowruzDate, { format: "short", timeZone: "UTC" }),
    ).toBe("۱۴۰۳/۱/۱");
  });

  it("defaults to medium format", () => {
    expect(formatPersianDate(nowruzDate, { timeZone: "UTC" })).toBe(
      "۱ فروردین ۱۴۰۳",
    );
  });

  it("accepts ISO strings", () => {
    expect(
      formatPersianDate("2024-03-20T12:00:00.000Z", { timeZone: "UTC" }),
    ).toBe("۱ فروردین ۱۴۰۳");
  });

  it("returns empty string for invalid dates", () => {
    expect(formatPersianDate("invalid-date")).toBe("");
  });
});

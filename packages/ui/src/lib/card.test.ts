import { describe, expect, it } from "vitest";

import {
  formatCardCopy,
  formatCardDisplay,
  isValidIranBankCard,
  normalizeCardDigits,
} from "./card.js";

describe("card", () => {
  it("normalizes Persian and Arabic-Indic digits and strips separators for copy", () => {
    expect(normalizeCardDigits("۶۰۳۷-۹۹۱۲ ۳۴۵۶ ۷۸۹۰")).toBe("6037991234567890");
    expect(normalizeCardDigits("٦٠٣٧-٩٩١٢/٣٤٥٦-٧٨٩٠")).toBe("6037991234567890");
    expect(formatCardCopy("۶۰۳۷-۹۹۱۲ ۳۴۵۶ ۷۸۹۰")).toBe("6037991234567890");
    expect(formatCardCopy(" 6037 9912 3456 7890 ")).toBe("6037991234567890");
  });

  it("handles empty or non-digit input gracefully", () => {
    expect(normalizeCardDigits("")).toBe("");
    expect(normalizeCardDigits("invalid-card-number")).toBe("");
    expect(formatCardCopy("")).toBe("");
  });

  it("validates 16-digit Iranian bank card numbers", () => {
    expect(isValidIranBankCard("6037991234567890")).toBe(true);
    expect(isValidIranBankCard("۶۰۳۷۹۹۱۲۳۴۵۶۷۸۹۰")).toBe(true);
    expect(isValidIranBankCard("۶۰۳۷-۹۹۱۲-۳۴۵۶-۷۸۹۰")).toBe(true);
    expect(isValidIranBankCard("603799123456789")).toBe(false); // 15 digits
    expect(isValidIranBankCard("60379912345678901")).toBe(false); // 17 digits
    expect(isValidIranBankCard("")).toBe(false);
    expect(isValidIranBankCard("abcdefghijklmnop")).toBe(false);
  });

  it("formats valid card numbers as grouped Persian digits", () => {
    expect(formatCardDisplay("6037991234567890")).toBe("۶۰۳۷ ۹۹۱۲ ۳۴۵۶ ۷۸۹۰");
    expect(formatCardDisplay("۶۰۳۷-۹۹۱۲ ۳۴۵۶ ۷۸۹۰")).toBe(
      "۶۰۳۷ ۹۹۱۲ ۳۴۵۶ ۷۸۹۰",
    );
    expect(formatCardDisplay("")).toBe("");
  });
});

import { describe, expect, it } from "vitest";
import {
  amountToWords,
  foldPersian,
  isValidIranMobile,
  persianizeDigits,
  sanitizeDecimalInput,
  sanitizeIntegerInput,
  shortAmount,
  toLatinDigits,
} from "./persian.js";

describe("persian utilities", () => {
  describe("foldPersian", () => {
    it("normalizes Arabic letters to Persian equivalents", () => {
      // Arabic yeh (ي) and alef maksura (ى) -> Persian yeh (ی)
      expect(foldPersian("علي")).toBe("علی");
      expect(foldPersian("حَتّیٰ")).toBe("حتی");
      expect(foldPersian("موسیٰ")).toBe("موسی");

      // Arabic kaf (ك) -> Persian keheh (ک)
      expect(foldPersian("كتاب")).toBe("کتاب");
      expect(foldPersian("شركت")).toBe("شرکت");

      // Arabic teh marbuta (ة) -> Persian heh (ه)
      expect(foldPersian("مکتبة")).toBe("مکتبه");
      expect(foldPersian("دائرة")).toBe("دائره");
    });

    it("normalizes alef variants to plain alef (ا)", () => {
      expect(foldPersian("آسمان")).toBe("اسمان");
      expect(foldPersian("أحمد")).toBe("احمد");
      expect(foldPersian("إسلام")).toBe("اسلام");
      expect(foldPersian("ٱلحمد")).toBe("الحمد");
    });

    it("handles ZWNJ and collapses whitespace for fuzzy search matching", () => {
      // Prompt specification: "علي اباد" matches "علی‌آباد"
      expect(foldPersian("علي اباد")).toBe("علی اباد");
      expect(foldPersian("علی‌آباد")).toBe("علی اباد");
      expect(foldPersian("علي اباد")).toBe(foldPersian("علی‌آباد"));

      // Compounds with ZWNJ
      expect(foldPersian("می‌خواهم")).toBe("می خواهم");
      expect(foldPersian("کتاب‌ها")).toBe("کتاب ها");
      expect(foldPersian("پیش‌فرض")).toBe("پیش فرض");

      // Leading, trailing, and repeated ZWNJ
      expect(foldPersian("‌کتاب‌")).toBe("کتاب");
      expect(foldPersian("علی‌‌‌آباد")).toBe("علی اباد");
    });

    it("removes extra spaces and trims leading/trailing whitespace", () => {
      expect(foldPersian("  سلام    دنیا   ")).toBe("سلام دنیا");
      expect(foldPersian(" علی   آباد ")).toBe("علی اباد");
    });

    it("preserves Latin strings without disruption", () => {
      expect(foldPersian("Hello World")).toBe("Hello World");
      expect(foldPersian("  Component   Props  ")).toBe("Component Props");
    });

    it("handles empty or non-string inputs gracefully", () => {
      expect(foldPersian("")).toBe("");
      // @ts-expect-error - defensive check for JS callers
      expect(foldPersian(null)).toBe("");
      // @ts-expect-error - defensive check for JS callers
      expect(foldPersian(undefined)).toBe("");
    });
  });

  describe("amountToWords", () => {
    it("handles 0, 1, 10, 100, 1000", () => {
      expect(amountToWords(0)).toBe("صفر");
      expect(amountToWords(1)).toBe("یک");
      expect(amountToWords(10)).toBe("ده");
      expect(amountToWords(100)).toBe("صد");
      expect(amountToWords(1000)).toBe("یک هزار");
    });

    it("converts intermediate numbers accurately", () => {
      expect(amountToWords(15)).toBe("پانزده");
      expect(amountToWords(25)).toBe("بیست و پنج");
      expect(amountToWords(99)).toBe("نود و نه");
      expect(amountToWords(105)).toBe("صد و پنج");
      expect(amountToWords(250)).toBe("دویست و پنجاه");
      expect(amountToWords(1001)).toBe("یک هزار و یک");
      expect(amountToWords(2000)).toBe("دو هزار");
    });

    it("converts large numbers up to billions and trillions", () => {
      // Prompt example: 1250000 -> "یک میلیون و دویست و پنجاه هزار"
      expect(amountToWords(1250000)).toBe("یک میلیون و دویست و پنجاه هزار");
      expect(amountToWords(1000000)).toBe("یک میلیون");
      expect(amountToWords(1000000000)).toBe("یک میلیارد");
      expect(amountToWords(2500000000)).toBe("دو میلیارد و پانصد میلیون");
      expect(amountToWords(1000000000000)).toBe("یک تریلیون");
      expect(amountToWords(5000000000000)).toBe("پنج تریلیون");
    });

    it("handles negative numbers", () => {
      expect(amountToWords(-100)).toBe("منفی صد");
      expect(amountToWords(-1000)).toBe("منفی یک هزار");
      expect(amountToWords(-1250000)).toBe(
        "منفی یک میلیون و دویست و پنجاه هزار",
      );
    });

    it("appends unit suffix properly", () => {
      expect(amountToWords(0, "تومان")).toBe("صفر تومان");
      expect(amountToWords(1, "ریال")).toBe("یک ریال");
      expect(amountToWords(100, "تومان")).toBe("صد تومان");
      expect(amountToWords(1250000, "تومان")).toBe(
        "یک میلیون و دویست و پنجاه هزار تومان",
      );
      expect(amountToWords(-1250000, "تومان")).toBe(
        "منفی یک میلیون و دویست و پنجاه هزار تومان",
      );
    });

    it("handles decimal numbers", () => {
      expect(amountToWords(1.5)).toBe("یک ممیز پنج دهم");
      expect(amountToWords(10.25, "تومان")).toBe(
        "ده ممیز بیست و پنج صدم تومان",
      );
      expect(amountToWords(-0.5)).toBe("منفی صفر ممیز پنج دهم");
    });

    it("handles invalid or non-finite inputs", () => {
      expect(amountToWords(Number.NaN)).toBe("");
      expect(amountToWords(Number.POSITIVE_INFINITY)).toBe("");
    });
  });

  describe("shortAmount", () => {
    it("formats numbers below 1000 using Persian digits", () => {
      expect(shortAmount(0)).toBe("۰");
      expect(shortAmount(42)).toBe("۴۲");
      expect(shortAmount(500)).toBe("۵۰۰");
      expect(shortAmount(999)).toBe("۹۹۹");
    });

    it("formats thousands scale", () => {
      // Prompt example: 500000 -> "۵۰۰ هزار"
      expect(shortAmount(500000)).toBe("۵۰۰ هزار");
      expect(shortAmount(1000)).toBe("۱ هزار");
      expect(shortAmount(1500)).toBe("۱٫۵ هزار");
      expect(shortAmount(75000)).toBe("۷۵ هزار");
    });

    it("formats millions scale", () => {
      // Prompt examples: 1000000 -> "۱ میلیون", 2500000 -> "۲٫۵ میلیون"
      expect(shortAmount(1000000)).toBe("۱ میلیون");
      expect(shortAmount(2500000)).toBe("۲٫۵ میلیون");
      expect(shortAmount(1250000)).toBe("۱٫۲۵ میلیون");
      expect(shortAmount(50000000)).toBe("۵۰ میلیون");
    });

    it("formats billions and trillions scales", () => {
      expect(shortAmount(1000000000)).toBe("۱ میلیارد");
      expect(shortAmount(2500000000)).toBe("۲٫۵ میلیارد");
      expect(shortAmount(1000000000000)).toBe("۱ تریلیون");
      expect(shortAmount(3500000000000)).toBe("۳٫۵ تریلیون");
    });

    it("formats negative numbers cleanly", () => {
      expect(shortAmount(-500000)).toBe("-۵۰۰ هزار");
      expect(shortAmount(-2500000)).toBe("-۲٫۵ میلیون");
      expect(shortAmount(-1000000000)).toBe("-۱ میلیارد");
    });

    it("uses Persian momayyez (٫) as decimal separator", () => {
      const result = shortAmount(2500000);
      expect(result).toBe("۲٫۵ میلیون");
      expect(result).toContain("٫");
      expect(result).not.toContain(".");
    });

    it("handles invalid inputs gracefully", () => {
      expect(shortAmount(Number.NaN)).toBe("");
      expect(shortAmount(Number.POSITIVE_INFINITY)).toBe("");
    });
  });

  describe("re-exported numeric and phone utilities", () => {
    it("re-exports persianizeDigits correctly", () => {
      expect(persianizeDigits("12345")).toBe("۱۲۳۴۵");
      expect(persianizeDigits(42)).toBe("۴۲");
    });

    it("re-exports toLatinDigits correctly", () => {
      expect(toLatinDigits("۱۲۳۴۵")).toBe("12345");
      expect(toLatinDigits("١٢٣٤٥")).toBe("12345");
      expect(toLatinDigits("۱۲٫۵")).toBe("12.5");
    });

    it("re-exports sanitizeDecimalInput correctly", () => {
      expect(sanitizeDecimalInput("۱۲٫۵")).toBe("12.5");
      expect(sanitizeDecimalInput("-۱۲٫۵", { allowNegative: true })).toBe(
        "-12.5",
      );
    });

    it("re-exports sanitizeIntegerInput correctly", () => {
      expect(sanitizeIntegerInput("۱۲۳abc۴۵")).toBe("12345");
    });

    it("re-exports isValidIranMobile correctly", () => {
      expect(isValidIranMobile("09123456789")).toBe(true);
      expect(isValidIranMobile("+989123456789")).toBe(true);
      expect(isValidIranMobile("۰۹۱۲۳۴۵۶۷۸۹")).toBe(true);
      expect(isValidIranMobile("08123456789")).toBe(false);
    });
  });
});

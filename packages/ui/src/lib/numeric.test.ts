import { describe, expect, it } from "bun:test";
import {
  persianizeDigits,
  sanitizeDecimalInput,
  sanitizeIntegerInput,
  toLatinDigits,
} from "./numeric";

describe("numeric utilities", () => {
  describe("toLatinDigits", () => {
    it("converts Persian and Arabic digits to Latin ASCII", () => {
      expect(toLatinDigits("۱۲۳۴۵۶۷۸۹۰")).toBe("1234567890");
      expect(toLatinDigits("١٢٣٤٥٦٧٨٩٠")).toBe("1234567890");
      expect(toLatinDigits("abc-۱۲.۵")).toBe("abc-12.5");
    });

    it("converts Persian momayyez and Arabic comma to dot", () => {
      expect(toLatinDigits("۱۲٫۵")).toBe("12.5");
      expect(toLatinDigits("۱۲،۵")).toBe("12.5");
      expect(toLatinDigits("۱۰٫۰۰۰،۵")).toBe("10.000.5");
    });

    it("handles empty or non-digit input gracefully", () => {
      expect(toLatinDigits("")).toBe("");
      expect(toLatinDigits("hello world")).toBe("hello world");
    });
  });

  describe("persianizeDigits", () => {
    it("persianizes Latin digits for display", () => {
      expect(persianizeDigits("1234567890")).toBe("۱۲۳۴۵۶۷۸۹۰");
      expect(persianizeDigits(42.5)).toBe("۴۲.۵");
      expect(persianizeDigits(0)).toBe("۰");
      expect(persianizeDigits("0")).toBe("۰");
    });

    it("returns empty string for null and undefined", () => {
      expect(persianizeDigits(null)).toBe("");
      expect(persianizeDigits(undefined)).toBe("");
      expect(persianizeDigits("")).toBe("");
    });

    it("preserves non-digit text alongside digits", () => {
      expect(persianizeDigits("Item 42 - 100%")).toBe("Item ۴۲ - ۱۰۰%");
    });
  });

  describe("sanitizeDecimalInput", () => {
    it("sanitizes Persian and Arabic decimal inputs", () => {
      expect(sanitizeDecimalInput("۱۲.۵")).toBe("12.5");
      expect(sanitizeDecimalInput("۱۲٫۵")).toBe("12.5");
      expect(sanitizeDecimalInput("۱۲،۵")).toBe("12.5");
      expect(sanitizeDecimalInput("۰٫۰۰۱")).toBe("0.001");
    });

    it("preserves at most one decimal point", () => {
      expect(sanitizeDecimalInput("12..55")).toBe("12.55");
      expect(sanitizeDecimalInput("1.2.3.4")).toBe("1.234");
    });

    it("preserves trailing decimal point while typing", () => {
      expect(sanitizeDecimalInput("1.")).toBe("1.");
      expect(sanitizeDecimalInput("0.")).toBe("0.");
    });

    it("strips invalid characters", () => {
      expect(sanitizeDecimalInput("1.2abc")).toBe("1.2");
      expect(sanitizeDecimalInput("abc")).toBe("");
      expect(sanitizeDecimalInput("  25.4  ")).toBe("25.4");
    });

    it("handles negative numbers based on options", () => {
      expect(sanitizeDecimalInput("-10", { allowNegative: true })).toBe("-10");
      expect(sanitizeDecimalInput("-10", { allowNegative: false })).toBe("10");
      expect(sanitizeDecimalInput("-10")).toBe("10");
      expect(sanitizeDecimalInput("-", { allowNegative: true })).toBe("-");
      expect(sanitizeDecimalInput("-", { allowNegative: false })).toBe("");
      expect(sanitizeDecimalInput("-1.5", { allowNegative: true })).toBe(
        "-1.5",
      );
      expect(sanitizeDecimalInput(" -1.5", { allowNegative: true })).toBe(
        "-1.5",
      );
    });
  });

  describe("sanitizeIntegerInput", () => {
    it("sanitizes integer input removing non-digits", () => {
      expect(sanitizeIntegerInput("۱۲۳۴")).toBe("1234");
      expect(sanitizeIntegerInput("12.34")).toBe("1234");
      expect(sanitizeIntegerInput("۱۲,۳۴۵")).toBe("12345");
      expect(sanitizeIntegerInput("-42")).toBe("42");
      expect(sanitizeIntegerInput("abc 42 def")).toBe("42");
    });

    it("returns empty string for empty or null-like input", () => {
      expect(sanitizeIntegerInput("")).toBe("");
      expect(sanitizeIntegerInput("abc")).toBe("");
    });
  });
});

import { persianizeDigits } from "./numeric.js";

export {
  persianizeDigits,
  sanitizeDecimalInput,
  sanitizeIntegerInput,
  toLatinDigits,
} from "./numeric.js";
export { isValidIranMobile } from "./phone.js";

/**
 * Normalizes Arabic letters (ي/ك/ى/ة), Alef forms (آ/أ/إ/ٱ), strips Arabic/Persian diacritics,
 * and collapses ZWNJ (\u200C) and extra whitespace into single spaces for fuzzy matching in search and comboboxes.
 *
 * @example
 * foldPersian("علي اباد") === foldPersian("علی‌آباد") // true ("علی اباد")
 *
 * @experimental
 */
export function foldPersian(s: string): string {
  if (s == null || typeof s !== "string" || s.length === 0) {
    return "";
  }

  return (
    s
      // Arabic yeh and alef maksura -> Persian yeh
      .replace(/[يى]/g, "ی")
      // Arabic kaf -> Persian keheh
      .replace(/ك/g, "ک")
      // Arabic teh marbuta -> Persian heh
      .replace(/ة/g, "ه")
      // Alef forms [آأإٱ] -> plain alef ا
      .replace(/[آأإٱ]/g, "ا")
      // Diacritics / harakat (fatha, damma, kasra, tanwin, sukun, shadda, dagger alef)
      .replace(/[\u064B-\u065F\u0670]/g, "")
      // Convert ZWNJ and invisible formatting markers to space (using alternation to avoid misleading character class lint)
      .replace(/\u200C|\u200D|[\u200E\u200F\uFEFF]/g, " ")
      // Collapse multiple whitespace characters into a single space and trim
      .replace(/\s+/g, " ")
      .trim()
  );
}

const ONES = ["", "یک", "دو", "سه", "چهار", "پنج", "شش", "هفت", "هشت", "نه"];

const TEENS = [
  "ده",
  "یازده",
  "دوازده",
  "سیزده",
  "چهارده",
  "پانزده",
  "شانزده",
  "هفده",
  "هجده",
  "نوزده",
];

const TENS = [
  "",
  "",
  "بیست",
  "سی",
  "چهل",
  "پنجاه",
  "شصت",
  "هفتاد",
  "هشتاد",
  "نود",
];

const HUNDREDS = [
  "",
  "صد",
  "دویست",
  "سیصد",
  "چهارصد",
  "پانصد",
  "ششصد",
  "هفتصد",
  "هشتصد",
  "نهصد",
];

const SCALES = ["", "هزار", "میلیون", "میلیارد", "تریلیون", "کوادریلیون"];

const DECIMAL_UNITS = [
  "",
  "دهم",
  "صدم",
  "هزارم",
  "ده‌هزارم",
  "صدهزارم",
  "میلیونیم",
];

function convertThreeDigits(num: number): string {
  const parts: string[] = [];
  const h = Math.floor(num / 100);
  const rem = num % 100;

  if (h > 0) {
    const hundredWord = HUNDREDS[h];
    if (hundredWord) parts.push(hundredWord);
  }

  if (rem >= 10 && rem < 20) {
    const teenWord = TEENS[rem - 10];
    if (teenWord) parts.push(teenWord);
  } else {
    const t = Math.floor(rem / 10);
    const u = rem % 10;
    if (t > 0) {
      const tenWord = TENS[t];
      if (tenWord) parts.push(tenWord);
    }
    if (u > 0) {
      const oneWord = ONES[u];
      if (oneWord) parts.push(oneWord);
    }
  }

  return parts.join(" و ");
}

function integerToWords(num: number): string {
  if (num === 0) return "صفر";

  let remaining = num;
  const chunks: number[] = [];

  while (remaining > 0) {
    chunks.push(remaining % 1000);
    remaining = Math.floor(remaining / 1000);
  }

  const parts: string[] = [];
  for (let i = chunks.length - 1; i >= 0; i--) {
    const chunkVal = chunks[i];
    if (chunkVal != null && chunkVal > 0) {
      const chunkWords = convertThreeDigits(chunkVal);
      const scaleName = SCALES[i];
      if (scaleName) {
        parts.push(`${chunkWords} ${scaleName}`);
      } else {
        parts.push(chunkWords);
      }
    }
  }

  return parts.join(" و ");
}

/**
 * Converts numbers into Persian words.
 * Handles negative numbers, zero, numbers up to billions/trillions, and optional currency/measurement unit.
 *
 * @example
 * amountToWords(1250000) // "یک میلیون و دویست و پنجاه هزار"
 * amountToWords(1250000, "تومان") // "یک میلیون و دویست و پنجاه هزار تومان"
 * amountToWords(0) // "صفر"
 * amountToWords(-100) // "منفی صد"
 *
 * @experimental
 */
export function amountToWords(n: number, unit?: string): string {
  if (n == null || Number.isNaN(n) || !Number.isFinite(n)) {
    return "";
  }

  const isNegative = n < 0;
  const absN = Math.abs(n);

  let words = "";

  if (Number.isInteger(absN)) {
    words = integerToWords(absN);
  } else {
    // Decimals: round to at most 6 decimal digits to prevent JS floating-point anomalies
    const roundedStr = Number(absN.toFixed(6)).toString();
    const [intStr = "0", decStr] = roundedStr.split(".");
    const intNum = Number.parseInt(intStr, 10);
    const decNum = decStr ? Number.parseInt(decStr, 10) : 0;

    if (decNum > 0 && decStr && decStr.length <= 6) {
      const intWords = intNum === 0 ? "صفر" : integerToWords(intNum);
      const decWords = integerToWords(decNum);
      const decUnit = DECIMAL_UNITS[decStr.length] ?? "";
      words = `${intWords} ممیز ${decWords} ${decUnit}`.trim();
    } else {
      words = integerToWords(intNum);
    }
  }

  if (isNegative && words.length > 0) {
    words = `منفی ${words}`;
  }

  if (unit?.trim()) {
    words = `${words} ${unit.trim()}`;
  }

  return words;
}

const SHORT_SCALES: { threshold: number; suffix: string }[] = [
  { threshold: 1_000_000_000_000, suffix: "تریلیون" },
  { threshold: 1_000_000_000, suffix: "میلیارد" },
  { threshold: 1_000_000, suffix: "میلیون" },
  { threshold: 1_000, suffix: "هزار" },
];

/**
 * Formats numbers into short Persian abbreviations using Persian momayyez (٫) and Persian digits.
 *
 * @example
 * shortAmount(1000000) // "۱ میلیون"
 * shortAmount(2500000) // "۲٫۵ میلیون"
 * shortAmount(500000) // "۵۰۰ هزار"
 * shortAmount(0) // "۰"
 *
 * @experimental
 */
export function shortAmount(n: number): string {
  if (n == null || Number.isNaN(n) || !Number.isFinite(n)) {
    return "";
  }

  const isNegative = n < 0;
  const absN = Math.abs(n);

  if (absN === 0) {
    return persianizeDigits(0);
  }

  for (const scale of SHORT_SCALES) {
    if (absN >= scale.threshold) {
      const val = absN / scale.threshold;
      // Round to at most 2 decimal places, dropping unnecessary trailing zeros
      const rounded = Number(val.toFixed(2)).toString();
      const withMomayyez = rounded.replace(".", "٫");
      const digits = persianizeDigits(withMomayyez);
      const sign = isNegative ? "-" : "";
      return `${sign}${digits} ${scale.suffix}`;
    }
  }

  const rounded = Number(absN.toFixed(2)).toString();
  const withMomayyez = rounded.replace(".", "٫");
  const digits = persianizeDigits(withMomayyez);
  const sign = isNegative ? "-" : "";
  return `${sign}${digits}`;
}

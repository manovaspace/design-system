const PERSIAN_DIGITS = ["۰", "۱", "۲", "۳", "۴", "۵", "۶", "۷", "۸", "۹"];
const ARABIC_INDIC_DIGITS = ["٠", "١", "٢", "٣", "٤", "٥", "٦", "٧", "٨", "٩"];

/**
 * Converts Persian (۰-۹) and Arabic-Indic (٠-٩) digits to standard ASCII digits (0-9).
 * Also converts Persian decimal comma/momayyez (٫ and ،) to standard dot (.).
 */
export function toLatinDigits(value: string): string {
  if (!value) return "";
  let res = "";
  for (const ch of value) {
    const pIdx = PERSIAN_DIGITS.indexOf(ch);
    if (pIdx !== -1) {
      res += pIdx.toString();
      continue;
    }
    const aIdx = ARABIC_INDIC_DIGITS.indexOf(ch);
    if (aIdx !== -1) {
      res += aIdx.toString();
      continue;
    }
    if (ch === "٫" || ch === "،") {
      res += ".";
      continue;
    }
    res += ch;
  }
  return res;
}

/**
 * Converts ASCII digits 0-9 to Persian digits ۰-۹ for UI display.
 * Returns empty string if null or undefined.
 */
export function persianizeDigits(
  value: string | number | null | undefined,
): string {
  if (value == null) return "";
  const str = String(value);
  return str.replace(/[0-9]/g, (d) => PERSIAN_DIGITS[Number(d)] ?? d);
}

/**
 * Normalizes Persian/Arabic digits, strips invalid characters, preserves at most
 * one decimal point (.), and supports optional leading minus if allowNegative is true.
 */
export function sanitizeDecimalInput(
  value: string,
  options?: { allowNegative?: boolean },
): string {
  if (value == null) return "";
  const normalized = toLatinDigits(value);
  let result = "";
  let hasDecimal = false;
  const isNegative = Boolean(
    options?.allowNegative && normalized.trimStart().startsWith("-"),
  );

  for (const ch of normalized) {
    if (ch >= "0" && ch <= "9") {
      result += ch;
    } else if (ch === "." && !hasDecimal) {
      result += ".";
      hasDecimal = true;
    }
  }

  if (isNegative) {
    return result.length > 0 ? `-${result}` : "-";
  }
  return result;
}

/**
 * Normalizes digits and strips everything except ASCII digits 0-9.
 */
export function sanitizeIntegerInput(value: string): string {
  if (value == null) return "";
  const normalized = toLatinDigits(value);
  return normalized.replace(/[^0-9]/g, "");
}

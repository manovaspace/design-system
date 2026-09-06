const PERSIAN_DIGITS = "۰۱۲۳۴۵۶۷۸۹";
const ARABIC_DIGITS = "٠١٢٣٤٥٦٧٨٩";

export function toLatinDigits(value: string): string {
  return value
    .replace(/[۰-۹]/g, (digit) => String(PERSIAN_DIGITS.indexOf(digit)))
    .replace(/[٠-٩]/g, (digit) => String(ARABIC_DIGITS.indexOf(digit)));
}

export function toLocaleDigits(value: string, locale: string): string {
  const formatter = new Intl.NumberFormat(locale, {
    useGrouping: false,
  });

  return value.replace(/\d/g, (digit) => formatter.format(Number(digit)));
}

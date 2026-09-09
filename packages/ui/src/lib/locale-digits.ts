export { toLatinDigits } from "./numeric.js";

export function toLocaleDigits(value: string, locale: string): string {
  const formatter = new Intl.NumberFormat(locale, {
    useGrouping: false,
  });

  return value.replace(/\d/g, (digit) => formatter.format(Number(digit)));
}

import { toLatinDigits } from "./numeric.js";

/** Strip Persian/Arabic-Indic digits and separators to the API card shape. */
export function normalizeCardDigits(raw: string): string {
  return toLatinDigits(raw ?? "").replace(/\D/g, "");
}

/** Iranian bank card numbers are stored and exchanged as 16 digits. */
export function isValidIranBankCard(cardNumber: string): boolean {
  return /^\d{16}$/.test(normalizeCardDigits(cardNumber));
}

/** Canonical Latin card number for clipboard and API payloads. */
export function formatCardCopy(cardNumber: string): string {
  return normalizeCardDigits(cardNumber);
}

/** Grouped Persian card number for the RTL display layer. */
export function formatCardDisplay(cardNumber: string): string {
  const digits = formatCardCopy(cardNumber).replace(/\d/g, (digit) =>
    String.fromCharCode(digit.charCodeAt(0) + 0x06f0 - 0x30),
  );
  return digits.match(/.{1,4}/g)?.join(" ") ?? "";
}

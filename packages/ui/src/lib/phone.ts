import { persianizeDigits, toLatinDigits } from "./numeric.js";

/**
 * Strip to ASCII digits — Persian/Arabic-Indic normalized.
 * @experimental
 */
export function normalizePhoneDigits(raw: string): string {
  return toLatinDigits(raw).replace(/\D/g, "");
}

/**
 * Canonicalizes any Iranian mobile number input (e.g. 0912..., +98912..., 0098912..., 98912..., 912...)
 * into canonical standard format `09` + 9 digits.
 * @experimental
 */
export function normalizeIranMobile(phone: string): string {
  const digits = normalizePhoneDigits(phone);

  if (digits.length === 14 && digits.startsWith("0098")) {
    return `0${digits.slice(4)}`;
  }
  if (digits.length === 12 && digits.startsWith("98")) {
    return `0${digits.slice(2)}`;
  }
  if (digits.length === 10 && digits.startsWith("9")) {
    return `0${digits}`;
  }

  return digits;
}

/**
 * Iranian mobile MSISDN: 09 followed by 9 digits.
 * @experimental
 */
export function isValidIranMobile(phone: string): boolean {
  return /^09\d{9}$/.test(normalizeIranMobile(phone));
}

/**
 * Per-keystroke sanitizer for Iranian MSISDN input.
 * Strips everything except digits and an optional leading `+` so E.164 typing is preserved mid-keystroke.
 * @experimental
 */
export function normalizeIranMobileInput(raw: string): string {
  const digits = normalizePhoneDigits(raw);
  return raw.trimStart().startsWith("+") ? `+${digits}` : digits;
}

/**
 * Persian digits for on-screen display.
 * @experimental
 */
export function persianizePhoneDigits(raw: string): string {
  return persianizeDigits(normalizePhoneDigits(raw));
}

/**
 * E.164 without spaces, e.g. +989123456789
 * @experimental
 */
export function formatPhoneE164(phone: string): string {
  const digits = normalizePhoneDigits(phone);
  if (digits.startsWith("09")) {
    return `+98${digits.slice(1)}`;
  }
  if (digits.startsWith("98")) {
    return `+${digits}`;
  }
  return digits.length > 0 ? `+${digits}` : "";
}

/** @experimental */
export function formatPhoneTelHref(phone: string): string {
  const e164 = formatPhoneE164(phone);
  return e164 ? `tel:${e164}` : "";
}

/** @experimental */
export function formatPhoneSmsHref(phone: string): string {
  const e164 = formatPhoneE164(phone);
  return e164 ? `sms:${e164}` : "";
}

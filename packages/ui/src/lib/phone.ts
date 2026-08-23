import { latinizeDigits } from "./latin-digits";

/** Strip to ASCII digits — Persian/Arabic-Indic normalized. */
export function normalizePhoneDigits(raw: string): string {
  return latinizeDigits(raw).replace(/\D/g, "");
}

/** Iranian mobile MSISDN: 09 followed by 9 digits. */
export function isValidIranMobile(phone: string): boolean {
  return /^09\d{9}$/.test(normalizePhoneDigits(phone));
}

/** Persian digits for on-screen display. */
export function persianizePhoneDigits(raw: string): string {
  return normalizePhoneDigits(raw).replace(/\d/g, (digit) =>
    String.fromCharCode(digit.charCodeAt(0) + 0x06f0 - 0x30),
  );
}

/** Latin MSISDN for clipboard and APIs. */
export function formatPhoneCopy(phone: string): string {
  return normalizePhoneDigits(phone);
}

export function formatPhoneDisplay(phone: string): string {
  return persianizePhoneDigits(phone);
}

/** E.164 without spaces, e.g. +989123456789 */
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

export function formatPhoneTelHref(phone: string): string {
  const e164 = formatPhoneE164(phone);
  return e164 ? `tel:${e164}` : "";
}

export function formatPhoneSmsHref(phone: string): string {
  const e164 = formatPhoneE164(phone);
  return e164 ? `sms:${e164}` : "";
}

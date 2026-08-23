import type { ClipboardEvent } from "react";

/** Maps Persian (۰-۹) and Arabic-Indic (٠-٩) digits to ASCII 0-9. */
export function latinizeDigits(raw: string): string {
  return raw
    .replace(/[۰-۹]/g, (d) => String(d.charCodeAt(0) - 0x06f0))
    .replace(/[٠-٩]/g, (d) => String(d.charCodeAt(0) - 0x0660));
}

/** Persian/Arabic grouping separators and thin spaces — stripped on clipboard export. */
const GROUPING_SEPARATOR = /[،٬,\u066C\u2009\s]/g;

/**
 * Normalizes a user selection for clipboard: Latin digits, no grouping noise.
 * Preserves a single decimal point when present.
 */
export function normalizeClipboardNumeric(text: string): string {
  let value = latinizeDigits(text).replace(GROUPING_SEPARATOR, "");
  value = value.replace(/[٫]/g, ".");
  const dot = value.indexOf(".");
  if (dot === -1) {
    return value;
  }
  const whole = value.slice(0, dot);
  const fraction = value.slice(dot + 1).replace(/\./g, "");
  return `${whole}.${fraction}`;
}

/**
 * Writes Latin/canonical text to the clipboard, replacing Persian display.
 * When `canonical` is set it wins (e.g. full MSISDN); otherwise the current
 * selection is normalized digit-by-digit.
 */
export function writeLatinClipboard(
  event: ClipboardEvent,
  canonical?: string,
): void {
  const plain =
    canonical ??
    (() => {
      const selection = window.getSelection()?.toString() ?? "";
      return selection ? normalizeClipboardNumeric(selection) : "";
    })();
  if (!plain) {
    return;
  }
  event.preventDefault();
  event.clipboardData.setData("text/plain", plain);
}

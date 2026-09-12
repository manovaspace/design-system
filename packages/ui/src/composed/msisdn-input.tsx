"use client";

import type { ComponentPropsWithoutRef } from "react";
import { forwardRef } from "react";
import { Input } from "../input.js";
import { persianizeDigits, toLatinDigits } from "../lib/numeric.js";
import { normalizeIranMobileInput } from "../lib/phone.js";
import { cn } from "../lib/utils.js";

const DEFAULT_PLACEHOLDER = "09123456789";

export type MsisdnInputProps = Omit<
  ComponentPropsWithoutRef<"input">,
  "value" | "onChange" | "type" | "inputMode"
> & {
  /** Canonical Latin digits string (e.g. "09120000001" or "+989120000001"). */
  value: string;
  /** Emits sanitized Latin digits on every keystroke. */
  onValueChange: (value: string) => void;
  /**
   * Active locale code (e.g. "fa", "en").
   * When Persian/fa: renders Persian digits (۰۹۱۲...).
   * When English/en: renders Latin digits (0912...).
   * When omitted: auto-detects from document.documentElement.lang / dir.
   */
  locale?: string;
};

function resolveIsPersian(locale?: string): boolean {
  if (locale) {
    return locale.toLowerCase().startsWith("fa");
  }
  if (typeof document !== "undefined") {
    const lang = document.documentElement.lang;
    if (lang) {
      return lang.toLowerCase().startsWith("fa");
    }
    return document.documentElement.dir === "rtl";
  }
  return true;
}

/**
 * Iranian MSISDN input — Goldstein / Manova standard.
 * Canonical Latin digits in state/API, localized digits on screen.
 * Typing Persian or English digits results in identical Latin state and identical active-language display.
 * Direction is enforced LTR with start alignment and Vazirmatn tabular typography.
 */
export const MsisdnInput = forwardRef<HTMLInputElement, MsisdnInputProps>(
  function MsisdnInput(
    {
      value,
      onValueChange,
      locale,
      className,
      placeholder = DEFAULT_PLACEHOLDER,
      onCopy,
      ...props
    },
    ref,
  ) {
    const isPersian = resolveIsPersian(locale);
    const displayValue = isPersian
      ? persianizeDigits(value)
      : toLatinDigits(value);
    const displayPlaceholder =
      placeholder != null
        ? isPersian
          ? persianizeDigits(String(placeholder))
          : toLatinDigits(String(placeholder))
        : undefined;

    return (
      <Input
        ref={ref}
        type="text"
        inputMode="numeric"
        dir="ltr"
        spellCheck={false}
        className={cn(
          "font-[family-name:var(--font-data)] tabular-nums text-start gst-data gst-numeric gst-data--tabular gst-numeric--tabular",
          className,
        )}
        value={displayValue}
        placeholder={displayPlaceholder}
        onChange={(event) => {
          onValueChange(normalizeIranMobileInput(event.target.value));
        }}
        onCopy={(event) => {
          const el = event.currentTarget;
          const start = el.selectionStart ?? 0;
          const end = el.selectionEnd ?? 0;
          const selection = displayValue.slice(start, end);
          const plain =
            start === end || !selection ? value : toLatinDigits(selection);
          if (plain) {
            event.preventDefault();
            event.clipboardData?.setData("text/plain", plain);
          }
          onCopy?.(event);
        }}
        {...props}
      />
    );
  },
);

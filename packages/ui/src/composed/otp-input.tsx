"use client";

import type { ComponentPropsWithoutRef } from "react";
import { forwardRef } from "react";
import { Input } from "../input.js";
import { persianizeDigits, toLatinDigits } from "../lib/numeric.js";
import { normalizeDigits } from "../lib/phone.js";
import { cn } from "../lib/utils.js";

export type OtpInputProps = Omit<
  ComponentPropsWithoutRef<"input">,
  "value" | "onChange" | "type" | "inputMode"
> & {
  /** Canonical Latin digits string (e.g. "111111"). */
  value: string;
  /** Emits sanitized Latin digits on every keystroke. */
  onValueChange: (value: string) => void;
  /** Number of digits (default 6). */
  maxLength?: number;
  /**
   * Active locale code (e.g. "fa", "en").
   * When Persian/fa: renders Persian digits (۱۲۳۴۵۶).
   * When English/en: renders Latin digits (123456).
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
 * OTP input — Goldstein / Manova standard.
 * Canonical Latin digits in state/API, localized digits on screen.
 * Persian or English keystrokes produce identical Latin state and identical active-language display.
 * Rendered with Vazirmatn tabular figures, wide tracking, and centered direction-enforced LTR.
 */
export const OtpInput = forwardRef<HTMLInputElement, OtpInputProps>(
  function OtpInput(
    {
      value,
      onValueChange,
      maxLength = 6,
      locale,
      className,
      placeholder,
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
        maxLength={maxLength}
        className={cn(
          "font-[family-name:var(--font-data)] tabular-nums tracking-[0.35em] text-center text-lg font-semibold gst-data gst-numeric gst-data--tabular gst-numeric--tabular",
          className,
        )}
        value={displayValue}
        placeholder={displayPlaceholder}
        onChange={(event) => {
          onValueChange(
            normalizeDigits(event.target.value).slice(0, maxLength),
          );
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

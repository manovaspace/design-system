"use client";

import type * as React from "react";
import { forwardRef, useCallback, useId, useRef, useState } from "react";

import { persianizeDigits, sanitizeIntegerInput } from "../lib/numeric.js";
import { amountToWords, shortAmount } from "../lib/persian.js";
import { cn } from "../lib/utils.js";

export type AmountInputProps = Omit<
  React.ComponentPropsWithoutRef<"input">,
  "value" | "defaultValue" | "onChange" | "min" | "max"
> & {
  value?: number | null;
  defaultValue?: number | null;
  onChange?: (value: number | null) => void;
  unit?: string; // default "تومان" in fa, "" in en
  min?: number;
  max?: number;
  words?: boolean; // default true in fa, spell out underneath
  quick?: number[]; // preset chips e.g. [100_000, 500_000, 1_000_000, 2_000_000]
  placeholder?: string;
  locale?: string;
  disabled?: boolean;
  className?: string;
  id?: string;
  "aria-label"?: string;
};

/**
 * Formats a numeric amount with thousands separator and locale digits.
 */
function formatAmount(num: number | null | undefined, isFa: boolean): string {
  if (num == null || !Number.isFinite(num)) {
    return "";
  }
  const isNegative = num < 0;
  const abs = Math.abs(Math.trunc(num)).toString();
  const sep = isFa ? "٬" : ",";
  const withSep = abs.replace(/\B(?=(\d{3})+(?!\d))/g, sep);
  const digits = isFa ? persianizeDigits(withSep) : withSep;
  return isNegative ? `-${digits}` : digits;
}

/**
 * Fintech amount entry with Persian numerals, thousands separator ("٬"),
 * spelled-out words in Persian, validation, and preset chips.
 */
export const AmountInput = forwardRef<HTMLInputElement, AmountInputProps>(
  function AmountInput(
    {
      value,
      defaultValue,
      onChange,
      unit,
      min,
      max,
      words,
      quick,
      placeholder,
      locale,
      disabled = false,
      className,
      id,
      "aria-label": ariaLabelProp,
      onCopy,
      ...props
    },
    ref,
  ) {
    const generatedId = useId();
    const inputId = id ?? `amount-input-${generatedId}`;
    const errorId = `${inputId}-error`;
    const wordsId = `${inputId}-words`;

    const isFa = !locale || locale.toLowerCase().startsWith("fa");
    const resolvedUnit = unit !== undefined ? unit : isFa ? "تومان" : "";
    const showWords = words !== undefined ? words : isFa;

    const isControlled = value !== undefined;
    const [uncontrolledValue, setUncontrolledValue] = useState<number | null>(
      defaultValue ?? null,
    );
    const currentValue = isControlled ? value : uncontrolledValue;

    const inputRef = useRef<HTMLInputElement | null>(null);

    const setRefs = useCallback(
      (node: HTMLInputElement | null) => {
        inputRef.current = node;
        if (typeof ref === "function") {
          ref(node);
        } else if (ref) {
          (ref as React.MutableRefObject<HTMLInputElement | null>).current =
            node;
        }
      },
      [ref],
    );

    // Min / max validation
    let isInvalid = false;
    let errorMessage: string | null = null;

    if (currentValue != null && Number.isFinite(currentValue)) {
      if (min !== undefined && currentValue < min) {
        isInvalid = true;
        const minDisplay = formatAmount(min, isFa);
        errorMessage = isFa
          ? `مبلغ نمی‌تواند کمتر از ${minDisplay}${resolvedUnit ? ` ${resolvedUnit}` : ""} باشد`
          : `Amount must be at least ${minDisplay}${resolvedUnit ? ` ${resolvedUnit}` : ""}`;
      } else if (max !== undefined && currentValue > max) {
        isInvalid = true;
        const maxDisplay = formatAmount(max, isFa);
        errorMessage = isFa
          ? `مبلغ نمی‌تواند بیشتر از ${maxDisplay}${resolvedUnit ? ` ${resolvedUnit}` : ""} باشد`
          : `Amount cannot exceed ${maxDisplay}${resolvedUnit ? ` ${resolvedUnit}` : ""}`;
      }
    }

    const displayValue = formatAmount(currentValue, isFa);
    const displayPlaceholder =
      placeholder !== undefined
        ? isFa
          ? persianizeDigits(placeholder)
          : placeholder
        : undefined;

    const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
      const raw = event.target.value;
      const sanitized = sanitizeIntegerInput(raw);
      const nextVal = sanitized === "" ? null : Number.parseInt(sanitized, 10);

      if (!isControlled) {
        setUncontrolledValue(nextVal);
      }
      onChange?.(nextVal);
    };

    const handleSelectQuick = (q: number) => {
      if (disabled) return;
      if (!isControlled) {
        setUncontrolledValue(q);
      }
      onChange?.(q);
      inputRef.current?.focus();
    };

    const handleCopy = (event: React.ClipboardEvent<HTMLInputElement>) => {
      const el = event.currentTarget;
      const start = el.selectionStart ?? 0;
      const end = el.selectionEnd ?? 0;
      const selection = displayValue.slice(start, end);
      const plain =
        start === end || !selection
          ? currentValue != null
            ? String(currentValue)
            : ""
          : sanitizeIntegerInput(selection);
      if (plain) {
        event.preventDefault();
        event.clipboardData?.setData("text/plain", plain);
      }
      onCopy?.(event);
    };

    const wordsText =
      showWords && currentValue != null && Number.isFinite(currentValue)
        ? amountToWords(currentValue, resolvedUnit)
        : null;

    const defaultAriaLabel = isFa ? "مبلغ" : "Amount";
    const ariaLabel = ariaLabelProp ?? defaultAriaLabel;

    const describedByIds: string[] = [];
    if (errorMessage) describedByIds.push(errorId);
    if (wordsText) describedByIds.push(wordsId);
    const ariaDescribedBy =
      describedByIds.length > 0 ? describedByIds.join(" ") : undefined;

    return (
      <div
        data-slot="amount-input"
        className={cn("w-full space-y-1.5", className)}
      >
        <div
          data-slot="amount-input-control"
          className={cn(
            "relative flex h-10 w-full items-center gap-2 rounded-[var(--rounded-field,var(--radius-lg))] border border-[var(--border-line-field,1px)] border-input bg-[var(--bg-field,var(--color-card))] px-3 text-sm shadow-[var(--shadow-field)] transition-[color,box-shadow]",
            "focus-within:border-ring focus-within:ring-2 focus-within:ring-ring/50",
            isInvalid &&
              "border-destructive focus-within:border-destructive focus-within:ring-destructive/20 dark:focus-within:ring-destructive/40",
            disabled && "opacity-50 cursor-not-allowed pointer-events-none",
          )}
        >
          <input
            ref={setRefs}
            id={inputId}
            type="text"
            inputMode="numeric"
            dir="ltr"
            value={displayValue}
            placeholder={displayPlaceholder}
            disabled={disabled}
            aria-invalid={isInvalid ? "true" : undefined}
            aria-label={ariaLabel}
            aria-describedby={ariaDescribedBy}
            onChange={handleInputChange}
            onCopy={handleCopy}
            className="h-full w-full min-w-0 bg-transparent border-0 p-0 text-start font-[family-name:var(--font-data)] tracking-[-0.02em] shadow-none outline-none focus:outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed selection:bg-primary selection:text-primary-foreground"
            {...props}
          />
          {resolvedUnit ? (
            <span
              data-slot="amount-input-unit"
              className="shrink-0 select-none text-xs text-muted-foreground pointer-events-none"
            >
              {resolvedUnit}
            </span>
          ) : null}
        </div>

        {errorMessage && (
          <p
            id={errorId}
            data-slot="amount-input-error"
            role="alert"
            className="text-xs text-destructive"
          >
            {errorMessage}
          </p>
        )}

        {wordsText && (
          <p
            id={wordsId}
            data-slot="amount-input-words"
            className="text-xs text-muted-foreground"
          >
            {wordsText}
          </p>
        )}

        {quick && quick.length > 0 && (
          <div
            data-slot="amount-input-quick"
            className="flex flex-wrap items-center gap-1.5 pt-0.5"
          >
            {quick.map((q) => {
              const chipLabel = isFa
                ? shortAmount(q)
                : `${formatAmount(q, false)} ${resolvedUnit}`.trim();
              const isSelected = currentValue === q;
              return (
                <button
                  key={q}
                  type="button"
                  disabled={disabled}
                  onClick={() => handleSelectQuick(q)}
                  data-slot="amount-input-chip"
                  data-selected={isSelected ? "true" : undefined}
                  className={cn(
                    "inline-flex items-center justify-center rounded-full px-2.5 py-1 text-xs font-medium transition-colors",
                    "border border-border/80 bg-secondary/50 text-secondary-foreground hover:bg-secondary cursor-pointer",
                    "focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring",
                    "disabled:pointer-events-none disabled:opacity-50",
                    isSelected &&
                      "border-primary bg-primary/10 text-primary font-semibold",
                  )}
                >
                  {chipLabel}
                </button>
              );
            })}
          </div>
        )}
      </div>
    );
  },
);

AmountInput.displayName = "AmountInput";

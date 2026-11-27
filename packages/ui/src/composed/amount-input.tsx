"use client";

import type * as React from "react";
import {
  forwardRef,
  useCallback,
  useEffect,
  useId,
  useLayoutEffect,
  useRef,
  useState,
} from "react";

import {
  fieldControlVariants,
  resolveFieldState,
} from "../lib/field-control.js";
import { persianizeDigits, sanitizeIntegerInput } from "../lib/numeric.js";
import { amountToWords, shortAmount } from "../lib/persian.js";
import { cn } from "../lib/utils.js";

const DIGIT_CHAR = /[0-9۰-۹٠-٩]/;
const useIsomorphicLayoutEffect =
  typeof window !== "undefined" ? useLayoutEffect : useEffect;

export type AmountInputProps = Omit<
  React.ComponentPropsWithoutRef<"input">,
  "value" | "defaultValue" | "onChange" | "min" | "max" | "size"
> & {
  /** Controlled amount: a `number | null` in numeric mode, or an ASCII digit string in digits mode. */
  value?: number | string | null;
  /** Uncontrolled initial amount (`number | null` or ASCII digit string). */
  defaultValue?: number | string | null;
  /** Numeric change handler (receives `number | null`). */
  onChange?: (value: number | null) => void;
  /** String-digits change handler (receives normalized ASCII digits, or `""` when cleared). */
  onValueChange?: (digits: string) => void;
  /** Value mode when uncontrolled or ambiguous; `"digits"` preserves arbitrary-precision digit strings. */
  mode?: "number" | "digits";
  unit?: string; // default "تومان" in fa, "" in en
  min?: number;
  max?: number;
  words?: boolean; // default true in fa, spell out underneath
  quick?: number[]; // preset chips e.g. [100_000, 500_000, 1_000_000, 2_000_000]
  placeholder?: string;
  locale?: string;
  size?: "default" | "touch";
  disabled?: boolean;
  className?: string;
  id?: string;
  "aria-label"?: string;
};

/**
 * Formats an ASCII digit string with thousands separator and locale digits.
 */
function formatDigits(digits: string, isFa: boolean): string {
  if (!digits) {
    return "";
  }
  const sep = isFa ? "٬" : ",";
  const withSep = digits.replace(/\B(?=(\d{3})+(?!\d))/g, sep);
  return isFa ? persianizeDigits(withSep) : withSep;
}

/**
 * Formats a numeric amount with thousands separator and locale digits.
 */
function formatAmount(num: number | null | undefined, isFa: boolean): string {
  if (num == null || !Number.isFinite(num)) {
    return "";
  }
  const isNegative = num < 0;
  const digits = formatDigits(Math.abs(Math.trunc(num)).toString(), isFa);
  return isNegative ? `-${digits}` : digits;
}

function digitsBefore(display: string, index: number): number {
  return sanitizeIntegerInput(display.slice(0, Math.max(0, index))).length;
}

function indexAfterDigits(display: string, count: number): number {
  if (count <= 0) {
    return 0;
  }
  let seen = 0;
  for (let i = 0; i < display.length; i++) {
    if (DIGIT_CHAR.test(display.charAt(i))) {
      seen += 1;
      if (seen === count) {
        return i + 1;
      }
    }
  }
  return display.length;
}

function isGroupingMark(char: string): boolean {
  return char === "٬" || char === ",";
}

function removeDigitAt(digits: string, index: number): string {
  return digits.slice(0, index) + digits.slice(index + 1);
}

function compareDigitString(digits: string, bound: number): number {
  if (Number.isInteger(bound)) {
    const a = BigInt(digits);
    const b = BigInt(bound);
    return a < b ? -1 : a > b ? 1 : 0;
  }
  const a = Number(digits);
  return a < bound ? -1 : a > bound ? 1 : 0;
}

/**
 * Fintech amount entry with Persian numerals, thousands separator ("٬"),
 * caret-preserving grouping, arbitrary-precision string-digits mode,
 * spelled-out words in Persian, validation, and preset chips.
 */
export const AmountInput = forwardRef<HTMLInputElement, AmountInputProps>(
  function AmountInput(
    {
      value,
      defaultValue,
      onChange,
      onValueChange,
      mode,
      unit,
      min,
      max,
      words,
      quick,
      placeholder,
      locale,
      size = "default",
      disabled = false,
      className,
      id,
      "aria-label": ariaLabelProp,
      "aria-invalid": ariaInvalidProp,
      "aria-describedby": ariaDescribedByProp,
      onKeyDown,
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

    const isDigitsMode =
      mode === "digits" ||
      typeof value === "string" ||
      typeof defaultValue === "string" ||
      (onValueChange !== undefined && onChange === undefined);

    const isControlled = value !== undefined;
    const [uncontrolledValue, setUncontrolledValue] = useState<
      number | string | null
    >(() => defaultValue ?? (isDigitsMode ? "" : null));
    const rawCurrentValue = isControlled ? value : uncontrolledValue;

    const currentDigits =
      typeof rawCurrentValue === "string"
        ? sanitizeIntegerInput(rawCurrentValue)
        : rawCurrentValue != null && Number.isFinite(rawCurrentValue)
          ? Math.abs(Math.trunc(rawCurrentValue)).toString()
          : "";

    const isNegativeNumber =
      typeof rawCurrentValue === "number" &&
      Number.isFinite(rawCurrentValue) &&
      rawCurrentValue < 0;

    const safeNumericValue =
      typeof rawCurrentValue === "number"
        ? Number.isFinite(rawCurrentValue)
          ? rawCurrentValue
          : null
        : currentDigits === ""
          ? null
          : Number.isSafeInteger(Number(currentDigits))
            ? Number(currentDigits)
            : null;

    const inputRef = useRef<HTMLInputElement | null>(null);
    const pendingCaretRef = useRef<number | null>(null);

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

    const applyPendingCaret = useCallback(() => {
      const caretDigits = pendingCaretRef.current;
      if (caretDigits === null) {
        return;
      }
      pendingCaretRef.current = null;
      const el = inputRef.current;
      if (!el) {
        return;
      }
      const pos = indexAfterDigits(el.value, caretDigits);
      el.setSelectionRange(pos, pos);
    }, []);

    useIsomorphicLayoutEffect(() => {
      applyPendingCaret();
    });

    // Min / max validation
    let isInvalid = false;
    let errorMessage: string | null = null;

    if (typeof rawCurrentValue === "string") {
      if (currentDigits !== "") {
        if (
          min !== undefined &&
          Number.isFinite(min) &&
          compareDigitString(currentDigits, min) < 0
        ) {
          isInvalid = true;
          const minDisplay = formatAmount(min, isFa);
          errorMessage = isFa
            ? `مبلغ نمی‌تواند کمتر از ${minDisplay}${resolvedUnit ? ` ${resolvedUnit}` : ""} باشد`
            : `Amount must be at least ${minDisplay}${resolvedUnit ? ` ${resolvedUnit}` : ""}`;
        } else if (
          max !== undefined &&
          Number.isFinite(max) &&
          compareDigitString(currentDigits, max) > 0
        ) {
          isInvalid = true;
          const maxDisplay = formatAmount(max, isFa);
          errorMessage = isFa
            ? `مبلغ نمی‌تواند بیشتر از ${maxDisplay}${resolvedUnit ? ` ${resolvedUnit}` : ""} باشد`
            : `Amount cannot exceed ${maxDisplay}${resolvedUnit ? ` ${resolvedUnit}` : ""}`;
        }
      }
    } else if (rawCurrentValue != null && Number.isFinite(rawCurrentValue)) {
      if (min !== undefined && rawCurrentValue < min) {
        isInvalid = true;
        const minDisplay = formatAmount(min, isFa);
        errorMessage = isFa
          ? `مبلغ نمی‌تواند کمتر از ${minDisplay}${resolvedUnit ? ` ${resolvedUnit}` : ""} باشد`
          : `Amount must be at least ${minDisplay}${resolvedUnit ? ` ${resolvedUnit}` : ""}`;
      } else if (max !== undefined && rawCurrentValue > max) {
        isInvalid = true;
        const maxDisplay = formatAmount(max, isFa);
        errorMessage = isFa
          ? `مبلغ نمی‌تواند بیشتر از ${maxDisplay}${resolvedUnit ? ` ${resolvedUnit}` : ""} باشد`
          : `Amount cannot exceed ${maxDisplay}${resolvedUnit ? ` ${resolvedUnit}` : ""}`;
      }
    }

    const displayValue =
      typeof rawCurrentValue === "string"
        ? formatDigits(currentDigits, isFa)
        : formatAmount(rawCurrentValue, isFa);
    const displayPlaceholder =
      placeholder !== undefined
        ? isFa
          ? persianizeDigits(placeholder)
          : placeholder
        : undefined;

    const commitDigits = useCallback(
      (nextDigits: string, digitCaret: number | null) => {
        if (digitCaret !== null) {
          pendingCaretRef.current = digitCaret;
        }
        const nextNumber =
          nextDigits === "" ? null : Number.parseInt(nextDigits, 10);

        if (!isControlled) {
          setUncontrolledValue(isDigitsMode ? nextDigits : nextNumber);
        }
        onValueChange?.(nextDigits);
        onChange?.(nextNumber);

        if (digitCaret !== null) {
          if (nextDigits === currentDigits && !isNegativeNumber) {
            queueMicrotask(() => {
              applyPendingCaret();
            });
          } else {
            requestAnimationFrame(() => {
              applyPendingCaret();
            });
          }
        }
      },
      [
        applyPendingCaret,
        currentDigits,
        isControlled,
        isDigitsMode,
        isNegativeNumber,
        onChange,
        onValueChange,
      ],
    );

    const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
      const el = event.currentTarget;
      const raw = el.value;
      const caret = el.selectionStart ?? raw.length;
      const nextDigits = sanitizeIntegerInput(raw);
      commitDigits(nextDigits, digitsBefore(raw, caret));
    };

    const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
      onKeyDown?.(event);
      if (event.defaultPrevented || isNegativeNumber || props.readOnly) {
        return;
      }
      const el = event.currentTarget;
      const start = el.selectionStart ?? 0;
      const collapsed = start === (el.selectionEnd ?? 0);
      if (!collapsed) {
        return;
      }
      // Backspace or Delete on a grouping mark removes the adjacent digit
      // in one keystroke instead of only moving the caret past the separator.
      if (
        event.key === "Backspace" &&
        start > 0 &&
        isGroupingMark(displayValue.charAt(start - 1))
      ) {
        event.preventDefault();
        const at = digitsBefore(displayValue, start) - 1;
        if (at >= 0) {
          commitDigits(removeDigitAt(currentDigits, at), at);
        }
      } else if (
        event.key === "Delete" &&
        start < displayValue.length &&
        isGroupingMark(displayValue.charAt(start))
      ) {
        event.preventDefault();
        const at = digitsBefore(displayValue, start);
        if (at < currentDigits.length) {
          commitDigits(removeDigitAt(currentDigits, at), at);
        }
      }
    };

    const handleSelectQuick = (q: number) => {
      if (disabled) return;
      const qDigits = Math.abs(Math.trunc(q)).toString();
      if (!isControlled) {
        setUncontrolledValue(isDigitsMode ? qDigits : q);
      }
      onValueChange?.(qDigits);
      onChange?.(q);
      inputRef.current?.focus();
    };

    const handleCopy = (event: React.ClipboardEvent<HTMLInputElement>) => {
      onCopy?.(event);
      if (event.defaultPrevented) {
        return;
      }
      const el = event.currentTarget;
      const start = el.selectionStart ?? 0;
      const end = el.selectionEnd ?? 0;
      const selection = displayValue.slice(start, end);
      const plain =
        start === end || !selection
          ? isNegativeNumber && rawCurrentValue != null
            ? String(rawCurrentValue)
            : currentDigits
          : isNegativeNumber && start === 0
            ? `-${sanitizeIntegerInput(selection)}`
            : currentDigits.slice(
                digitsBefore(displayValue, start),
                digitsBefore(displayValue, end),
              );
      if (plain) {
        event.preventDefault();
        event.clipboardData?.setData("text/plain", plain);
      }
    };

    const wordsText =
      showWords && safeNumericValue != null
        ? amountToWords(safeNumericValue, resolvedUnit)
        : null;

    const defaultAriaLabel = isFa ? "مبلغ" : "Amount";
    const ariaLabel = ariaLabelProp ?? defaultAriaLabel;

    const externalInvalid =
      ariaInvalidProp === true || ariaInvalidProp === "true";
    const effectiveInvalid = isInvalid || externalInvalid;

    const describedByIds: string[] = [];
    if (ariaDescribedByProp) describedByIds.push(ariaDescribedByProp);
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
            fieldControlVariants({
              size,
              state: resolveFieldState({
                disabled,
                readOnly: props.readOnly,
                invalid: effectiveInvalid,
              }),
              adornment: "none",
            }),
            "relative flex items-center gap-2",
          )}
        >
          <input
            ref={setRefs}
            id={inputId}
            type="text"
            inputMode="numeric"
            dir="ltr"
            spellCheck={false}
            value={displayValue}
            placeholder={displayPlaceholder}
            disabled={disabled}
            aria-invalid={effectiveInvalid ? "true" : undefined}
            aria-label={ariaLabel}
            aria-describedby={ariaDescribedBy}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            onCopy={handleCopy}
            className="h-full w-full min-w-0 bg-transparent border-0 p-0 text-start font-[family-name:var(--font-data)] tracking-[-0.02em] shadow-none outline-hidden focus:outline-hidden placeholder:text-muted-foreground disabled:cursor-not-allowed selection:bg-primary selection:text-primary-foreground"
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
              const isSelected =
                typeof rawCurrentValue === "string"
                  ? currentDigits === Math.abs(Math.trunc(q)).toString()
                  : rawCurrentValue === q;
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
                    "focus-visible:outline-hidden focus-visible:ring-1 focus-visible:ring-ring",
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

"use client";

import type { ComponentPropsWithoutRef } from "react";
import { forwardRef } from "react";

import { Badge } from "../badge.js";
import { LockIcon } from "../icons.js";
import { Input } from "../input.js";
import {
  persianizeDigits,
  sanitizeDecimalInput,
  sanitizeIntegerInput,
  toLatinDigits,
} from "../lib/numeric.js";
import { cn } from "../lib/utils.js";

export type DecimalInputProps = Omit<
  ComponentPropsWithoutRef<"input">,
  "value" | "onChange" | "type" | "inputMode"
> & {
  /** Canonical Latin numeric string. */
  value: string;
  /** Emits sanitized Latin digits on every change. */
  onValueChange: (value: string) => void;
  /** When true, only integer digits are permitted (no decimal dot). Default false. */
  integer?: boolean;
  /** Allow leading minus sign. Default false. */
  allowNegative?: boolean;
  /** Optional badge label rendered at the end of the input (e.g. "kg", "g", "toman"). */
  unitLabel?: string;
  /** Decorative lock icon indicating auto-derived value. Does not block editing. */
  autoLocked?: boolean;
  /** Extra classes for the lock icon. */
  lockClassName?: string;
  /** Optional container class name. */
  wrapperClassName?: string;
  /** Optional locale. Defaults to Persian digits unless an explicit non-Persian locale is passed. */
  locale?: string;
};

/**
 * Numeric input for Persian UI: displays Persian digits while storing Latin digits
 * for clean state / API payloads. Text direction is enforced as LTR so digits
 * format consistently even in RTL layouts.
 */
export const DecimalInput = forwardRef<HTMLInputElement, DecimalInputProps>(
  function DecimalInput(
    {
      value,
      onValueChange,
      integer = false,
      allowNegative = false,
      unitLabel,
      autoLocked = false,
      lockClassName,
      wrapperClassName,
      locale,
      className,
      placeholder,
      onCopy,
      ...props
    },
    ref,
  ) {
    const isPersian = !locale || locale.toLowerCase().startsWith("fa");
    const displayValue = isPersian ? persianizeDigits(value) : value;
    const displayPlaceholder =
      placeholder != null
        ? isPersian
          ? persianizeDigits(String(placeholder))
          : String(placeholder)
        : undefined;

    const endPaddingClass =
      unitLabel && autoLocked
        ? "pe-20"
        : unitLabel
          ? "pe-16"
          : autoLocked
            ? "pe-9"
            : undefined;

    return (
      <div
        dir="ltr"
        className={cn("relative w-full", wrapperClassName)}
        data-slot="decimal-input-wrapper"
      >
        <Input
          ref={ref}
          type="text"
          inputMode={integer ? "numeric" : "decimal"}
          dir="ltr"
          spellCheck={false}
          className={cn(
            "font-[family-name:var(--font-data)] tracking-[-0.02em] text-start",
            endPaddingClass,
            className,
          )}
          value={displayValue}
          placeholder={displayPlaceholder}
          onChange={(event) => {
            const next = integer
              ? sanitizeIntegerInput(event.target.value)
              : sanitizeDecimalInput(event.target.value, { allowNegative });
            onValueChange(next);
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
        {(unitLabel || autoLocked) && (
          <div
            className="pointer-events-none absolute end-2.5 top-1/2 -translate-y-1/2 flex items-center gap-1.5"
            data-slot="decimal-input-adornments"
          >
            {unitLabel && (
              <Badge
                variant="secondary"
                data-slot="unit-label"
                data-testid="unit-label"
                className="select-none text-xs font-normal"
              >
                {unitLabel}
              </Badge>
            )}
            {autoLocked && (
              <span
                className={cn("text-muted-foreground", lockClassName)}
                aria-hidden="true"
                data-slot="lock-icon"
                data-testid="lock-icon"
              >
                <LockIcon className="size-4" />
              </span>
            )}
          </div>
        )}
      </div>
    );
  },
);

DecimalInput.displayName = "DecimalInput";

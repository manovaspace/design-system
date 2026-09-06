import type { ComponentPropsWithoutRef } from "react";

import { toLatinDigits, toLocaleDigits } from "../lib/locale-digits.js";
import { cn } from "../lib/utils.js";

export type DataValueProps = Omit<
  ComponentPropsWithoutRef<"span">,
  "children"
> & {
  value: number | bigint | string;
  locale?: string;
  format?: Intl.NumberFormatOptions;
};

export function formatDataValue(
  value: DataValueProps["value"],
  locale: string,
  format?: Intl.NumberFormatOptions,
): string {
  if (typeof value === "string") {
    return toLocaleDigits(value, locale);
  }

  return new Intl.NumberFormat(locale, {
    useGrouping: true,
    ...format,
  }).format(value);
}

/** Locale-aware numeric readout. Input/API state remains canonical Latin data. */
export function DataValue({
  value,
  locale = "en-US",
  format,
  className,
  dir = "ltr",
  ...props
}: DataValueProps) {
  return (
    <span
      data-locale-value={locale}
      dir={dir}
      className={cn(
        "font-[family-name:var(--font-data)] tabular-nums",
        className,
      )}
      {...props}
    >
      {formatDataValue(value, locale, format)}
    </span>
  );
}

export type PhoneNumberProps = Omit<
  ComponentPropsWithoutRef<"span">,
  "children"
> & {
  value: string;
  locale?: string;
};

/** Display-only phone value; callers keep the canonical value in Latin digits. */
export function PhoneNumber({
  value,
  locale = "en-US",
  className,
  ...props
}: PhoneNumberProps) {
  const canonicalValue = toLatinDigits(value);

  return (
    <span
      data-locale-phone={locale}
      dir="ltr"
      className={cn(
        "font-[family-name:var(--font-data)] tracking-[0.02em]",
        className,
      )}
      {...props}
    >
      {toLocaleDigits(canonicalValue, locale)}
    </span>
  );
}

export type FieldMessageProps = ComponentPropsWithoutRef<"p"> & {
  variant?: "error" | "success" | "info";
};

/** Accessible field-level feedback for form error/success/info states. */
export function FieldMessage({
  variant = "error",
  className,
  ...props
}: FieldMessageProps) {
  return (
    <p
      role={variant === "error" ? "alert" : "status"}
      aria-live={variant === "error" ? "assertive" : "polite"}
      data-variant={variant}
      className={cn(
        "rounded-md px-3 py-2 text-[length:var(--font-size-caption)]",
        variant === "error" && "bg-destructive/10 text-destructive",
        variant === "success" && "bg-primary/10 text-primary",
        variant === "info" && "bg-muted text-muted-foreground",
        className,
      )}
      {...props}
    />
  );
}

import type { ComponentPropsWithoutRef } from "react";

import { toLatinDigits, toLocaleDigits } from "../lib/locale-digits.js";
import { cn } from "../lib/utils.js";

export type DataValueProps = ComponentPropsWithoutRef<"span"> & {
  value?: number | bigint | string;
  locale?: string;
  format?: Intl.NumberFormatOptions;
  unit?: string;
  unitPosition?: "prefix" | "suffix";
  copyable?: boolean;
  tabular?: boolean;
  copyValue?: string;
};

export function formatDataValue(
  value: number | bigint | string,
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
  children,
  locale = "en-US",
  format,
  unit,
  unitPosition = "suffix",
  copyable = false,
  tabular = false,
  copyValue,
  className,
  dir = "ltr",
  onClick,
  onCopy,
  ...props
}: DataValueProps) {
  const formatted =
    value !== undefined ? formatDataValue(value, locale, format) : children;

  const handleCopy = (e: React.ClipboardEvent<HTMLSpanElement>) => {
    if (copyValue && e.clipboardData) {
      e.preventDefault();
      e.clipboardData.setData("text/plain", copyValue);
    }
    onCopy?.(e);
  };

  if (copyable) {
    const handleButtonClick = (e: React.MouseEvent<HTMLButtonElement>) => {
      if (typeof navigator !== "undefined" && navigator.clipboard) {
        const textToCopy =
          copyValue ?? toLatinDigits(String(value ?? children ?? ""));
        navigator.clipboard.writeText(textToCopy);
      }
      onClick?.(e as unknown as React.MouseEvent<HTMLSpanElement>);
    };

    return (
      <button
        type="button"
        data-locale-value={locale}
        data-copyable="true"
        dir={dir}
        onClick={handleButtonClick}
        className={cn(
          "font-[family-name:var(--font-data)] tabular-nums cursor-pointer hover:underline inline-flex items-baseline gap-1 bg-transparent border-none p-0 text-inherit text-start",
          className,
        )}
        {...(props as unknown as ComponentPropsWithoutRef<"button">)}
      >
        {unit && unitPosition === "prefix" ? (
          <span className="text-xs font-sans text-muted-foreground">
            {unit}
          </span>
        ) : null}
        {formatted}
        {unit && unitPosition === "suffix" ? (
          <span className="text-xs font-sans text-muted-foreground">
            {unit}
          </span>
        ) : null}
      </button>
    );
  }

  return (
    <span
      data-locale-value={locale}
      dir={dir}
      className={cn(
        "font-[family-name:var(--font-data)]",
        tabular && "tabular-nums",
        unit && "inline-flex items-baseline gap-1",
        className,
      )}
      onCopy={handleCopy}
      {...props}
    >
      {unit && unitPosition === "prefix" ? (
        <span className="text-xs font-sans text-muted-foreground">{unit}</span>
      ) : null}
      {formatted}
      {unit && unitPosition === "suffix" ? (
        <span className="text-xs font-sans text-muted-foreground">{unit}</span>
      ) : null}
    </span>
  );
}

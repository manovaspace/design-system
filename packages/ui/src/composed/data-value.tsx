"use client";

import {
  type ClipboardEvent,
  type ComponentProps,
  Fragment,
  useCallback,
} from "react";

import { useDirection } from "../direction-provider";
import {
  normalizeClipboardNumeric,
  writeLatinClipboard,
} from "../lib/latin-digits";
import { cn } from "../lib/utils";

/** Persian comma, Arabic thousands separator, ASCII comma. */
const GROUPING_SEPARATOR = /([،٬,\u066C])/;

/** Leading digit run (Latin or Persian/Arabic-Indic, optional dot). */
const LEADING_DIGITS = /^([\d۰-۹٠-٩.]+)([\s\S]*)$/;

function isGroupingSeparator(part: string): boolean {
  return GROUPING_SEPARATOR.test(part);
}

/** Digit runs only — Latin or Persian/Arabic-Indic, optional dot for decimals. */
function isDigitRun(part: string): boolean {
  return /^[\d۰-۹٠-٩.]+$/.test(part);
}

function splitLeadingDigits(
  part: string,
): { digits: string; rest: string } | null {
  const match = part.match(LEADING_DIGITS);
  const digits = match?.[1];
  const rest = match?.[2];
  if (!digits || !rest) {
    return null;
  }
  return { digits, rest };
}

export type DataValueProps = ComponentProps<"span"> & {
  children: string;
  /**
   * Equal-width digits for phones, IDs, pagination, and row indices.
   * Keep off for grouped money/weight (commas need proportional spacing).
   */
  tabular?: boolean;
  /**
   * Canonical Latin value for copy/select (e.g. `09123456789`, `5000000`).
   * When set, copy always writes this string; otherwise the selection is
   * Persian-to-Latin normalized (grouping stripped).
   */
  copyValue?: string;
};

/**
 * Data-layer readout — Vazirmatn (`--font-data`) for values users compare,
 * copy, or verify: amounts, phones, dates, IDs, counts, and metrics.
 * Prose labels stay on Estedad (`--font-prose` / body).
 */
export function DataValue({
  children,
  className,
  copyValue,
  tabular = false,
  onCopy,
  ...props
}: DataValueProps) {
  const direction = useDirection();
  const parts = children.split(GROUPING_SEPARATOR).filter(Boolean);

  const handleCopy = useCallback(
    (event: ClipboardEvent<HTMLSpanElement>) => {
      if (copyValue) {
        writeLatinClipboard(event, copyValue);
      } else {
        const selection = window.getSelection()?.toString() ?? "";
        if (selection) {
          writeLatinClipboard(event, normalizeClipboardNumeric(selection));
        }
      }
      onCopy?.(event);
    },
    [copyValue, onCopy],
  );

  return (
    <span
      dir={direction}
      className={cn(
        "mnv-data gst-data inline-block text-start",
        tabular && "mnv-data--tabular gst-data--tabular",
        className,
      )}
      onCopy={handleCopy}
      {...props}
    >
      {(() => {
        let offset = 0;
        return parts.map((part) => {
          const key = `${offset}:${part}`;
          offset += part.length;
          if (isGroupingSeparator(part)) {
            return (
              <span
                key={key}
                className="mnv-data__sep gst-data__sep"
                aria-hidden="true"
              >
                {part}
              </span>
            );
          }
          if (isDigitRun(part)) {
            return (
              <span key={key} className="mnv-data__digits gst-data__digits">
                {part}
              </span>
            );
          }
          const split = splitLeadingDigits(part);
          if (split) {
            return (
              <Fragment key={key}>
                <span className="mnv-data__digits gst-data__digits">
                  {split.digits}
                </span>
                <span>{split.rest}</span>
              </Fragment>
            );
          }
          return <span key={key}>{part}</span>;
        });
      })()}
    </span>
  );
}

/** Alias for backward compatibility. */
export const GstNumeric = DataValue;
export const MnvNumeric = DataValue;

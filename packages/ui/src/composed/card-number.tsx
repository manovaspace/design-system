"use client";

import {
  type ReactNode,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import { CheckIcon, ClipboardDocumentIcon } from "../icons.js";
import {
  formatCardCopy,
  formatCardDisplay,
  isValidIranBankCard,
} from "../lib/card.js";
import { copyTextToClipboardSync } from "../lib/clipboard.js";
import { cn } from "../lib/utils.js";
import { DataValue } from "./data-value.js";

export type CardNumberVariant = "copy" | "static";

export type CardNumberLabels = {
  copy: string;
  copied: string;
};

export type CardNumberProps = {
  /** Canonical or display-formatted 16-digit Iranian bank card number. */
  cardNumber: string;
  labels: CardNumberLabels;
  variant?: CardNumberVariant;
  showIcon?: boolean | "always" | "hover" | "never";
  icon?: ReactNode;
  /** Prevent row-click handlers in data tables. */
  stopPropagation?: boolean;
  className?: string;
};

function CardFigure({
  display,
  copyValue,
  className,
}: {
  display: string;
  copyValue: string;
  className?: string;
}) {
  return (
    <DataValue
      tabular
      dir="ltr"
      copyValue={copyValue}
      className={cn(
        "inline-flex items-center leading-none font-semibold",
        className,
      )}
    >
      {display}
    </DataValue>
  );
}

function resolveIconVisibility(
  showIcon: CardNumberProps["showIcon"],
): "always" | "hover" | "never" {
  if (showIcon === true || showIcon === "always") {
    return "always";
  }
  if (showIcon === false || showIcon === "never") {
    return "never";
  }
  return "hover";
}

function CardIconAffordance({
  visible,
  copied,
  customIcon,
}: {
  visible: "always" | "hover" | "never";
  copied: boolean;
  customIcon?: ReactNode;
}) {
  if (visible === "never") {
    return null;
  }

  return (
    <span
      className={cn(
        "inline-flex size-4 shrink-0 translate-y-[0.08em] items-center justify-center self-center text-muted-foreground transition-opacity",
        visible === "hover" &&
          "opacity-50 group-hover/card-number:opacity-100 group-focus-visible/card-number:opacity-100",
        copied && "text-foreground opacity-100",
      )}
      aria-hidden="true"
    >
      {customIcon ??
        (copied ? (
          <CheckIcon className="size-3.5" />
        ) : (
          <ClipboardDocumentIcon className="size-3.5" />
        ))}
    </span>
  );
}

const triggerClassName = cn(
  "group/card-number inline-flex items-center gap-1 leading-none",
  "rounded-[var(--radius-md)] px-1.5 py-0.5 -mx-1.5",
  "transition-colors",
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50",
);

/**
 * Iranian bank-card readout with grouped Persian digits and Latin copy.
 * Display uses Vazirmatn tabular data typography; clipboard uses 16 Latin digits.
 */
export function CardNumber({
  cardNumber,
  labels,
  variant = "copy",
  showIcon = "hover",
  icon,
  stopPropagation = false,
  className,
}: CardNumberProps) {
  const [copied, setCopied] = useState(false);
  const resetCopiedRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const valid = isValidIranBankCard(cardNumber);
  const display = useMemo(() => formatCardDisplay(cardNumber), [cardNumber]);
  const copyValue = useMemo(() => formatCardCopy(cardNumber), [cardNumber]);
  const iconVisibility = resolveIconVisibility(showIcon);

  useEffect(() => {
    return () => {
      if (resetCopiedRef.current) {
        clearTimeout(resetCopiedRef.current);
      }
    };
  }, []);

  const copyToClipboard = useCallback(() => {
    if (!copyValue || !copyTextToClipboardSync(copyValue)) {
      return;
    }
    setCopied(true);
    if (resetCopiedRef.current) {
      clearTimeout(resetCopiedRef.current);
    }
    resetCopiedRef.current = setTimeout(() => setCopied(false), 2000);
  }, [copyValue]);

  function stopIfNeeded(event: { stopPropagation: () => void }) {
    if (stopPropagation) {
      event.stopPropagation();
    }
  }

  if (!valid) {
    return (
      <span
        className={cn(
          "inline-flex items-center text-muted-foreground",
          className,
        )}
      >
        —
      </span>
    );
  }

  if (variant === "static") {
    return (
      <span className={cn("inline-flex items-center", className)}>
        <CardFigure display={display} copyValue={copyValue} />
      </span>
    );
  }

  return (
    <button
      type="button"
      className={cn(
        triggerClassName,
        "cursor-copy hover:bg-muted/70 active:bg-muted",
        className,
      )}
      aria-label={copied ? labels.copied : labels.copy}
      onClick={(event) => {
        stopIfNeeded(event);
        copyToClipboard();
      }}
      onPointerDown={stopIfNeeded}
    >
      <CardFigure display={display} copyValue={copyValue} />
      <CardIconAffordance
        visible={iconVisibility}
        copied={copied}
        customIcon={icon}
      />
    </button>
  );
}

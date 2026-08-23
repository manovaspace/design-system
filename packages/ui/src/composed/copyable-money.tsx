"use client";

import {
  type ReactNode,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";

import { CheckIcon, ClipboardDocumentIcon } from "../icons";
import { copyTextToClipboard } from "../lib/clipboard";
import { cn } from "../lib/utils";
import { DataValue } from "./data-value";

export type CopyableMoneyProps = {
  /** Raw amount — copied as plain digits without separators when copiable. */
  value: number;
  /** Locale-formatted display (fa-IR grouping + Persian digits). */
  display: string;
  /** Accessible label before copy succeeds (copiable only). */
  copyLabel: string;
  /** Accessible label after copy succeeds (copiable only). */
  copiedLabel: string;
  /** When false, renders plain DataValue with no copy action. Default true. */
  copiable?: boolean;
  /** Clipboard icon affordance. Default true. Ignored when copiable is false. */
  showIcon?: boolean;
  className?: string;
  numericClassName?: string;
};

type ResolvedCopyableMoneyOptions = {
  copiable: boolean;
  showIcon: boolean;
};

function resolveCopyableMoneyOptions(
  copiable: boolean,
  showIcon: boolean,
): ResolvedCopyableMoneyOptions {
  if (!copiable && showIcon) {
    if (process.env.NODE_ENV !== "production") {
      console.warn(
        "CopyableMoney: showIcon is ignored when copiable is false — icon hidden.",
      );
    }
    return { copiable: false, showIcon: false };
  }
  return { copiable, showIcon };
}

/** Plain integer string for clipboard — no grouping separators. */
function plainIntegerCopy(value: number): string {
  if (!Number.isFinite(value)) {
    return "";
  }
  return String(Math.trunc(value));
}

/**
 * Money figure with DataValue typography and optional tap-to-copy.
 * Display keeps fa-IR grouping; clipboard gets raw digits only.
 */
export function CopyableMoney({
  value,
  display,
  copyLabel,
  copiedLabel,
  copiable = true,
  showIcon = true,
  className,
  numericClassName,
}: CopyableMoneyProps) {
  const { copiable: isCopiable, showIcon: iconVisible } =
    resolveCopyableMoneyOptions(copiable, showIcon);

  const [copied, setCopied] = useState(false);
  const resetCopiedRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (resetCopiedRef.current) {
        clearTimeout(resetCopiedRef.current);
      }
    };
  }, []);

  const copy = useCallback(async () => {
    const plain = plainIntegerCopy(value);
    if (!plain) {
      return;
    }
    const ok = await copyTextToClipboard(plain);
    if (!ok) {
      return;
    }
    setCopied(true);
    if (resetCopiedRef.current) {
      clearTimeout(resetCopiedRef.current);
    }
    resetCopiedRef.current = setTimeout(() => setCopied(false), 2000);
  }, [value]);

  const figure = (
    <DataValue className={cn("font-medium", numericClassName)}>
      {display}
    </DataValue>
  );

  if (!isCopiable) {
    return (
      <span className={cn("inline-flex items-center", className)}>
        {figure}
      </span>
    );
  }

  return (
    <button
      type="button"
      onClick={() => void copy()}
      className={cn(
        "copyable-money group/copyable-money inline-flex items-center gap-1.5",
        "rounded-[var(--radius-md)] px-1.5 py-0.5 -mx-1.5",
        "cursor-copy transition-colors",
        "hover:bg-muted/70 active:bg-muted",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50",
        className,
      )}
      aria-label={copied ? copiedLabel : copyLabel}
    >
      {figure}
      {iconVisible ? (
        <span
          className={cn(
            "inline-flex shrink-0 text-muted-foreground transition-opacity",
            copied
              ? "text-foreground opacity-100"
              : "opacity-50 group-hover/copyable-money:opacity-100 group-focus-visible/copyable-money:opacity-100",
          )}
          aria-hidden="true"
        >
          {copied ? (
            <CheckIcon className="size-3.5" />
          ) : (
            <ClipboardDocumentIcon className="size-3.5" />
          )}
        </span>
      ) : null}
    </button>
  );
}

export type CopyableMoneyLineProps = CopyableMoneyProps & {
  lead?: ReactNode;
  trail?: ReactNode;
  lineClassName?: string;
};

/** Inline price line — quiet label, optional copyable figure, optional suffix. */
export function CopyableMoneyLine({
  lead,
  trail,
  lineClassName,
  ...moneyProps
}: CopyableMoneyLineProps) {
  return (
    <span
      className={cn(
        "inline-flex flex-wrap items-center justify-center gap-x-1",
        lineClassName,
      )}
    >
      {lead ? <span>{lead}</span> : null}
      <CopyableMoney {...moneyProps} />
      {trail ? <span>{trail}</span> : null}
    </span>
  );
}

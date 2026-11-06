"use client";

import type * as React from "react";

import { persianizeDigits } from "../lib/numeric.js";
import { cn } from "../lib/utils.js";

export type StatProps = {
  label: React.ReactNode;
  value: React.ReactNode;
  description?: React.ReactNode;
  delta?: {
    value: number;
    label?: string; // e.g. "vs last month"
    trend?: "up" | "down" | "neutral";
  };
  icon?: React.ReactNode;
  locale?: string;
  className?: string;
};

function UpTrendIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <polyline points="22 7 13.5 15.5 8.5 10.5 2 17" />
      <polyline points="16 7 22 7 22 13" />
    </svg>
  );
}

function DownTrendIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <polyline points="22 17 13.5 8.5 8.5 13.5 2 7" />
      <polyline points="16 17 22 17 22 11" />
    </svg>
  );
}

function NeutralTrendIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <line x1="5" y1="12" x2="19" y2="12" />
    </svg>
  );
}

/**
 * Executive metric card displaying high-level KPI figures, trend badges,
 * and contextual descriptions with full RTL and Persian number formatting.
 */
export function Stat({
  label,
  value,
  description,
  delta,
  icon,
  locale,
  className,
}: StatProps) {
  const isFa = !locale || locale.toLowerCase().startsWith("fa");

  const trend: "up" | "down" | "neutral" = delta
    ? (delta.trend ??
      (delta.value > 0 ? "up" : delta.value < 0 ? "down" : "neutral"))
    : "neutral";

  const formattedValue =
    typeof value === "number"
      ? isFa
        ? persianizeDigits(new Intl.NumberFormat("fa-IR").format(value))
        : new Intl.NumberFormat(locale || "en-US").format(value)
      : value;

  let formattedDelta = "";
  if (delta) {
    const abs = Math.abs(delta.value);
    const absStr = isFa
      ? persianizeDigits(
          new Intl.NumberFormat("fa-IR", {
            maximumFractionDigits: 2,
          }).format(abs),
        )
      : new Intl.NumberFormat(locale || "en-US", {
          maximumFractionDigits: 2,
        }).format(abs);
    const sign = trend === "up" ? "+" : trend === "down" ? "-" : "";
    formattedDelta = `${sign}${absStr}%`;
  }

  return (
    <div
      data-slot="stat"
      className={cn(
        "relative flex flex-col justify-between overflow-hidden rounded-[var(--radius-xl)] border border-border bg-card p-4 sm:p-5 text-card-foreground shadow-xs",
        className,
      )}
    >
      <div className="flex items-center justify-between gap-2">
        <span
          data-slot="stat-label"
          className="text-sm font-medium text-muted-foreground truncate"
        >
          {label}
        </span>
        {icon && (
          <div
            data-slot="stat-icon"
            className="shrink-0 text-muted-foreground flex items-center justify-center [&_svg]:size-5"
          >
            {icon}
          </div>
        )}
      </div>

      <div className="mt-3 flex flex-col gap-1.5">
        <div
          data-slot="stat-value"
          className="text-2xl sm:text-3xl font-semibold tracking-tight text-foreground font-[family-name:var(--font-data)]"
        >
          {formattedValue}
        </div>

        {(delta || description) && (
          <div className="flex flex-wrap items-center gap-2 pt-1 text-xs">
            {delta && (
              <span
                data-slot="stat-delta"
                data-trend={trend}
                className={cn(
                  "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium border",
                  trend === "up" &&
                    "bg-status-success/10 text-status-success border-status-success/20",
                  trend === "down" &&
                    "bg-status-danger/10 text-status-danger border-status-danger/20",
                  trend === "neutral" &&
                    "bg-muted text-muted-foreground border-border",
                )}
              >
                {trend === "up" && <UpTrendIcon className="size-3 shrink-0" />}
                {trend === "down" && (
                  <DownTrendIcon className="size-3 shrink-0" />
                )}
                {trend === "neutral" && (
                  <NeutralTrendIcon className="size-3 shrink-0" />
                )}
                <span>{formattedDelta}</span>
              </span>
            )}
            {delta?.label && (
              <span
                data-slot="stat-delta-label"
                className="text-xs text-muted-foreground"
              >
                {delta.label}
              </span>
            )}
            {description && (
              <span
                data-slot="stat-description"
                className="text-xs text-muted-foreground"
              >
                {description}
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

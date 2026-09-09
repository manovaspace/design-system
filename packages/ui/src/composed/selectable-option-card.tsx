"use client";

import type * as React from "react";

import { CheckIcon } from "../icons.js";
import { cn } from "../lib/utils.js";

export type SelectableOptionCardProps = {
  name: string;
  value: string;
  selected: boolean;
  onSelect: () => void;
  label: React.ReactNode;
  description?: React.ReactNode;
  icon?: React.ReactNode;
  badge?: React.ReactNode;
  showSelectionBadge?: boolean;
  disabled?: boolean;
  id?: string;
  className?: string;
};

/**
 * Mobile-first, tap-friendly selectable option card (radio style).
 */
export function SelectableOptionCard({
  name,
  value,
  selected,
  onSelect,
  label,
  description,
  icon,
  badge,
  showSelectionBadge = true,
  disabled,
  id,
  className,
}: SelectableOptionCardProps) {
  const controlId = id ?? `${name}-${value}`;

  return (
    <label
      htmlFor={controlId}
      aria-disabled={disabled}
      className={cn(
        "relative flex min-h-[52px] w-full cursor-pointer items-center gap-3 rounded-xl border-2 p-3.5 sm:p-4 text-start transition-colors select-none",
        "focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2",
        selected
          ? "border-primary bg-primary/5 shadow-sm"
          : "border-border bg-card hover:border-muted-foreground/30",
        disabled && "cursor-not-allowed opacity-50 pointer-events-none",
        className,
      )}
    >
      <input
        type="radio"
        id={controlId}
        name={name}
        value={value}
        checked={selected}
        disabled={disabled}
        onChange={() => {
          if (!disabled) {
            onSelect();
          }
        }}
        className="sr-only"
      />
      {selected && showSelectionBadge ? (
        <span
          data-testid="selection-badge"
          aria-hidden="true"
          className="absolute -top-2 -start-2 z-10 flex size-5 items-center justify-center rounded-full border-2 border-card bg-primary text-primary-foreground shadow-sm"
        >
          <CheckIcon className="size-3" />
        </span>
      ) : null}
      {icon ? (
        <span className="shrink-0 text-muted-foreground" aria-hidden="true">
          {icon}
        </span>
      ) : null}
      <span className="flex min-w-0 flex-1 flex-col gap-0.5">
        <span className="text-sm font-medium leading-none text-foreground">
          {label}
        </span>
        {description ? (
          <span className="text-xs text-muted-foreground">{description}</span>
        ) : null}
      </span>
      {badge ? <span className="shrink-0">{badge}</span> : null}
    </label>
  );
}

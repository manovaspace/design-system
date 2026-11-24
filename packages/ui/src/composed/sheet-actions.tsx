"use client";

import type * as React from "react";

import { Button } from "../button.js";
import { cn } from "../lib/utils.js";
import { Spinner } from "../spinner.js";

/** Footer action that dismisses or steps back; rendered first, `secondary` variant. */
export type SheetActionsSecondary = {
  label: string;
  onClick: () => void;
  disabled?: boolean;
};

/** Footer action that commits; rendered last. Pending blocks it and shows a spinner. */
export type SheetActionsPrimary = {
  label: string;
  onClick?: () => void;
  /** Defaults to `"button"` so a form is never submitted by accident. */
  type?: "button" | "submit";
  /** Id of the form a `type: "submit"` button submits. */
  form?: string;
  disabled?: boolean;
  pending?: boolean;
};

export type SheetActionsProps = {
  secondary?: SheetActionsSecondary;
  primary: SheetActionsPrimary;
  /** Validation or submit error, rendered above the buttons in `role="alert"`. */
  error?: React.ReactNode;
  /** Control rendered beside `error`, for example a retry button. */
  errorAction?: React.ReactNode;
  /** Marks the error row `aria-busy` while `errorAction` is settling. */
  errorBusy?: boolean;
  className?: string;
};

/**
 * Footer row of a sheet: secondary first, primary last.
 *
 * Usage rules:
 * - Secondary is first in the DOM and uses the `secondary` variant.
 * - Primary is last and is the only default-variant button.
 * - A lone primary takes the full width.
 *
 * @internal
 */
export function SheetActions({
  secondary,
  primary,
  error,
  errorAction,
  errorBusy,
  className,
}: SheetActionsProps) {
  return (
    <div
      data-slot="sheet-actions"
      className={cn(
        "flex flex-col gap-2 border-t border-border bg-background p-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]",
        className,
      )}
    >
      {error ? (
        <div
          role="alert"
          aria-busy={errorBusy || undefined}
          data-slot="sheet-actions-error"
          className="flex w-full items-start justify-between gap-3"
        >
          <p className="min-w-0 flex-1 text-sm font-medium text-destructive">
            {error}
          </p>
          {errorAction}
        </div>
      ) : null}
      <div className="flex gap-2">
        {secondary ? (
          <Button
            type="button"
            variant="secondary"
            className="min-h-11 flex-1"
            disabled={secondary.disabled}
            onClick={secondary.onClick}
          >
            {secondary.label}
          </Button>
        ) : null}
        <Button
          type={primary.type ?? "button"}
          form={primary.form}
          className={cn("min-h-11", secondary ? "flex-[2]" : "flex-1")}
          aria-busy={primary.pending || undefined}
          disabled={primary.disabled || primary.pending}
          onClick={primary.onClick}
        >
          {primary.pending ? <Spinner size="sm" decorative /> : null}
          {primary.label}
        </Button>
      </div>
    </div>
  );
}

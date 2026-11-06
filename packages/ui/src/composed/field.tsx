import type * as React from "react";

import { Label } from "../label.js";
import { cn } from "../lib/utils.js";

export type FieldProps = {
  label?: React.ReactNode;
  htmlFor?: string;
  hint?: React.ReactNode;
  error?: React.ReactNode;
  required?: boolean;
  className?: string;
  children: React.ReactNode;
  id?: string;
};

/**
 * Ergonomic form field layout wrapper for any control or input.
 * Provides accessible label, hint, and error messaging.
 */
export function Field({
  label,
  htmlFor,
  hint,
  error,
  required,
  className,
  children,
  id,
}: FieldProps) {
  const hasError = Boolean(error);
  const hasHint = Boolean(hint && !hasError);

  return (
    <div
      id={id}
      data-slot="field"
      className={cn("grid gap-1.5 text-start w-full", className)}
    >
      {label && (
        <Label htmlFor={htmlFor} data-slot="field-label" className="text-start">
          {label}
          {required && (
            <span className="text-destructive ms-0.5" aria-hidden="true">
              *
            </span>
          )}
        </Label>
      )}
      {children}
      {hasError && (
        <p
          role="alert"
          data-slot="field-error"
          className="text-xs text-destructive text-start"
        >
          {error}
        </p>
      )}
      {hasHint && (
        <p
          data-slot="field-hint"
          className="text-xs text-muted-foreground text-start"
        >
          {hint}
        </p>
      )}
    </div>
  );
}

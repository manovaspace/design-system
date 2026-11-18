import * as React from "react";

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

type ControlProps = {
  id?: string;
  htmlFor?: string;
  "aria-describedby"?: string;
  "aria-invalid"?: boolean | "true" | "false" | "grammar" | "spelling";
};

function mergeIdRefs(existing: string | undefined, next: string): string {
  const tokens = [...(existing ?? "").split(/\s+/), next].filter(Boolean);
  return [...new Set(tokens)].join(" ");
}

/**
 * Ergonomic form field layout wrapper for any control or input.
 * Provides accessible label, hint, and error messaging.
 * Wires id, aria-describedby and aria-invalid onto a single control child.
 * For composite controls (e.g. a Radix Select root), pass the ids to the
 * actual focusable element by hand.
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
  const generatedId = React.useId();
  const hasError = Boolean(error);
  const hasHint = Boolean(hint && !hasError);

  const control =
    React.isValidElement<ControlProps>(children) &&
    children.type !== React.Fragment
      ? children
      : null;

  const controlId = control?.props.id ?? htmlFor ?? generatedId;
  const hintId = `${controlId}-hint`;
  const errorId = `${controlId}-error`;

  let renderedChildren: React.ReactNode = children;
  if (control) {
    const target = hasError ? errorId : hasHint ? hintId : undefined;
    const describedBy = target
      ? mergeIdRefs(control.props["aria-describedby"], target)
      : control.props["aria-describedby"];
    const ariaInvalid =
      control.props["aria-invalid"] ?? (hasError ? true : undefined);

    renderedChildren = React.cloneElement(control, {
      id: controlId,
      "aria-describedby": describedBy,
      "aria-invalid": ariaInvalid,
    });
  }

  const labelFor = control ? controlId : htmlFor;

  return (
    <div
      id={id}
      data-slot="field"
      className={cn("grid gap-1.5 text-start w-full", className)}
    >
      {label && (
        <Label
          htmlFor={labelFor}
          data-slot="field-label"
          className="text-start"
        >
          {label}
          {required && (
            <span className="text-destructive ms-0.5" aria-hidden="true">
              *
            </span>
          )}
        </Label>
      )}
      {renderedChildren}
      {hasError && (
        <p
          id={errorId}
          role="alert"
          data-slot="field-error"
          className="text-xs text-destructive text-start"
        >
          {error}
        </p>
      )}
      {hasHint && (
        <p
          id={hintId}
          data-slot="field-hint"
          className="text-xs text-muted-foreground text-start"
        >
          {hint}
        </p>
      )}
    </div>
  );
}

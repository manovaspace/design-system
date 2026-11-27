import * as React from "react";

import { Label } from "../label.js";
import {
  FieldContext,
  type FieldContextValue,
  isSelectFieldControl,
} from "../lib/field-context.js";
import { cn } from "../lib/utils.js";

export type FieldProps = {
  label?: React.ReactNode;
  htmlFor?: string;
  hint?: React.ReactNode;
  error?: React.ReactNode;
  counter?: React.ReactNode;
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
 * Standard form field layout wrapper for every kit control (`Input`, `Textarea`,
 * `Select`, `Combobox`, `DatePicker`, `WheelDatePicker`, `AmountInput`, `PickerTrigger`).
 * Supports `label`, `required`, `hint`, `error`, and `counter`.
 * Automatically wires `id`, `aria-describedby`, and `aria-invalid` onto single
 * control children and via context onto composite `Select` triggers.
 */
export function Field({
  label,
  htmlFor,
  hint,
  error,
  counter,
  required,
  className,
  children,
  id,
}: FieldProps) {
  const generatedId = React.useId();
  const hasError = Boolean(error);
  const hasHint = Boolean(hint && !hasError);
  const hasCounter = counter != null && counter !== "";

  const control =
    React.isValidElement<ControlProps>(children) &&
    children.type !== React.Fragment
      ? children
      : null;

  const isSelectControl = control ? isSelectFieldControl(control.type) : false;

  const controlId = control?.props.id ?? htmlFor ?? generatedId;
  const hintId = `${controlId}-hint`;
  const errorId = `${controlId}-error`;
  const target = hasError ? errorId : hasHint ? hintId : undefined;

  let renderedChildren: React.ReactNode = children;
  if (control && !isSelectControl) {
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
  const ownerRef = React.useRef<object | null>(null);
  const claim = React.useCallback((owner: object) => {
    if (ownerRef.current === null || ownerRef.current === owner) {
      ownerRef.current = owner;
      return true;
    }
    return false;
  }, []);
  const release = React.useCallback((owner: object) => {
    if (ownerRef.current === owner) ownerRef.current = null;
  }, []);
  const contextValue = React.useMemo<FieldContextValue>(
    () => ({
      id: controlId,
      describedBy: target,
      invalid: hasError,
      claim,
      release,
    }),
    [controlId, target, hasError, claim, release],
  );

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
      <FieldContext.Provider value={contextValue}>
        {renderedChildren}
      </FieldContext.Provider>
      {(hasError || hasHint || hasCounter) && (
        <div className="flex items-baseline justify-between gap-2">
          {hasError ? (
            <p
              id={errorId}
              role="alert"
              data-slot="field-error"
              className="text-xs text-destructive text-start"
            >
              {error}
            </p>
          ) : hasHint ? (
            <p
              id={hintId}
              data-slot="field-hint"
              className="text-xs text-muted-foreground text-start"
            >
              {hint}
            </p>
          ) : null}
          {hasCounter && (
            <span
              data-slot="field-counter"
              className="ms-auto shrink-0 text-xs text-muted-foreground tabular-nums"
            >
              {counter}
            </span>
          )}
        </div>
      )}
    </div>
  );
}

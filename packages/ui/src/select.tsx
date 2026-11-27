"use client";

import * as React from "react";

import { useFieldContextOptional } from "./lib/field-context.js";
import {
  fieldControlVariants,
  resolveFieldState,
} from "./lib/field-control.js";
import { cn } from "./lib/utils.js";
import {
  Select as PrimitiveSelect,
  SelectContent as PrimitiveSelectContent,
  SelectGroup as PrimitiveSelectGroup,
  SelectItem as PrimitiveSelectItem,
  SelectLabel as PrimitiveSelectLabel,
  SelectTrigger as PrimitiveSelectTrigger,
  SelectValue as PrimitiveSelectValue,
} from "./primitives/select.js";

export function Select(props: React.ComponentProps<typeof PrimitiveSelect>) {
  return <PrimitiveSelect {...props} />;
}
// Marks the root so Field can wire its SelectTrigger without importing this module.
Select.fieldControl = "select" as const;

export function SelectTrigger({
  className,
  size = "default",
  id,
  "aria-describedby": ariaDescribedBy,
  "aria-invalid": ariaInvalid,
  ...props
}: React.ComponentProps<typeof PrimitiveSelectTrigger> & {
  size?: "sm" | "default" | "touch";
}) {
  const fieldContext = useFieldContextOptional();
  const [owner] = React.useState(() => ({}));
  // Only the first SelectTrigger in a Field takes the Field id and messages.
  const claimed = fieldContext ? fieldContext.claim(owner) : false;
  const claimFn = fieldContext?.claim;
  const claimRelease = fieldContext?.release;
  React.useEffect(() => {
    if (!claimed || !claimFn || !claimRelease) return;
    // Re-claim on (re)mount: StrictMode runs cleanup then setup again.
    claimFn(owner);
    return () => claimRelease(owner);
  }, [claimed, claimFn, claimRelease, owner]);

  const resolvedId = id ?? (claimed ? fieldContext?.id : undefined);
  const resolvedAriaDescribedBy =
    ariaDescribedBy ?? (claimed ? fieldContext?.describedBy : undefined);
  const resolvedAriaInvalid =
    ariaInvalid ?? (claimed && fieldContext?.invalid ? true : undefined);

  return (
    <PrimitiveSelectTrigger
      id={resolvedId}
      size={size}
      aria-describedby={resolvedAriaDescribedBy}
      aria-invalid={resolvedAriaInvalid}
      className={cn(
        fieldControlVariants({
          size: size === "touch" ? "touch" : "default",
          state: resolveFieldState({
            disabled: props.disabled,
            invalid:
              resolvedAriaInvalid === true || resolvedAriaInvalid === "true",
          }),
          adornment: "none",
        }),
        "w-fit data-[size=default]:h-10",
        size === "sm" && "h-8 text-xs px-2.5",
        className,
      )}
      {...props}
    />
  );
}

export function SelectValue(
  props: React.ComponentProps<typeof PrimitiveSelectValue>,
) {
  return <PrimitiveSelectValue {...props} />;
}

export function SelectContent({
  className,
  ...props
}: React.ComponentProps<typeof PrimitiveSelectContent>) {
  return (
    <PrimitiveSelectContent
      className={cn("rounded-[var(--radius-lg)]", className)}
      {...props}
    />
  );
}

export function SelectItem({
  className,
  ...props
}: React.ComponentProps<typeof PrimitiveSelectItem>) {
  return <PrimitiveSelectItem className={className} {...props} />;
}

export function SelectLabel(
  props: React.ComponentProps<typeof PrimitiveSelectLabel>,
) {
  return <PrimitiveSelectLabel {...props} />;
}

export function SelectGroup(
  props: React.ComponentProps<typeof PrimitiveSelectGroup>,
) {
  return <PrimitiveSelectGroup {...props} />;
}

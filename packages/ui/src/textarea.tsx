import type * as React from "react";

import {
  fieldControlVariants,
  resolveFieldState,
} from "./lib/field-control.js";
import { cn } from "./lib/utils.js";
import { Textarea as PrimitiveTextarea } from "./primitives/textarea.js";

/** @experimental */
export type TextareaProps = React.ComponentProps<typeof PrimitiveTextarea> & {
  size?: "default" | "touch";
};

/** @experimental */
export function Textarea({
  className,
  size = "default",
  ...props
}: TextareaProps) {
  return (
    <PrimitiveTextarea
      className={cn(
        fieldControlVariants({
          size,
          state: resolveFieldState({
            disabled: props.disabled,
            readOnly: props.readOnly,
            invalid:
              props["aria-invalid"] === true ||
              props["aria-invalid"] === "true",
          }),
          adornment: "none",
        }),
        "h-auto py-[var(--space-2)]",
        size === "touch" ? "min-h-24" : "min-h-20",
        className,
      )}
      {...props}
    />
  );
}

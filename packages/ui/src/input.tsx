import type { ComponentProps } from "react";

import { cn } from "./lib/utils.js";
import { Input as PrimitiveInput } from "./primitives/input.js";

export type InputProps = ComponentProps<typeof PrimitiveInput>;

/** Public Input — token radius and touch-friendly height. */
export function Input({ className, ...props }: InputProps) {
  return (
    <PrimitiveInput
      className={cn(
        "h-10 rounded-[var(--radius-lg)] px-[var(--space-3)] text-[length:var(--font-size-body)]",
        className,
      )}
      {...props}
    />
  );
}

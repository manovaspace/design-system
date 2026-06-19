import type { VariantProps } from "class-variance-authority";
import type { ComponentProps } from "react";

import { cn } from "./lib/utils.js";
import {
  buttonVariants,
  Button as PrimitiveButton,
} from "./primitives/button.js";

export type ButtonProps = ComponentProps<typeof PrimitiveButton> &
  VariantProps<typeof buttonVariants>;

/** Public Button — use this in apps, not primitives. */
export function Button({ className, size = "lg", ...props }: ButtonProps) {
  return (
    <PrimitiveButton
      className={cn(
        "rounded-[var(--radius-lg)] font-medium shadow-[var(--shadow-sm)]",
        className,
      )}
      size={size}
      {...props}
    />
  );
}

export { buttonVariants };

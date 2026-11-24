import type { VariantProps } from "class-variance-authority";
import type { ComponentProps } from "react";

import { cn } from "./lib/utils.js";
import {
  buttonVariants,
  Button as PrimitiveButton,
} from "./primitives/button.js";

export type ButtonProps = ComponentProps<typeof PrimitiveButton> &
  VariantProps<typeof buttonVariants>;

/** Variants that render with no drop shadow (text/utility buttons). */
const shadowlessVariants = new Set(["ghost", "link"]);

/** Public Button — use this in apps, not primitives. */
export function Button({
  className,
  size = "lg",
  variant = "default",
  ...props
}: ButtonProps) {
  const hasShadow = !shadowlessVariants.has(variant ?? "default");
  return (
    <PrimitiveButton
      className={cn(
        "rounded-[var(--radius-lg)] font-medium",
        hasShadow && "shadow-[var(--shadow-sm)]",
        className,
      )}
      size={size}
      variant={variant}
      {...props}
    />
  );
}

export { buttonVariants };

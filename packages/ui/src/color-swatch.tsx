import { cva, type VariantProps } from "class-variance-authority";
import type * as React from "react";

import { cn } from "./lib/utils.js";

const colorSwatchVariants = cva("shrink-0 border border-border", {
  variants: {
    size: {
      xs: "size-2.5 rounded-[2px]",
      sm: "size-4 rounded-md",
      md: "size-7 rounded-md",
      lg: "size-9 rounded-lg",
      bar: "h-5 w-full rounded-md",
    },
  },
  defaultVariants: {
    size: "md",
  },
});

export type ColorSwatchProps = React.ComponentProps<"span"> &
  VariantProps<typeof colorSwatchVariants> & {
    /** CSS variable name without leading `--`, e.g. `mnv-primary-500`. */
    token?: string;
    /** Resolved hex/rgb for editor previews. */
    value?: string;
  };

/** Read-only color preview using a token variable or resolved value. */
export function ColorSwatch({
  token,
  value,
  size,
  className,
  style,
  title,
  ...props
}: ColorSwatchProps) {
  const backgroundColor = token ? `var(--${token})` : value;

  return (
    <span
      data-slot="color-swatch"
      className={cn(colorSwatchVariants({ size }), className)}
      style={{ backgroundColor, ...style }}
      title={title ?? value ?? token}
      {...props}
    />
  );
}

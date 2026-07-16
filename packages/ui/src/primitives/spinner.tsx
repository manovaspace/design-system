"use client";

import { cva, type VariantProps } from "class-variance-authority";
import { Loader2 } from "lucide-react";
import type * as React from "react";

import { cn } from "../lib/utils.js";

const spinnerVariants = cva(
  "animate-spin motion-reduce:animate-none",
  {
    variants: {
      size: {
        sm: "size-4",
        md: "size-6",
        lg: "size-8",
      },
    },
    defaultVariants: {
      size: "md",
    },
  },
);

type SpinnerProps = React.ComponentProps<typeof Loader2> &
  VariantProps<typeof spinnerVariants> & {
    label?: string;
    /** When true, hides from assistive tech (parent provides status). */
    decorative?: boolean;
  };

/** shadcn/ui spinner — Loader2 + animate-spin. */
function Spinner({
  className,
  size,
  label = "Loading",
  decorative = false,
  ...props
}: SpinnerProps) {
  return (
    <Loader2
      data-slot="spinner"
      role={decorative ? undefined : "status"}
      aria-label={decorative ? undefined : label}
      aria-hidden={decorative ? true : undefined}
      className={cn(spinnerVariants({ size }), className)}
      {...props}
    />
  );
}

export { Spinner, spinnerVariants };

"use client";

import { cva, type VariantProps } from "class-variance-authority";
import type * as React from "react";

import { cn } from "./lib/utils.js";

const alertVariants = cva(
  "relative w-full rounded-[var(--radius-lg)] border p-4 text-start",
  {
    variants: {
      variant: {
        default: "border-border bg-background text-foreground",
        success:
          "border-[color-mix(in_oklab,var(--primary)_35%,var(--border))] bg-background text-foreground",
        destructive: "border-destructive bg-destructive/10 text-foreground",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

export type AlertProps = React.HTMLAttributes<HTMLDivElement> &
  VariantProps<typeof alertVariants>;

export function Alert({ className, role, variant, ...props }: AlertProps) {
  return (
    <div
      role={role ?? (variant === "destructive" ? "alert" : "status")}
      className={cn(alertVariants({ variant }), className)}
      {...props}
    />
  );
}

export function AlertTitle({
  className,
  ...props
}: React.HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h5
      className={cn(
        "mb-1 font-semibold leading-none tracking-tight",
        className,
      )}
      {...props}
    />
  );
}

export function AlertDescription({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn("text-sm leading-relaxed", className)} {...props} />
  );
}

export { alertVariants };

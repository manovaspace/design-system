"use client";

import { cva, type VariantProps } from "class-variance-authority";
import type * as React from "react";

import { cn } from "./lib/utils.js";
import {
  Toast as PrimitiveToast,
  ToastAction as PrimitiveToastAction,
  ToastClose as PrimitiveToastClose,
  ToastDescription as PrimitiveToastDescription,
  ToastProvider as PrimitiveToastProvider,
  ToastTitle as PrimitiveToastTitle,
  ToastViewport as PrimitiveToastViewport,
} from "./primitives/toast.js";

const toastVariants = cva("", {
  variants: {
    variant: {
      default: "border bg-background text-foreground",
      success:
        "border-[color-mix(in_oklab,var(--primary)_35%,var(--border))] bg-background text-foreground",
      destructive:
        "destructive group border-destructive bg-destructive text-destructive-foreground",
    },
  },
  defaultVariants: {
    variant: "default",
  },
});

export function ToastProvider(
  props: React.ComponentProps<typeof PrimitiveToastProvider>,
) {
  return <PrimitiveToastProvider {...props} />;
}

export function ToastViewport({
  className,
  ...props
}: React.ComponentProps<typeof PrimitiveToastViewport>) {
  return <PrimitiveToastViewport className={className} {...props} />;
}

export function Toast({
  className,
  variant,
  ...props
}: React.ComponentProps<typeof PrimitiveToast> &
  VariantProps<typeof toastVariants>) {
  return (
    <PrimitiveToast
      className={cn(
        toastVariants({ variant }),
        "rounded-[var(--radius-xl)] shadow-[var(--shadow-lg)]",
        className,
      )}
      {...props}
    />
  );
}

export function ToastTitle(
  props: React.ComponentProps<typeof PrimitiveToastTitle>,
) {
  return <PrimitiveToastTitle {...props} />;
}

export function ToastDescription(
  props: React.ComponentProps<typeof PrimitiveToastDescription>,
) {
  return <PrimitiveToastDescription {...props} />;
}

export function ToastClose(
  props: React.ComponentProps<typeof PrimitiveToastClose>,
) {
  return <PrimitiveToastClose {...props} />;
}

export function ToastAction(
  props: React.ComponentProps<typeof PrimitiveToastAction>,
) {
  return <PrimitiveToastAction {...props} />;
}

export type ToastProps = React.ComponentProps<typeof Toast>;
export type ToastActionElement = React.ReactElement<typeof ToastAction>;
export type ToastVariant = NonNullable<
  VariantProps<typeof toastVariants>["variant"]
>;

export { toastVariants };

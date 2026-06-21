"use client";

import type * as React from "react";

import { cn } from "./lib/utils.js";
import {
  Dialog as PrimitiveDialog,
  DialogClose as PrimitiveDialogClose,
  DialogContent as PrimitiveDialogContent,
  DialogDescription as PrimitiveDialogDescription,
  DialogFooter as PrimitiveDialogFooter,
  DialogHeader as PrimitiveDialogHeader,
  DialogTitle as PrimitiveDialogTitle,
  DialogTrigger as PrimitiveDialogTrigger,
} from "./primitives/dialog.js";

export function Dialog(props: React.ComponentProps<typeof PrimitiveDialog>) {
  return <PrimitiveDialog {...props} />;
}

export function DialogTrigger(
  props: React.ComponentProps<typeof PrimitiveDialogTrigger>,
) {
  return <PrimitiveDialogTrigger {...props} />;
}

export function DialogClose(
  props: React.ComponentProps<typeof PrimitiveDialogClose>,
) {
  return <PrimitiveDialogClose {...props} />;
}

export function DialogTitle(
  props: React.ComponentProps<typeof PrimitiveDialogTitle>,
) {
  return <PrimitiveDialogTitle {...props} />;
}

export function DialogDescription(
  props: React.ComponentProps<typeof PrimitiveDialogDescription>,
) {
  return <PrimitiveDialogDescription {...props} />;
}

export function DialogContent({
  className,
  ...props
}: React.ComponentProps<typeof PrimitiveDialogContent>) {
  return (
    <PrimitiveDialogContent
      className={cn(
        "w-[min(100%,22rem)] rounded-[var(--radius-xl)] p-0 shadow-[var(--shadow-lg)]",
        className,
      )}
      {...props}
    />
  );
}

export function DialogHeader({
  className,
  ...props
}: React.ComponentProps<typeof PrimitiveDialogHeader>) {
  return (
    <PrimitiveDialogHeader
      className={cn("gap-1 p-4 text-start", className)}
      {...props}
    />
  );
}

export function DialogFooter({
  className,
  ...props
}: React.ComponentProps<typeof PrimitiveDialogFooter>) {
  return <PrimitiveDialogFooter className={cn("p-4", className)} {...props} />;
}

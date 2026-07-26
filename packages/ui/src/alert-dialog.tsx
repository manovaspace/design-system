"use client";

import type * as React from "react";

import { cn } from "./lib/utils.js";
import {
  AlertDialog as PrimitiveAlertDialog,
  AlertDialogAction as PrimitiveAlertDialogAction,
  AlertDialogCancel as PrimitiveAlertDialogCancel,
  AlertDialogContent as PrimitiveAlertDialogContent,
  AlertDialogDescription as PrimitiveAlertDialogDescription,
  AlertDialogFooter as PrimitiveAlertDialogFooter,
  AlertDialogHeader as PrimitiveAlertDialogHeader,
  AlertDialogTitle as PrimitiveAlertDialogTitle,
  AlertDialogTrigger as PrimitiveAlertDialogTrigger,
} from "./primitives/alert-dialog.js";

export function AlertDialog(
  props: React.ComponentProps<typeof PrimitiveAlertDialog>,
) {
  return <PrimitiveAlertDialog {...props} />;
}

export function AlertDialogTrigger(
  props: React.ComponentProps<typeof PrimitiveAlertDialogTrigger>,
) {
  return <PrimitiveAlertDialogTrigger {...props} />;
}

export function AlertDialogTitle(
  props: React.ComponentProps<typeof PrimitiveAlertDialogTitle>,
) {
  return <PrimitiveAlertDialogTitle {...props} />;
}

export function AlertDialogDescription(
  props: React.ComponentProps<typeof PrimitiveAlertDialogDescription>,
) {
  return <PrimitiveAlertDialogDescription {...props} />;
}

export function AlertDialogAction(
  props: React.ComponentProps<typeof PrimitiveAlertDialogAction>,
) {
  return <PrimitiveAlertDialogAction {...props} />;
}

export function AlertDialogCancel(
  props: React.ComponentProps<typeof PrimitiveAlertDialogCancel>,
) {
  return <PrimitiveAlertDialogCancel {...props} />;
}

export function AlertDialogContent({
  className,
  ...props
}: React.ComponentProps<typeof PrimitiveAlertDialogContent>) {
  return (
    <PrimitiveAlertDialogContent
      className={cn(
        "w-[min(100%,22rem)] rounded-[var(--radius-xl)] p-0 shadow-[var(--shadow-lg)]",
        className,
      )}
      {...props}
    />
  );
}

export function AlertDialogHeader({
  className,
  ...props
}: React.ComponentProps<typeof PrimitiveAlertDialogHeader>) {
  return (
    <PrimitiveAlertDialogHeader
      className={cn("gap-1 p-4 text-start", className)}
      {...props}
    />
  );
}

export function AlertDialogFooter({
  className,
  ...props
}: React.ComponentProps<typeof PrimitiveAlertDialogFooter>) {
  return (
    <PrimitiveAlertDialogFooter className={cn("p-4", className)} {...props} />
  );
}

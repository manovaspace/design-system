"use client";

import type * as React from "react";

import { cn } from "./lib/utils.js";
import {
  Sheet as PrimitiveSheet,
  SheetClose as PrimitiveSheetClose,
  SheetContent as PrimitiveSheetContent,
  SheetDescription as PrimitiveSheetDescription,
  SheetFooter as PrimitiveSheetFooter,
  SheetHeader as PrimitiveSheetHeader,
  SheetTitle as PrimitiveSheetTitle,
  SheetTrigger as PrimitiveSheetTrigger,
} from "./primitives/sheet.js";

export function Sheet(props: React.ComponentProps<typeof PrimitiveSheet>) {
  return <PrimitiveSheet {...props} />;
}

export function SheetTrigger(
  props: React.ComponentProps<typeof PrimitiveSheetTrigger>,
) {
  return <PrimitiveSheetTrigger {...props} />;
}

export function SheetClose(
  props: React.ComponentProps<typeof PrimitiveSheetClose>,
) {
  return <PrimitiveSheetClose {...props} />;
}

export function SheetTitle(
  props: React.ComponentProps<typeof PrimitiveSheetTitle>,
) {
  return <PrimitiveSheetTitle {...props} />;
}

export function SheetDescription(
  props: React.ComponentProps<typeof PrimitiveSheetDescription>,
) {
  return <PrimitiveSheetDescription {...props} />;
}

export function SheetContent({
  className,
  side = "right",
  ...props
}: React.ComponentProps<typeof PrimitiveSheetContent>) {
  return (
    <PrimitiveSheetContent
      side={side}
      className={cn(
        "rounded-none border border-border shadow-[var(--shadow-lg)]",
        className,
      )}
      {...props}
    />
  );
}

export function SheetHeader({
  className,
  ...props
}: React.ComponentProps<typeof PrimitiveSheetHeader>) {
  return (
    <PrimitiveSheetHeader
      className={cn("gap-1 text-start", className)}
      {...props}
    />
  );
}

export function SheetFooter({
  className,
  ...props
}: React.ComponentProps<typeof PrimitiveSheetFooter>) {
  return <PrimitiveSheetFooter className={className} {...props} />;
}

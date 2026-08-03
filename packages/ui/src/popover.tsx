"use client";

import type * as React from "react";

import { cn } from "./lib/utils.js";
import {
  Popover as PrimitivePopover,
  PopoverAnchor as PrimitivePopoverAnchor,
  PopoverContent as PrimitivePopoverContent,
  PopoverTrigger as PrimitivePopoverTrigger,
} from "./primitives/popover.js";

export function Popover(props: React.ComponentProps<typeof PrimitivePopover>) {
  return <PrimitivePopover {...props} />;
}

export function PopoverTrigger(
  props: React.ComponentProps<typeof PrimitivePopoverTrigger>,
) {
  return <PrimitivePopoverTrigger {...props} />;
}

export function PopoverAnchor(
  props: React.ComponentProps<typeof PrimitivePopoverAnchor>,
) {
  return <PrimitivePopoverAnchor {...props} />;
}

export function PopoverContent({
  className,
  ...props
}: React.ComponentProps<typeof PrimitivePopoverContent>) {
  return (
    <PrimitivePopoverContent
      className={cn(
        "rounded-[var(--radius-lg)] shadow-[var(--shadow-md)]",
        className,
      )}
      {...props}
    />
  );
}

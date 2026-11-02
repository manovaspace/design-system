"use client";

import type * as React from "react";

import { cn } from "./lib/utils.js";
import {
  Select as PrimitiveSelect,
  SelectContent as PrimitiveSelectContent,
  SelectGroup as PrimitiveSelectGroup,
  SelectItem as PrimitiveSelectItem,
  SelectLabel as PrimitiveSelectLabel,
  SelectTrigger as PrimitiveSelectTrigger,
  SelectValue as PrimitiveSelectValue,
} from "./primitives/select.js";

export function Select(props: React.ComponentProps<typeof PrimitiveSelect>) {
  return <PrimitiveSelect {...props} />;
}

export function SelectTrigger({
  className,
  ...props
}: React.ComponentProps<typeof PrimitiveSelectTrigger>) {
  return (
    <PrimitiveSelectTrigger
      className={cn(
        "h-10 rounded-[var(--radius-lg)] px-[var(--space-3)] text-[length:var(--font-size-body)]",
        className,
      )}
      {...props}
    />
  );
}

export function SelectValue(
  props: React.ComponentProps<typeof PrimitiveSelectValue>,
) {
  return <PrimitiveSelectValue {...props} />;
}

export function SelectContent({
  className,
  ...props
}: React.ComponentProps<typeof PrimitiveSelectContent>) {
  return (
    <PrimitiveSelectContent
      className={cn("rounded-[var(--radius-lg)]", className)}
      {...props}
    />
  );
}

export function SelectItem({
  className,
  ...props
}: React.ComponentProps<typeof PrimitiveSelectItem>) {
  return <PrimitiveSelectItem className={className} {...props} />;
}

export function SelectLabel(
  props: React.ComponentProps<typeof PrimitiveSelectLabel>,
) {
  return <PrimitiveSelectLabel {...props} />;
}

export function SelectGroup(
  props: React.ComponentProps<typeof PrimitiveSelectGroup>,
) {
  return <PrimitiveSelectGroup {...props} />;
}

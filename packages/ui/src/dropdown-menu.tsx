"use client";

import type * as React from "react";

import { cn } from "./lib/utils.js";
import {
  DropdownMenu as PrimitiveDropdownMenu,
  DropdownMenuCheckboxItem as PrimitiveDropdownMenuCheckboxItem,
  DropdownMenuContent as PrimitiveDropdownMenuContent,
  DropdownMenuGroup as PrimitiveDropdownMenuGroup,
  DropdownMenuItem as PrimitiveDropdownMenuItem,
  DropdownMenuLabel as PrimitiveDropdownMenuLabel,
  DropdownMenuPortal as PrimitiveDropdownMenuPortal,
  DropdownMenuRadioGroup as PrimitiveDropdownMenuRadioGroup,
  DropdownMenuRadioItem as PrimitiveDropdownMenuRadioItem,
  DropdownMenuSeparator as PrimitiveDropdownMenuSeparator,
  DropdownMenuShortcut as PrimitiveDropdownMenuShortcut,
  DropdownMenuSub as PrimitiveDropdownMenuSub,
  DropdownMenuSubContent as PrimitiveDropdownMenuSubContent,
  DropdownMenuSubTrigger as PrimitiveDropdownMenuSubTrigger,
  DropdownMenuTrigger as PrimitiveDropdownMenuTrigger,
} from "./primitives/dropdown-menu.js";

/** @experimental */
export function DropdownMenu(
  props: React.ComponentProps<typeof PrimitiveDropdownMenu>,
) {
  return <PrimitiveDropdownMenu {...props} />;
}

/** @experimental */
export function DropdownMenuTrigger(
  props: React.ComponentProps<typeof PrimitiveDropdownMenuTrigger>,
) {
  return <PrimitiveDropdownMenuTrigger {...props} />;
}

/** @experimental */
export function DropdownMenuContent({
  className,
  ...props
}: React.ComponentProps<typeof PrimitiveDropdownMenuContent>) {
  return (
    <PrimitiveDropdownMenuContent
      className={cn(
        "rounded-[var(--radius-lg)] shadow-[var(--shadow-md)]",
        className,
      )}
      {...props}
    />
  );
}

/** @experimental */
export function DropdownMenuItem(
  props: React.ComponentProps<typeof PrimitiveDropdownMenuItem>,
) {
  return <PrimitiveDropdownMenuItem {...props} />;
}

/** @experimental */
export function DropdownMenuGroup(
  props: React.ComponentProps<typeof PrimitiveDropdownMenuGroup>,
) {
  return <PrimitiveDropdownMenuGroup {...props} />;
}

/** @experimental */
export function DropdownMenuLabel(
  props: React.ComponentProps<typeof PrimitiveDropdownMenuLabel>,
) {
  return <PrimitiveDropdownMenuLabel {...props} />;
}

/** @experimental */
export function DropdownMenuSeparator(
  props: React.ComponentProps<typeof PrimitiveDropdownMenuSeparator>,
) {
  return <PrimitiveDropdownMenuSeparator {...props} />;
}

/** @experimental */
export function DropdownMenuShortcut(
  props: React.ComponentProps<typeof PrimitiveDropdownMenuShortcut>,
) {
  return <PrimitiveDropdownMenuShortcut {...props} />;
}

export {
  PrimitiveDropdownMenuCheckboxItem as DropdownMenuCheckboxItem,
  PrimitiveDropdownMenuPortal as DropdownMenuPortal,
  PrimitiveDropdownMenuRadioGroup as DropdownMenuRadioGroup,
  PrimitiveDropdownMenuRadioItem as DropdownMenuRadioItem,
  PrimitiveDropdownMenuSub as DropdownMenuSub,
  PrimitiveDropdownMenuSubContent as DropdownMenuSubContent,
  PrimitiveDropdownMenuSubTrigger as DropdownMenuSubTrigger,
};

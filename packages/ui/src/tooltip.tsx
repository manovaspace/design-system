"use client";

import type * as React from "react";

import { cn } from "./lib/utils.js";
import {
  Tooltip as PrimitiveTooltip,
  TooltipContent as PrimitiveTooltipContent,
  TooltipProvider as PrimitiveTooltipProvider,
  TooltipTrigger as PrimitiveTooltipTrigger,
} from "./primitives/tooltip.js";

export function TooltipProvider(
  props: React.ComponentProps<typeof PrimitiveTooltipProvider>,
) {
  return <PrimitiveTooltipProvider {...props} />;
}

export function Tooltip(
  props: React.ComponentProps<typeof PrimitiveTooltip>,
) {
  return <PrimitiveTooltip {...props} />;
}

export function TooltipTrigger(
  props: React.ComponentProps<typeof PrimitiveTooltipTrigger>,
) {
  return <PrimitiveTooltipTrigger {...props} />;
}

export function TooltipContent({
  className,
  ...props
}: React.ComponentProps<typeof PrimitiveTooltipContent>) {
  return (
    <PrimitiveTooltipContent
      className={cn("shadow-[var(--shadow-sm)]", className)}
      {...props}
    />
  );
}

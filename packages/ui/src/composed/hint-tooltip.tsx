"use client";

import type { ReactNode } from "react";

import { cn } from "../lib/utils";
import { Tooltip, TooltipContent, TooltipTrigger } from "../tooltip";

type HintTooltipSide = "top" | "right" | "bottom" | "left";
type HintTooltipAlign = "start" | "center" | "end";

export type HintTooltipProps = {
  /** Short hint shown on hover and keyboard focus. */
  label: ReactNode;
  children: ReactNode;
  side?: HintTooltipSide;
  align?: HintTooltipAlign;
  contentClassName?: string;
  /** Per-tooltip delay override (ms). Provider default applies when omitted. */
  delayDuration?: number;
};

/**
 * Accessible hover/focus hint for icon buttons and compact controls.
 * Wrap the interactive element; keep `aria-label` on the control for SR parity.
 */
export function HintTooltip({
  label,
  children,
  side = "top",
  align = "center",
  contentClassName,
  delayDuration,
}: HintTooltipProps) {
  return (
    <Tooltip delayDuration={delayDuration}>
      <TooltipTrigger asChild>{children}</TooltipTrigger>
      <TooltipContent
        side={side}
        align={align}
        className={cn("text-center", contentClassName)}
      >
        {label}
      </TooltipContent>
    </Tooltip>
  );
}

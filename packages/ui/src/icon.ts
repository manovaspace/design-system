import type { ComponentProps } from "react";

import { cn } from "./lib/utils.js";

const ICON_SIZES = {
  xs: "size-3.5",
  sm: "size-4",
  md: "size-5",
  lg: "size-6",
  xl: "size-8",
} as const;

export type IconProps = ComponentProps<"svg"> & {
  size?: keyof typeof ICON_SIZES;
  /** When true, Lucide icon uses fill for emphasis (solid-style). */
  filled?: boolean;
};

/** Consistent sizing for Lucide/react-icons (`currentColor`). */
export function iconProps({
  size = "md",
  filled = false,
  className,
  ...props
}: IconProps): IconProps {
  return {
    "aria-hidden": props["aria-hidden"] ?? true,
    className: cn(
      ICON_SIZES[size],
      filled && "fill-current",
      "shrink-0",
      className,
    ),
    ...props,
  };
}

export { ICON_SIZES };

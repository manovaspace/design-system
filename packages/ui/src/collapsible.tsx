"use client";

import type { ComponentProps } from "react";

export {
  Collapsible,
  CollapsibleTrigger,
} from "./primitives/collapsible.js";

import { CollapsibleContent as PrimitiveCollapsibleContent } from "./primitives/collapsible.js";

export type CollapsibleContentProps = ComponentProps<
  typeof PrimitiveCollapsibleContent
> & {
  /** ponytail: Base UI compat — maps to Radix forceMount when true. */
  keepMounted?: boolean;
};

export function CollapsibleContent({
  keepMounted,
  ...props
}: CollapsibleContentProps) {
  return (
    <PrimitiveCollapsibleContent
      forceMount={keepMounted ? true : undefined}
      {...props}
    />
  );
}

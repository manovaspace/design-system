import type * as React from "react";

import { cn } from "./lib/utils.js";
import {
  PageShell as PrimitivePageShell,
  pageShellContentVariants,
} from "./primitives/page-shell.js";

/** @experimental */
export type PageShellProps = React.ComponentProps<typeof PrimitivePageShell>;

/**
 * Mobile-first centered page shell with safe-area padding.
 * @experimental
 */
export function PageShell({ className, ...props }: PageShellProps) {
  return <PrimitivePageShell className={cn(className)} {...props} />;
}

export { pageShellContentVariants };

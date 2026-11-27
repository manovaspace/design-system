import type * as React from "react";

import { cn } from "./lib/utils.js";
import { TabsTrigger as PrimitiveTabsTrigger } from "./primitives/tabs.js";

export { Tabs, TabsContent, TabsList } from "./primitives/tabs.js";

/**
 * Tab trigger. Inactive tabs use `text-muted-foreground` (a contrast-checked
 * token pair) instead of the primitive's `text-foreground/60` opacity blend,
 * which drops below 4.5:1 on tinted tab lists.
 */
export function TabsTrigger({
  className,
  ...props
}: React.ComponentProps<typeof PrimitiveTabsTrigger>) {
  return (
    <PrimitiveTabsTrigger
      className={cn("text-muted-foreground", className)}
      {...props}
    />
  );
}
